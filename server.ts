import express from "express";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "neurocv-ai-super-secret-key-2026";

// Initialize Gemini client on server
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json({ limit: "50mb" }));

// --- REAL RETRIEVAL-AUGMENTED GENERATION (RAG) PIPELINE COMPONENTRY ---

/**
 * Calculates the Cosine Similarity between two dense vector arrays.
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Intelligent, resume-specific text chunker.
 * Groups sentences and bullet points into semantically coherent blocks.
 */
function chunkResume(text: string): string[] {
  if (!text) return [];
  const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);
  const chunks: string[] = [];
  let currentChunk = "";
  
  for (const line of lines) {
    if (currentChunk.length + line.length > 500) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = line;
    } else {
      currentChunk += (currentChunk ? "\n" : "") + line;
    }
  }
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  if (chunks.length === 0) {
    return [text];
  }
  return chunks;
}

/**
 * Uses Gemini's Multimodal API to parse and transcribe pdf content to clean, structured markdown.
 */
async function extractTextFromPdf(base64Data: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: base64Data
          }
        },
        "Extract and transcribe the complete textual content of this resume PDF. Maintain all bullet points, experience details, technology listings, and structures precisely in clear markdown text."
      ]
    });
    if (response.text) {
      return response.text;
    }
    throw new Error("No text returned from PDF transcription");
  } catch (err) {
    console.error("PDF text extraction failed:", err);
    throw err;
  }
}

/**
 * Extracts distinct semantic search queries from the Job Description for multi-query RAG retrieval.
 */
async function extractSearchQueries(jobDescription: string): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Extract exactly 4 high-priority semantic search terms or core requirement domains from this Job Description (e.g. system concurrency, particular databases/cache, testing frameworks, cloud orchestration, streaming etc.). Return them as a simple array list of string items.
      
      JOB DESCRIPTION:
      ${jobDescription}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    if (response.text) {
      const queries = JSON.parse(response.text.trim());
      if (Array.isArray(queries) && queries.length > 0) {
        return queries;
      }
    }
  } catch (err) {
    console.error("Failed to extract search queries from JD, falling back to lines:", err);
  }
  
  // Fallback queries
  return [
    "distributed systems microservices architecture",
    "databases caching scaling sql",
    "cloud devops containers aws docker",
    "testing continuous integration coverage metrics"
  ];
}

/**
 * Real FAISS-style In-Memory Flat Vector Index (IndexFlatIP).
 * Houses chunk content, metadata, and dense embeddings to execute nearest-neighbor queries.
 */
class FAISSVectorStore {
  private index: { id: string; content: string; embedding: number[]; metadata?: any }[] = [];

  constructor() {}

  public addDocuments(documents: { content: string; embedding: number[]; metadata?: any }[]) {
    documents.forEach((doc, idx) => {
      this.index.push({
        id: `chunk-${this.index.length + idx}`,
        content: doc.content,
        embedding: doc.embedding,
        metadata: doc.metadata
      });
    });
  }

  public similaritySearch(queryVector: number[], k: number = 4): { content: string; score: number; metadata?: any }[] {
    const scored = this.index.map(item => {
      const score = cosineSimilarity(queryVector, item.embedding);
      return {
        content: item.content,
        score,
        metadata: item.metadata
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k);
  }
}

/**
 * LangChain style Retrieval QA Orchestrator.
 * Manages ingestion, document chunking, embeddings generation, indexing, and context querying.
 */
class LangChainRetriever {
  private vectorStore: FAISSVectorStore;

  constructor(private geminiClient: any) {
    this.vectorStore = new FAISSVectorStore();
  }

  private async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.geminiClient.models.embedContent({
        model: "text-embedding-004",
        contents: text
      });
      if (response.embedding?.values) {
        return response.embedding.values;
      }
      throw new Error("No embedding values returned");
    } catch (err) {
      console.warn("text-embedding-004 failed, trying fallback gemini-embedding-2-preview...", err);
      const fallback = await this.geminiClient.models.embedContent({
        model: "gemini-embedding-2-preview",
        contents: text
      });
      if (fallback.embedding?.values) {
        return fallback.embedding.values;
      }
      throw new Error("Failed to generate embedding with either text-embedding-004 or gemini-embedding-2-preview");
    }
  }

  public async ingestDocument(text: string): Promise<void> {
    const chunks = chunkResume(text);
    console.log(`Ingesting and embedding ${chunks.length} chunks into FAISS vector store...`);
    
    // Generate embeddings in parallel
    const embeddedDocs = await Promise.all(
      chunks.map(async (chunk, index) => {
        const embedding = await this.getEmbedding(chunk);
        return {
          content: chunk,
          embedding,
          metadata: { chunkIndex: index }
        };
      })
    );

    this.vectorStore.addDocuments(embeddedDocs);
  }

  public async retrieve(query: string, k: number = 4): Promise<{ content: string; score: number }[]> {
    const queryVector = await this.getEmbedding(query);
    return this.vectorStore.similaritySearch(queryVector, k);
  }
}

// Local JSON Database initialization
const DB_PATH = path.join(process.cwd(), "local_db.json");

function initDb() {
  if (fs.existsSync(DB_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
      if (data.users && data.resumes && data.analyses) {
        return data;
      }
    } catch (e) {
      console.error("Error reading database file, recreating.", e);
    }
  }

  // Create default mock data to show an enterprise dashboard instantly!
  const defaultDb = {
    users: [
      {
        id: "demo-user-id",
        email: "demo@neurocv.ai",
        name: "Alex Mercer",
        password: "password123", // Simple plain storage for demo simplicity
        title: "Senior Backend Engineer",
        createdAt: new Date().toISOString()
      }
    ],
    resumes: [
      {
        id: "demo-resume-id",
        userId: "demo-user-id",
        fileName: "Alex_Mercer_Backend_Systems_Resume.pdf",
        fileType: "application/pdf",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
        parsedText: `ALEX MERCER
Senior Backend Engineer | Distributed Systems Specialist
alex@mercer.dev | github.com/alexmercer | linkedin.com/in/alexmercer

PROFESSIONAL SUMMARY
Senior Backend Engineer with 6+ years of experience designing, scaling, and maintaining high-throughput distributed systems. Proven track record of optimizing database queries, implementing stream processing pipelines (Kafka), and building robust Microservices in Java (Spring Boot) and Python (FastAPI). Passionate about developer efficiency, cloud infrastructure (AWS, Docker, Kubernetes), and mentoring junior engineers.

TECHNICAL SKILLS
- Languages: Java, Python, Go, SQL, Bash
- Frameworks & Libraries: Spring Boot, FastAPI, Flask, Hibernate, Gin, LangChain, NumPy
- Databases: PostgreSQL, Redis, Elasticsearch, DynamoDB
- Streaming & Messaging: Apache Kafka, RabbitMQ, AWS SQS
- DevOps & Cloud: AWS (EC2, ECS, RDS, S3, CloudWatch), Docker, Kubernetes, Terraform, CI/CD
- Concepts: Microservices, Event-Driven Architecture, REST, gRPC, System Design, RAG

EXPERIENCE
Lead Backend Engineer | CloudScale Tech | 2023 - Present
- Architected and built a high-throughput event streaming data ingestion platform handling 15,000+ RPS using Spring Boot, Apache Kafka, and PostgreSQL, reducing latency by 42%.
- Integrated OpenAI and LangChain RAG pipeline into the enterprise knowledge manager to perform semantic search across internal wikis, increasing search accuracy by 60%.
- Led a migration of legacy monolithic system into Dockerized Microservices orchestrated via Kubernetes on AWS, cutting server costs by 30% and improving scaling times.
- Mentored 4 junior engineers, established code review guidelines, and introduced comprehensive CI/CD pipelines.

Software Engineer | FinQuery Systems | 2020 - 2023
- Designed and maintained Python FastAPI backend microservices for financial transaction processing and high-performance querying, handling $10M+ transaction volume daily.
- Implemented multi-level caching strategies using Redis, improving database query speeds by 70% and offloading PostgreSQL main database stress.
- Optimized PostgreSQL database indexes and rewritten complex SQL queries, saving approximately 18 engineering hours weekly in database performance troubleshooting.
- Developed gRPC communication layer between internal high-frequency services, replacing REST endpoints and decreasing internal round-trip network overhead by 50%.`
      }
    ],
    analyses: [
      {
        id: "demo-analysis-id",
        userId: "demo-user-id",
        resumeId: "demo-resume-id",
        resumeFileName: "Alex_Mercer_Backend_Systems_Resume.pdf",
        jobDescription: `We are looking for a Senior Backend Software Engineer with extensive experience in Distributed Systems. 
The ideal candidate will design high-throughput, fault-tolerant microservices and implement real-time stream processing pipelines.

Required Skills:
- Professional experience in Java (Spring Boot) or Python (FastAPI/Django)
- Experience building event-driven stream processing pipelines with Apache Kafka or similar messaging brokers
- Database optimization in relational systems like PostgreSQL and in-memory caches like Redis
- Cloud computing with AWS and container orchestration with Docker/Kubernetes
- Familiarity with AI tools, LangChain, or LLM integrations is a strong plus
- Deep understanding of System Design, microservice architectures, and gRPC communication`,
        createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
        scores: {
          atsScore: 89,
          semanticMatch: 92,
          keywordCoverage: 85,
          engineeringMaturity: 90,
          clarity: 94,
          hiringConfidence: 91
        },
        recruiterFeedback: {
          strengths: [
            "Strong command of distributed systems, microservices design, and high-throughput architectures (15k+ RPS).",
            "Real-world enterprise experience with stream processing (Apache Kafka) and relational databases (PostgreSQL/Redis caching).",
            "Direct practical knowledge of modern AI features and RAG pipelines using LangChain and OpenAI, which matches our plus requirements."
          ],
          weaknesses: [
            "No mention of Infrastructure as Code (IaC) tools like Terraform in actual experience bullet points, though listed in skills.",
            "Lacks detailed focus on secure coding practices or financial compliance (even though experience at FinQuery is listed).",
            "Limited explicit mention of Go-based services, though listed in languages."
          ],
          rejectionReasons: [
            "Could face pushback if the role requires intense AWS IAM or security compliance expertise that is not highlighted.",
            "Lack of detailed testing frameworks (JUnit, PyTest) or CI/CD tooling listed inside specific bullet achievements."
          ],
          missingBackendSkills: ["Go (practical experience bullet)", "JUnit / PyTest (Testing frameworks)"],
          missingCloudSkills: ["Terraform (Infrastructure as Code details)", "AWS Security/IAM Compliance Tools"],
          impactSuggestions: [
            "Quantify FinQuery achievements with security improvements (e.g., 'Implemented secure transactions adhering to PCI-DSS').",
            "Add a bullet point under CloudScale demonstrating your Terraform use to provision the AWS/Kubernetes architecture.",
            "Explicitly list test coverage statistics (e.g., 'achieved 92% unit test coverage using JUnit and PyTest')."
          ],
          hiringRecommendation: "Proceed",
          confidenceLevel: 91,
          engineeringConcerns: [
            "No mention of Infrastructure as Code (IaC) tools like Terraform in actual experience bullet points, though listed in skills.",
            "Lacks detailed focus on secure coding practices or financial compliance (even though experience at FinQuery is listed).",
            "Lack of detailed testing frameworks (JUnit, PyTest) or CI/CD tooling listed inside specific bullet achievements."
          ],
          missingProductionExperience: [
            "Terraform (Infrastructure as Code details)",
            "AWS Security/IAM Compliance Tools",
            "JUnit / PyTest (Testing frameworks)"
          ],
          suggestedInterviewFocus: [
            "Quantify FinQuery achievements with security improvements (e.g., 'Implemented secure transactions adhering to PCI-DSS').",
            "Add a bullet point under CloudScale demonstrating your Terraform use to provision the AWS/Kubernetes architecture.",
            "Explicitly list test coverage statistics (e.g., 'achieved 92% unit test coverage using JUnit and PyTest')."
          ],
          decisionReasoning: "Candidate demonstrates strong command over distributed architectures and real-time Kafka event streams. However, we have minor concerns regarding their hands-on production experience with automated testing and Terraform configurations, which are critical for our self-healing AWS infrastructure.",
          engineeringReadiness: {
            backend: {
              title: "API & Backend Systems",
              extracted: "Architected high-throughput REST APIs in Python (FastAPI); built monolithic endpoints, rewritten SQLAlchemy query latencies.",
              reasoning: "Candidate demonstrates strong proficiency with modern pythonic backend design, microservice isolation principles, and custom object-relational mapping models.",
              confidence: 95,
              recommendation: "Proceed with FastAPI and REST system assessments.",
              impact: "Allows the development team to launch secure, sub-second API routes quickly using FastAPI, improving velocity parameters."
            },
            db: {
              title: "Databases & Caching",
              extracted: "Optimized complex PostgreSQL indexes; configured Redis caching clusters, reducing direct DB queries by 45%.",
              reasoning: "Demonstrates sound practical understanding of caching layers and index optimization. The candidate successfully offloads relational loads from the primary Postgres engine.",
              confidence: 90,
              recommendation: "Proceed with relational optimization and Redis key schema walkthrough.",
              impact: "Maximizes backend queries per second (QPS) and minimizes CPU/Memory database thread locks under peak traffic loads."
            },
            distributed: {
              title: "Distributed Systems & Concurrency",
              extracted: "Architected event-driven data ingestion platform with Spring Boot and Apache Kafka, handling 15,000+ RPS.",
              reasoning: "Shows direct production-grade Kafka publisher/consumer group design. Capable of handling high throughput distributed workloads.",
              confidence: 88,
              recommendation: "Proceed with distributed systems design partition scaling queries.",
              impact: "Ensures no event drops during streaming bursts and decouples microservice boundaries safely."
            },
            cloud: {
              title: "Cloud & Infrastructure",
              extracted: "Dockerized microservices, basic AWS EC2 nodes, custom Bash blue/green restart scripts, Kubernetes orchestration.",
              reasoning: "The candidate is skilled in containerizing local services. However, there is a visible lack of declarative Infrastructure as Code (IaC) details, relying on manual scripts.",
              confidence: 72,
              recommendation: "Hold. Drill down on Terraform modules and container deployment cycles.",
              impact: "Manual scripts create drift risks, slow down rollback velocity, and limit auditability of cloud infrastructure changes."
            },
            testing: {
              title: "Testing & DevOps CI/CD",
              extracted: "PyTest automated suite setup; resolved 150+ timeout bugs, 80% test coverage across core calculations.",
              reasoning: "Proven test-driven development (TDD) principles. Excellent quantitative test coverage threshold but lacks clear evidence of continuous integration/delivery (CI/CD) pipelines.",
              confidence: 80,
              recommendation: "Hold. Verify CI pipeline experience and SonarQube quality gate patterns.",
              impact: "Manual deployment routines expose candidate's deliverable processes to human error and block automated regression validation gates."
            }
          }
        },
        skillGap: {
          matchedSkills: ["Java", "Spring Boot", "Python", "FastAPI", "Apache Kafka", "PostgreSQL", "Redis", "Docker", "Kubernetes", "AWS", "LangChain", "Microservices", "gRPC"],
          missingSkills: ["Terraform", "JUnit", "PyTest", "CI/CD tool specifics (Jenkins/GitHub Actions)"],
          recommendedSkills: ["Go (Golang)", "Elasticsearch", "AWS CloudFormation", "Prometheus/Grafana (Monitoring)"]
        },
        interviewQuestions: [
          {
            id: "q-1",
            category: "Distributed Systems & Kafka",
            question: "In your project handling 15,000+ RPS with Spring Boot and Kafka, how did you configure Kafka consumer groups and partitioning to ensure message ordering while maximizing processing throughput?",
            difficulty: "Advanced",
            expectedAnswer: [
              "Explanation of partition keys to route related messages to the same partition.",
              "Setting consumer count equal to partition count for maximum parallelism.",
              "Configuring consumer offset commits (acknowledgments) and managing duplicate processing (idempotency)."
            ],
            whySelected: "Selected to verify practical scaling limits of the candidate's core 15k RPS claim, ensuring they understand streaming partition assignment and ordering guarantees."
          },
          {
            id: "q-2",
            category: "System Design & Caching",
            question: "You mentioned using Redis to improve PostgreSQL query speeds by 70%. Can you discuss your cache invalidation strategy (e.g. Cache-Aside vs Write-Through) and how you handled cache stampede or Redis outage situations?",
            difficulty: "Advanced",
            expectedAnswer: [
              "Use of Cache-Aside strategy for high-performance financial data lookup.",
              "TTL configurations with random jitter to prevent cache stampede.",
              "Fallback mechanism where query goes directly to the database with rate limiting/circuit breaker in case Redis is down."
            ],
            whySelected: "Chosen to assess backend reliability awareness, cache invalidation pitfalls, and database offloading design in transaction-heavy environments."
          },
          {
            id: "q-3",
            category: "AI & RAG",
            question: "How did you design the LangChain RAG pipeline to search internal wikis? What embedding model and vector database did you use, and how did you resolve context length constraints of the LLM?",
            difficulty: "Intermediate",
            expectedAnswer: [
              "Chunking strategy (e.g., recursive character text splitter with overlap).",
              "Use of vector store (e.g., FAISS or PGVector) for similarity search.",
              "Semantic filtering and ranking top results to provide highly relevant context within the token limit."
            ],
            whySelected: "Selected to audit candidate's hands-on experience with LLM orchestration and RAG data pipeline tuning, which matches our high-priority AI initiative."
          },
          {
            id: "q-4",
            category: "Behavioral & Leadership",
            question: "As a Lead Backend Engineer, you migrated a monolithic financial system to microservices on Kubernetes. How did you align the team during this architectural shift, and how did you minimize production downtime?",
            difficulty: "Expert",
            expectedAnswer: [
              "Phased migration strategy (e.g. Strangler Fig Pattern) to replace modules incrementally.",
              "Defining clear interface boundaries (APIs) and running both in parallel.",
              "Fostering alignment through collaborative architecture sessions and automated CI/CD safeguards."
            ],
            whySelected: "Chosen to evaluate leadership maturity, team communication during transition phases, and legacy risk mitigation under high daily transaction volumes."
          }
        ],
        roadmap: [
          {
            month: "Month 1: Advanced DevOps & IaC Integration",
            topics: [
              { name: "Terraform Infrastructure Coding", details: "Write declarative configuration files to manage AWS networks, subnets, and EKS clusters dynamically.", status: "In Progress" },
              { name: "CI/CD Pipelines (GitHub Actions)", details: "Build production grade workflows to automate Docker image builds, vulnerability scanning (Trivy), and Kubernetes deploys.", status: "Not Started" }
            ]
          },
          {
            month: "Month 2: High Reliability & Monitoring",
            topics: [
              { name: "System Monitoring (Prometheus & Grafana)", details: "Set up performance metrics collection for JVM (Spring Boot) and Python services, visualizing RPS, error rates, and resource utilization.", status: "Not Started" },
              { name: "Distributed Tracing (OpenTelemetry / Jaeger)", details: "Implement end-to-end trace correlation IDs across microservice mesh to easily diagnose multi-hop latencies.", status: "Not Started" }
            ]
          },
          {
            month: "Month 3: Advanced AI & Search Scaling",
            topics: [
              { name: "Elasticsearch Clustering", details: "Implement cluster-sharded indexes for high speed full-text search and complex logs aggregation.", status: "Not Started" },
              { name: "Advanced RAG & Hybrid Search", details: "Combine standard keyword BM25 retrieval with dense semantic vectors to create highly precise document retrieval pipelines.", status: "Not Started" }
            ]
          }
        ],
        bulletImprovements: [
          {
            original: "Lead a migration of legacy monolithic system into Dockerized Microservices orchestrated via Kubernetes on AWS.",
            improved: "Spearheaded architectural transition of monolithic infrastructure into containerized Microservices using AWS EKS and Docker, improving system availability to 99.99% and reducing compute overhead by 30%.",
            impactScoreIncrease: 15,
            reason: "Quantified availability metrics (99.99%) and direct business impact (30% compute savings) while using strong verbs like 'Spearheaded' instead of 'Lead'."
          },
          {
            original: "Designed and maintained Python FastAPI backend microservices for financial transaction processing.",
            improved: "Engineered ultra-low-latency financial transaction microservices in Python (FastAPI), safely handling $10M+ in daily transaction throughput with 95th-percentile response times under 40ms.",
            impactScoreIncrease: 12,
            reason: "Includes precise SLA performance numbers (response times under 40ms) and highlights engineering rigor around low-latency microservices."
          }
        ]
      }
    ]
  };

  fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2), "utf-8");
  return defaultDb;
}

const db = initDb();

function saveDb() {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

// Authentication Middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Access token is required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}

// REST APIs
// 1. REGISTER
app.post("/api/auth/register", (req, res) => {
  const { email, password, name, title } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, password, and name are required." });
  }

  const existing = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "User with this email already exists." });
  }

  const newUser = {
    id: "user-" + Math.random().toString(36).substr(2, 9),
    email: email.toLowerCase(),
    password, // Plain for demo/preview database simplicity
    name,
    title: title || "Software Engineer",
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDb();

  const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name }, JWT_SECRET, { expiresIn: "30d" });

  const { password: _, ...userWithoutPassword } = newUser;
  res.json({ token, user: userWithoutPassword });
});

// 2. LOGIN
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "30d" });

  const { password: _, ...userWithoutPassword } = user;
  res.json({ token, user: userWithoutPassword });
});

// 3. GET HEALTH Check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", database: "connected", service: "NeuroCV AI Server" });
});

// 4. RESUME UPLOAD
app.post("/api/resume/upload", authenticateToken, (req: any, res) => {
  const { fileName, fileType, fileData, parsedText } = req.body;
  const userId = req.user.id;

  if (!fileName || !fileType) {
    return res.status(400).json({ error: "FileName and FileType are required." });
  }

  const newResume = {
    id: "resume-" + Math.random().toString(36).substr(2, 9),
    userId,
    fileName,
    fileType,
    uploadedAt: new Date().toISOString(),
    parsedText: parsedText || "" // Can be empty if we rely on Gemini to parse PDF directly, or filled by client text parser
  };

  db.resumes.push(newResume);
  saveDb();

  res.json(newResume);
});

// 5. RESUME ANALYZE (With real Gemini RAG/Semantics calling!)
app.post("/api/resume/analyze", authenticateToken, async (req: any, res) => {
  const { resumeId, jobDescription, pdfBase64, manualText } = req.body;
  const userId = req.user.id;

  if (!resumeId && !pdfBase64 && !manualText) {
    return res.status(400).json({ error: "A resume (or manual text) and job description are required." });
  }

  if (!jobDescription) {
    return res.status(400).json({ error: "Job description is required for analysis." });
  }

  let resumeText = manualText || "";
  let resumeFileName = "Manual_Resume.txt";

  if (resumeId) {
    const resumeObj = db.resumes.find((r: any) => r.id === resumeId && r.userId === userId);
    if (!resumeObj) {
      return res.status(404).json({ error: "Resume not found." });
    }
    resumeText = resumeObj.parsedText || "";
    resumeFileName = resumeObj.fileName;
  }

  // Multimodal Text Extraction from PDF if base64 is present
  if (pdfBase64) {
    try {
      console.log("PDF base64 provided. Running native multimodal transcription...");
      const cleanBase64 = pdfBase64.includes(",") ? pdfBase64.split(",")[1] : pdfBase64;
      const extracted = await extractTextFromPdf(cleanBase64);
      if (extracted) {
        resumeText = extracted;
        console.log("PDF transcription successful. Length of text:", resumeText.length);
      }
    } catch (parseErr: any) {
      console.error("Multimodal PDF text extraction failed:", parseErr);
      if (!resumeText) {
        return res.status(500).json({
          error: "Failed to parse PDF resume text. Please provide manual text or check your API key.",
          details: parseErr.message
        });
      }
    }
  }

  if (!resumeText.trim()) {
    return res.status(400).json({ error: "Resume text content is empty or could not be loaded." });
  }

  try {
    console.log("Initializing real RAG pipeline...");
    const retriever = new LangChainRetriever(ai);
    
    // Ingest, chunk, embed, and index resume in FAISS Vector Store
    await retriever.ingestDocument(resumeText);

    // Multi-Query Retrieval from JD requirements
    const searchQueries = await extractSearchQueries(jobDescription);
    console.log("Extracted semantic JD queries:", searchQueries);

    const allRetrieved: { content: string; score: number }[] = [];
    for (const query of searchQueries) {
      const results = await retriever.retrieve(query, 3);
      allRetrieved.push(...results);
    }

    // Context Ranking & De-duplication
    const uniqueChunksMap = new Map<string, number>();
    for (const item of allRetrieved) {
      const existingScore = uniqueChunksMap.get(item.content) || 0;
      if (item.score > existingScore) {
        uniqueChunksMap.set(item.content, item.score);
      }
    }

    const rankedChunks = Array.from(uniqueChunksMap.entries())
      .map(([content, score]) => ({ content, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Select top-5 ranked chunks as context

    const retrievedContext = rankedChunks
      .map((item, index) => `[Ranked Context Chunk #${index + 1} | Semantic Relevance: ${Math.round(item.score * 100)}%]\n${item.content}`)
      .join("\n\n---\n\n");

    console.log(`Successfully retrieved and ranked ${rankedChunks.length} relevant context chunks.`);

    // Prepare system instructions and prompt stuffed with RAG context
    const systemPrompt = `You are NeuroCV AI, an elite backend system designer, recruiter intelligence service, and technical career coach.
Your job is to compare a candidate's resume against a specific Job Description.

We have executed an automated Retrieval-Augmented Generation (RAG) search over the candidate's resume and indexed the dense vector embeddings using a high-precision FAISS-style vector store. Below is the most semantically relevant, ranked context retrieved from the candidate's resume based on the job requirements.

You MUST ground your recruiter feedback, strengths, weaknesses, ratings, and sector evaluations deeply on this retrieved context. Avoid mock explanations.
Specifically, evaluate the candidate's usage and mastery of FastAPI APIs, API architecture, database design, caching, distributed patterns, and automated testing.

For EVERY recommendation and sector rating you generate under "engineeringReadiness", you MUST explain WHY they are generated, referencing the specific retrieved resume evidence.

Perform a highly rigorous semantic and ATS analysis. Provide recruiter-oriented insights, visual skill gap data, tailored technical interview questions, a precise learning roadmap, and resume bullet-point improvements.

You MUST return a JSON response adhering strictly to the response schema. No additional markdown formatting, only valid JSON.`;

    const userPrompt = `Compare this candidate's resume against the following Job Description.

JOB DESCRIPTION:
${jobDescription}

RETRIEVED HIGH-RELEVANCY RESUME CONTEXT (FAISS Index FlatIP Ranked):
${retrievedContext}

FULL RESUME RAW TEXT REFERENCE (for general flow and overall structural details):
${resumeText}

Make sure to evaluate and include in your recruiterFeedback:
- Hiring Recommendation: Proceed, Hold, or Reject based on actual role match
- Confidence Level: Numeric percentage (0 to 100)
- Technical Strengths: Specifically highlight any proven skills like building high-throughput FastAPI APIs, async queries, or Kafka stream handling
- Engineering Weaknesses: Point out real gaps like missing complex cloud orchestration or testing suite coverage
- Missing Production Experience: List explicit missing production experience (like CI/CD pipelines, Kubernetes, deep monitoring metrics)
- Interview Focus Areas: Suggest specific topics for the interviewer (e.g. FastAPI route security, SQLAlchemy connection pools, Redis eviction policies)
- Engineering Readiness: Provide detailed evaluations for five specific sectors: "backend", "db", "distributed", "cloud", "testing". For each sector, supply:
  - title (Human label e.g. 'API & Backend Systems', 'Databases & Caching')
  - extracted (Direct textual evidence or skills extracted from the candidate's resume for this sector, e.g. mentions of FastAPI APIs, Kafka, etc.)
  - reasoning (Explain WHY this recommendation/evaluation was generated using the retrieved evidence, comparing it to the JD requirements)
  - confidence (Confidence score 0-100 for this sector)
  - recommendation (Actionable recruiter directive e.g. "Proceed with FastAPI and REST assessments" or "Hold on Cloud")
  - impact (The expected business value of their engineering skillset in this sector)

All findings must be backed by real retrieved resume evidence.`;

    console.log("Calling Gemini 3.5 Flash for RAG-informed structured intelligence...");
    const geminiRes = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scores: {
              type: Type.OBJECT,
              properties: {
                atsScore: { type: Type.INTEGER },
                semanticMatch: { type: Type.INTEGER },
                keywordCoverage: { type: Type.INTEGER },
                engineeringMaturity: { type: Type.INTEGER },
                clarity: { type: Type.INTEGER },
                hiringConfidence: { type: Type.INTEGER },
              },
              required: ["atsScore", "semanticMatch", "keywordCoverage", "engineeringMaturity", "clarity", "hiringConfidence"]
            },
            recruiterFeedback: {
              type: Type.OBJECT,
              properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                rejectionReasons: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingBackendSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingCloudSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                impactSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                hiringRecommendation: { type: Type.STRING, description: "Must be one of: Proceed, Hold, Reject" },
                confidenceLevel: { type: Type.INTEGER, description: "Confidence score as an integer percentage from 0 to 100" },
                engineeringConcerns: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific engineering concerns or risks" },
                missingProductionExperience: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Missing production experiences" },
                suggestedInterviewFocus: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggested interview focus areas" },
                decisionReasoning: { type: Type.STRING, description: "Comprehensive 'Explain Why' explanation of the hiring decision" },
                engineeringReadiness: {
                  type: Type.OBJECT,
                  properties: {
                    backend: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        extracted: { type: Type.STRING },
                        reasoning: { type: Type.STRING },
                        confidence: { type: Type.INTEGER },
                        recommendation: { type: Type.STRING },
                        impact: { type: Type.STRING }
                      },
                      required: ["title", "extracted", "reasoning", "confidence", "recommendation", "impact"]
                    },
                    db: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        extracted: { type: Type.STRING },
                        reasoning: { type: Type.STRING },
                        confidence: { type: Type.INTEGER },
                        recommendation: { type: Type.STRING },
                        impact: { type: Type.STRING }
                      },
                      required: ["title", "extracted", "reasoning", "confidence", "recommendation", "impact"]
                    },
                    distributed: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        extracted: { type: Type.STRING },
                        reasoning: { type: Type.STRING },
                        confidence: { type: Type.INTEGER },
                        recommendation: { type: Type.STRING },
                        impact: { type: Type.STRING }
                      },
                      required: ["title", "extracted", "reasoning", "confidence", "recommendation", "impact"]
                    },
                    cloud: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        extracted: { type: Type.STRING },
                        reasoning: { type: Type.STRING },
                        confidence: { type: Type.INTEGER },
                        recommendation: { type: Type.STRING },
                        impact: { type: Type.STRING }
                      },
                      required: ["title", "extracted", "reasoning", "confidence", "recommendation", "impact"]
                    },
                    testing: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        extracted: { type: Type.STRING },
                        reasoning: { type: Type.STRING },
                        confidence: { type: Type.INTEGER },
                        recommendation: { type: Type.STRING },
                        impact: { type: Type.STRING }
                      },
                      required: ["title", "extracted", "reasoning", "confidence", "recommendation", "impact"]
                    }
                  },
                  required: ["backend", "db", "distributed", "cloud", "testing"]
                }
              },
              required: [
                "strengths", "weaknesses", "rejectionReasons", "missingBackendSkills", 
                "missingCloudSkills", "impactSuggestions", "hiringRecommendation", 
                "confidenceLevel", "engineeringConcerns", "missingProductionExperience", 
                "suggestedInterviewFocus", "decisionReasoning", "engineeringReadiness"
              ]
            },
            skillGap: {
              type: Type.OBJECT,
              properties: {
                matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["matchedSkills", "missingSkills", "recommendedSkills"]
            },
            interviewQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  question: { type: Type.STRING },
                  difficulty: { type: Type.STRING, description: "Must be one of: Beginner, Intermediate, Advanced, Expert" },
                  expectedAnswer: { type: Type.ARRAY, items: { type: Type.STRING } },
                  whySelected: { type: Type.STRING, description: "A detailed description explaining why this specific question was selected for the candidate's resume match." }
                },
                required: ["category", "question", "difficulty", "expectedAnswer", "whySelected"]
              }
            },
            roadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  month: { type: Type.STRING, description: "e.g., 'Month 1: Infrastructure & Automation'" },
                  topics: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        details: { type: Type.STRING },
                      },
                      required: ["name", "details"]
                    }
                  }
                },
                required: ["month", "topics"]
              }
            },
            bulletImprovements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  improved: { type: Type.STRING },
                  impactScoreIncrease: { type: Type.INTEGER },
                  reason: { type: Type.STRING }
                },
                required: ["original", "improved", "impactScoreIncrease", "reason"]
              }
            }
          },
          required: ["scores", "recruiterFeedback", "skillGap", "interviewQuestions", "roadmap", "bulletImprovements"]
        }
      }
    });

    const responseText = geminiRes.text;

    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText.trim());
    } catch (parseErr) {
      console.error("Failed to parse Gemini output as JSON, returning fallback structure.", responseText);
      throw new Error("Invalid output format from AI service.");
    }

    // Make sure status 'Not Started' is added to roadmap topics
    if (parsedResult.roadmap) {
      parsedResult.roadmap = parsedResult.roadmap.map((milestone: any) => ({
        ...milestone,
        topics: milestone.topics.map((t: any) => ({
          ...t,
          status: "Not Started"
        }))
      }));
    }

    // Save analysis to local DB
    const newAnalysis = {
      id: "analysis-" + Math.random().toString(36).substr(2, 9),
      userId,
      resumeId: resumeId || "uploaded",
      resumeFileName,
      jobDescription,
      scores: parsedResult.scores,
      recruiterFeedback: parsedResult.recruiterFeedback,
      skillGap: parsedResult.skillGap,
      interviewQuestions: parsedResult.interviewQuestions,
      roadmap: parsedResult.roadmap,
      bulletImprovements: parsedResult.bulletImprovements,
      createdAt: new Date().toISOString()
    };

    db.analyses.push(newAnalysis);
    saveDb();

    res.json(newAnalysis);

  } catch (err: any) {
    console.error("Gemini API error during resume analysis: ", err);
    res.status(500).json({
      error: "AI analysis failed. Please verify your Gemini API Key in Settings > Secrets or try again later.",
      details: err.message
    });
  }
});

// 6. GET ANALYSIS HISTORY
app.get("/api/analysis-history", authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  const userAnalyses = db.analyses.filter((a: any) => a.userId === userId);
  // Return reversed so most recent comes first
  res.json([...userAnalyses].reverse());
});

// Vite middleware configuration for development vs production serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
