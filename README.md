# NeuroCV AI – Enterprise AI Career Intelligence Platform

**NeuroCV AI** is a production-ready, enterprise-grade Career Intelligence Platform built for software engineers, backend specialists, and technical recruiters.

This platform is **not** a basic ATS keyword checker. It is a full-stack, AI-powered system designed to run deep semantic analyses on software engineering resumes against target job descriptions using **Retrieval-Augmented Generation (RAG)**, vector-space embeddings, and state-of-the-art Large Language Models (LLMs).

---

## 🏗️ System Architecture

The platform is designed with a modern, decoupled full-stack architecture. 

For maximum showcase utility, the repository is pre-configured with:
1. **Interactive Sandbox Preview**: A functional React 19 + Node.js (Express) full-stack environment utilizing Google's native `@google/genai` Gemini 3.5 Flash engine, designed to run instantly inside the developer preview.
2. **Production-Ready Backend**: A beautifully decoupled FastAPI (Python) backend using SQLAlchemy, PostgreSQL, JWT Authentication, and a LangChain + FAISS semantic RAG search indexing service, complete with a multi-container Docker Compose setup.

```text
               +--------------------------------------------------+
               |                  REACT FRONTEND                  |
               |        (Vite, Tailwind CSS, Framer Motion)       |
               +-----------------------+--------------------------+
                                       |
                     HTTP API requests | (JWT Authenticated)
                                       v
               +--------------------------------------------------+
               |                   REST ENGINE                    |
               |       (Vite Express Proxy / Python FastAPI)      |
               +-------+-------------------+------------------+---+
                       |                   |                  |
                       |                   |                  |
       Authentication  |    PDF Parsing    |  RAG Embedding   | Database Query
       & Session Mgmt  |    & Extraction   |  Semantic Vector | persistence
                       v                   v                  v
               +---------------+   +---------------+  +---------------+
               |   JWT SECURE  |   |    GEMINI/    |  |  POSTGRESQL / |
               |    FLOWS      |   |  OPENAI LLM   |  |   LOCAL JSON  |
               +---------------+   +---------------+  +---------------+
```

---

## 🌟 Core Features

- 🔐 **JWT Enterprise Authentication**: Secure sign-up, sign-in, and instant click-and-play Enterprise Demo account access.
- 📄 **Native PDF Intelligence**: Direct Base64 streaming to Gemini's native document-processing engine, bypassing brittle server-side text parsing libraries.
- 📊 **Recruiter Simulation Engine**: Simulates evaluations from a Principal Technical Recruiter, highlighting candidate strengths, weaknesses, likely screening rejections, and actionable interview talking points.
- 🎯 **Competency Skill Gap Matrix**: Interactive competency lists, heatmaps, and a custom **Recharts Radar Chart** comparing the profile's distributed systems depth against the job description.
- 💬 **AI Interview Intelligence**: Tailored technical questions grouped by areas (Distributed Systems, Kafka, System Design, Behavioral) with collapsible self-assessment answer guidelines.
- 🗺️ **Bespoke 3-Month Learning Roadmap**: A monthly curriculum checklist to help candidates bridge gaps and transition into senior engineering roles.
- ✏️ **Resume Bullet-Point Rewriter**: Side-by-side comparative rewriter converting passive experience points into high-impact, quantified metrics.

---

## 📂 Repository Structure

```text
├── backend/                       # Production FastAPI (Python) Codebase
│   ├── services/
│   │   └── ai.py                  # LangChain, FAISS & OpenAI RAG pipelines
│   ├── routers/
│   │   ├── auth.py                # Register & Login routers
│   │   └── resume.py              # Upload, Analyze & History endpoints
│   ├── Dockerfile                 # Standalone backend container builder
│   ├── docker-compose.yml         # Multi-container stack (FastAPI + Postgres)
│   ├── requirements.txt           # Python backend dependencies
│   ├── main.py                    # FastAPI entrypoint & Global Exceptions
│   ├── database.py                # SQLAlchemy connections
│   ├── config.py                  # Pydantic Settings
│   ├── models.py                  # SQLAlchemy relational PostgreSQL schema
│   └── schemas.py                 # Pydantic JSON validation schemas
├── src/                           # Live React Frontend + Express server
│   ├── components/
│   │   ├── AuthView.tsx           # Premium Login & Registration Page
│   │   ├── Dashboard.tsx          # Recruiter Dashboard & Stats
│   │   ├── ResumeAnalyzer.tsx     # PDF drag-and-drop & job comparing
│   │   ├── RecruiterSimulation.tsx# Recruiter strengths/weaknesses simulation
│   │   ├── SkillGapView.tsx       # Recharts radar & skill matrix grid
│   │   ├── InterviewPrep.tsx      # Grouped Q&A with revealable rubrics
│   │   ├── RoadmapView.tsx        # Interactive 3-month monthly curriculum
│   │   └── ResumeImprovementView.tsx # Side-by-side bullet point rewriter
│   ├── App.tsx                    # React UI Shell
│   ├── index.css                  # Tailwinds CSS overrides & typography
│   ├── types.ts                   # Unified platform TS typings
│   └── main.tsx                   # React DOM mounter
├── server.ts                      # Live Express Server & Gemini API proxy
├── package.json                   # Full-stack Node scripts & packages
├── metadata.json                  # Sandbox permissions config
└── tsconfig.json                  # TS compiler setup
```

---

## ⚡ Running the Interactive Sandbox (Node.js + React)

The sandbox runs directly inside your current environment on port `3000`.

### Requirements
- Node.js (v18+)
- Gemini API Key (Injected automatically in the Secrets panel inside the AI Studio UI)

### Dev Setup
To start the developer environment:
```bash
# 1. Install dependencies
npm install

# 2. Start full-stack Node/Vite server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your browser.

---

## 🐳 Running the Production Stack (Python FastAPI + PostgreSQL)

For deployment on cloud platforms (AWS, GCP, DigitalOcean) or local testing, use the compiled Docker Compose stack inside the `/backend` folder.

### Requirements
- Docker and Docker Compose
- OpenAI API Key

### Launch instructions
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Configure environment variables inside `.env`:
   ```env
   DATABASE_URL=postgresql://neurocv_user:neurocv_password@db:5432/neurocv_db
   JWT_SECRET=neurocv-your-production-secure-key
   OPENAI_API_KEY=your_real_openai_api_key_here
   ```
3. Boot the environment using Docker Compose:
   ```bash
   docker compose up --build -d
   ```
4. Verify the backend containers are running:
   ```bash
   docker compose ps
   ```
5. Access the interactive **Swagger API Documentation**:
   - Swagger OpenAPI Specs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - ReDoc Visual Guide: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🧪 Decoupled Backend APIs Specification

### Authentication Endpoint
* **POST `/auth/register`**: Registers a new software candidate using password hashing (`bcrypt`) and signs a secure JWT bearer token.
* **POST `/auth/login`**: Verifies login parameters and issues an authenticated JWT token.

### Resume Intelligence Endpoint
* **POST `/resume/upload`**: Persists file metadata and parsed text in the database.
* **POST `/resume/analyze`**: Standardized RAG comparison. Embeds documents with LangChain, runs local semantic indices via FAISS similarity searching, queries OpenAI GPT-4, and saves the detailed feedback structure to PostgreSQL.
* **GET `/resume/history`**: Fetches the authenticated candidate's previous resume intelligence scores for version control reporting.

### Global Operations
* **GET `/health`**: Performs database ping checks and outputs API operational status.

---

## 🏆 Portfolio Match & Verification

This platform is engineered to directly demonstrate the following software engineering accomplishments on technical resumes:

> ✔️ *Designed and developed an AI-powered career intelligence platform leveraging Retrieval-Augmented Generation (RAG), semantic search, and OpenAI APIs to analyze resumes against job descriptions and generate recruiter-oriented insights.*
> 
> ✔️ *Implemented scalable FastAPI backend services supporting resume parsing, ATS compatibility analysis, authentication, personalized interview preparation, and workflow automation using PostgreSQL.*
> 
> ✔️ *Integrated LangChain and OpenAI APIs to generate AI-powered resume recommendations, skill-gap analysis, interview questions, and personalized learning roadmaps.*
## 🎥 Live Demo

## 🚀 Live Demo

🌐 **Live Application:** https://neurocv-ai.ai.studio

🎥 **Demo Video:** https://youtu.be/0vDXImMe6J4