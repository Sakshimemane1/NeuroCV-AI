import json
import logging
from typing import Dict, Any, List
from openai import OpenAI
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from config import settings

logger = logging.getLogger("neurocv.ai")

class AIService:
    def __init__(self):
        # Initialize OpenAI client in Python
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
        # Initialize LangChain Embeddings
        self.embeddings = OpenAIEmbeddings(openai_api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

    def build_rag_index(self, document_text: str) -> FAISS:
        """
        Builds a semantic searchable LangChain RAG index using FAISS.
        Splits resume into chunks to handle multi-hop retrieval and key matching.
        """
        if not self.embeddings:
            logger.warning("Embeddings are not configured, skipping FAISS RAG index creation.")
            return None
            
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )
        chunks = text_splitter.split_text(document_text)
        
        # Build local FAISS semantic index
        vector_db = FAISS.from_texts(chunks, self.embeddings)
        return vector_db

    def query_rag_resume_alignment(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        """
        Queries OpenAI with structural RAG contexts to generate deep recruiter feedback,
        interview questions, learning roadmaps, and resume improvements.
        """
        # 1. Optionally use local FAISS index to extract highly relevant contextual alignment chunks
        rag_context = ""
        try:
            vector_db = self.build_rag_index(resume_text)
            if vector_db:
                # Retrieve top 3 most semantically matching sections of candidate experience matching the job description
                relevant_docs = vector_db.similarity_search(job_description, k=3)
                rag_context = "\n---\n".join([doc.page_content for doc in relevant_docs])
                logger.info("Successfully retrieved RAG vector context for LLM comparison.")
        except Exception as e:
            logger.error(f"Failed to compile RAG vector context: {e}")

        # 2. Formulate Prompt
        system_instruction = (
            "You are NeuroCV AI, an elite backend system designer, technical hiring director, "
            "and technical recruiter coach. Compare a candidate's resume against a Job Description. "
            "You must return a strictly formatted JSON object adhering to the specified schema."
        )

        user_prompt = f"""
        Compare this Candidate's Resume against the Target Job Description.
        
        JOB DESCRIPTION:
        {job_description}
        
        COMPLETE CANDIDATE RESUME:
        {resume_text}
        
        {f"SEMANTICALLY RELEVANT RESUME CHUNKS (RAG RETRIEVED):\n{rag_context}" if rag_context else ""}
        
        Analyze the alignment and return a JSON response with exactly this structure:
        {{
            "scores": {{
                "atsScore": 85,
                "semanticMatch": 88,
                "keywordCoverage": 80,
                "engineeringMaturity": 90,
                "clarity: 92,
                "hiringConfidence": 87
            }},
            "recruiterFeedback": {{
                "strengths": ["list of strengths"],
                "weaknesses": ["list of weaknesses"],
                "rejectionReasons": ["likely screening blocks/rejection reasons"],
                "missingBackendSkills": ["specific missing tools"],
                "missingCloudSkills": ["missing cloud/infrastructure tools"],
                "impactSuggestions": ["strategic behavioral interview recommendations"]
            }},
            "skillGap": {{
                "matchedSkills": ["skills matching the requirements"],
                "missingSkills": ["important unaddressed required skills"],
                "recommendedSkills": ["recommended technical expansions"]
            }},
            "interviewQuestions": [
                {{
                    "category": "Subject (e.g., Distributed Systems, System Design, Python, Java)",
                    "question": "A deep, challenging behavioral or technical question tailored to their resume experience.",
                    "difficulty": "Intermediate or Advanced or Expert",
                    "expectedAnswer": ["bullet points candidate must hit to pass this question"]
                }}
            ],
            "roadmap": [
                {{
                    "month": "Month 1: Subject title",
                    "topics": [
                        {{
                            "name": "Topic Name",
                            "details": "Actionable explanation of why and what to study to close this gap."
                        }}
                    ]
                }}
            ],
            "bulletImprovements": [
                {{
                    "original": "their weak bullet point from the resume",
                    "improved": "the rewritten, highly quantified, high-impact alternative",
                    "impactScoreIncrease": 15,
                    "reason": "Recruiter explanation highlighting why the new verb and metric are better"
                }}
            ]
        }}
        """

        # 3. Request OpenAI completion
        if not self.client:
            logger.warning("OpenAI API key missing. Returning mock full-scale RAG data structure for startup demonstration.")
            # Mock full analysis structure that matches the mock database to keep FastAPI standalone-functional
            return self._get_demo_analysis()

        try:
            response = self.client.chat.completions.create(
                model="gpt-4-turbo",
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.2
            )
            
            result_json = response.choices[0].message.content
            return json.loads(result_json)
        except Exception as e:
            logger.error(f"OpenAI API call failed: {e}")
            return self._get_demo_analysis()

    def _get_demo_analysis(self) -> Dict[str, Any]:
        """Fallback demo analyzer response"""
        return {
            "scores": {
                "atsScore": 88,
                "semanticMatch": 90,
                "keywordCoverage": 84,
                "engineeringMaturity": 88,
                "clarity": 92,
                "hiringConfidence": 89
            },
            "recruiterFeedback": {
                "strengths": [
                    "Excellent foundation in web API design, custom caching, and transaction integrity.",
                    "Demonstrated performance tuning experience, saving processing speeds by up to 70%."
                ],
                "weaknesses": [
                    "Lacks production-grade experience in event streaming brokers like Apache Kafka.",
                    "Minimal Infrastructure as Code automation listed (Terraform/CloudFormation)."
                ],
                "rejectionReasons": [
                    "Screening drop-off likely if role mandates active Dockerized orchestration (Kubernetes) in actual experience."
                ],
                "missingBackendSkills": ["Apache Kafka / RabbitMQ", "System Architecture Modeling"],
                "missingCloudSkills": ["Terraform", "Kubernetes (K8s) cluster design"],
                "impactSuggestions": [
                    "Highlight SQL execution plan optimization during database panels.",
                    "Explain the blue/green restart automation logic in detail to offset lack of active container orchestration experience."
                ]
            },
            "skillGap": {
                "matchedSkills": ["Python", "FastAPI", "Django", "PostgreSQL", "Redis", "Docker", "AWS", "GitHub Actions", "REST APIs"],
                "missingSkills": ["Apache Kafka", "Kubernetes", "Terraform", "gRPC", "JUnit/PyTest Testing Depth"],
                "recommendedSkills": ["Go (Golang)", "Elasticsearch", "Prometheus/Grafana", "Distributed Tracing"]
            },
            "interviewQuestions": [
                {
                    "category": "Distributed Systems",
                    "question": "You mentioned caching session variables in Redis. How would you design a distributed session manager that prevents session loss if the master Redis node goes down?",
                    "difficulty": "Advanced",
                    "expectedAnswer": [
                        "Configure Redis Sentinel or Redis Cluster with replicas.",
                        "Enable data persistence layers (AOF/RDB) on master and replicas.",
                        "Implement fallback cookie-based session verification or stateful failovers on FastAPI backend."
                    ]
                }
            ],
            "roadmap": [
                {
                    "month": "Month 1: Distributed Architecture & Streaming",
                    "topics": [
                        {
                            "name": "Apache Kafka Fundamentals",
                            "details": "Study topics around consumer groups, offsets, dynamic message partitions, and log retention."
                        }
                    ]
                }
            ],
            "bulletImprovements": [
                {
                    "original": "Built and maintained microservices in Python.",
                    "improved": "Engineered 8+ high-performance Python microservices using FastAPI, increasing transactional query speeds by 15% through optimized ORM indexes.",
                    "impactScoreIncrease": 14,
                    "reason": "Includes exact API volumes and quantifies latency optimizations."
                }
              ]
        }

ai_service = AIService()
