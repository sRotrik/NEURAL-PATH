# 🧠 Scope & Hope — AI-Powered Career Intelligence

> **Bridging the gap between developer skills and real-time market demand.**

Scope & Hope is a premium, real-time, AI-driven career intelligence platform. Rather than simple resume matching, it parses developer skills using NLP, calculates semantic matches against active job postings, identifies skill gaps, generates custom learning roadmaps, and provides an interactive AI Career Coach to guide developers toward high-value roles.

---

## 📸 App Preview

![Scope & Hope Login Screen](./screenshot.png)

---

## ⚡ Core Facilities & Features

### 1. 📂 AI Resume Scanner & Parser
- **NLP Extraction**: Extracts skills, technologies, experience, and educational background from PDF uploads using **spaCy** NLP pipelines.
- **Skill Classification**: Categorizes extracted text into languages, frameworks, databases, tools, and soft skills.
- **Analysis Feedback**: Leverages **Llama 3.3** via Groq to provide detailed parsing logs and feedback on how to improve the resume format.

### 2. 📊 Developer Portfolio & Profile Hub
- **Target Role Mapping**: Allows users to specify target roles and experience levels (Junior, Mid, Senior).
- **Interactive Skill Chips**: Edit, add, or remove technical skills directly on your profile.
- **Project & Experience History**: Document past work to enhance the AI's understanding of your career path.

### 3. 🤖 Interactive AI Career Coach
- **Conversational Guidance**: Chat with an AI coach built on **Llama-3.3-70b-versatile** via Groq.
- **Context-Aware Recommendations**: The coach references your actual profile data, extracted skills, target roles, and skill gaps to provide highly customized advice.
- **Interview Prep & Tips**: Ask for interview questions, practice mock technical evaluations, or ask for advice on salary negotiation.

### 4. 🎯 Semantic Job Matching
- **JSearch Integration**: Fetches real-time job listings tailored to your specified target roles.
- **Sentence-BERT Match Score**: Calculates a semantic similarity score (using **Sentence-Transformers**) between your resume/profile skills and the target job description.
- **Sort and Filter**: View and sort jobs by Match Score, location, date posted, or employer.

### 5. 🗺️ Gap Analysis & Learning Roadmaps
- **Skill Gap Auditing**: Compares your current skill set with the skills demanded by matching jobs.
- **Step-by-Step Learning Roadmaps**: Generates custom roadmaps with milestone markers to help you acquire missing skills.

---

## 🏗️ System Architecture

```mermaid
graph TD
    User([Developer / User]) <-->|Interacts with| FE[Frontend: React + Vite + Tailwind]
    FE <-->|API Calls & Clerk Auth| BE[Backend: Express + Node.js]
    BE <-->|Prisma ORM| DB[(PostgreSQL Database)]
    BE <-->|Queue Jobs| Redis[(Redis Queue / Cache)]
    BE <-->|HTTP API Calls| AI[AI Service: FastAPI]
    AI <-->|Local Embeddings| SBERT[Sentence-BERT Models]
    AI <-->|LLM Queries| Groq[Groq API: Llama-3.3]
    AI <-->|Parser| SpaCy[spaCy NLP]
```

---

## 🛠️ Technology Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, D3.js | Modern, responsive developer UI with rich charts |
| **Backend** | Node.js, Express, Prisma ORM, Bull, Redis | API gateways, task queue management, PostgreSQL sync |
| **AI Service** | Python FastAPI, spaCy, Sentence-BERT, PyTorch | NLP parsing, semantic embedding matching, LLM gateway |
| **Authentication**| Clerk SDK | Secure developer sign-in, sign-up, and session management |
| **Database** | PostgreSQL | Relational database schema for users, profiles, and jobs |

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **Docker Desktop** (for PostgreSQL and Redis)

---

### 📦 Installation Steps

#### 1. Start Infrastructure via Docker
Spin up the pre-configured PostgreSQL and Redis containers:
```bash
docker-compose up -d
```

#### 2. Set Up the Backend
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   npm install
   ```
2. Copy the environment template and configure your secrets:
   ```bash
   cp .env.example .env
   ```
3. Run database migrations:
   ```bash
   npx prisma db push
   ```

#### 3. Set Up the Frontend
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   npm install
   ```
2. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```
   *(Ensure the Clerk keys match your Clerk test dashboard config)*

#### 4. Set Up the AI Service
1. Navigate to the `ai-service` folder:
   ```bash
   cd ai-service
   python -m venv venv
   # Activate virtualenv:
   # Windows:
   .\venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Download the spaCy English language model:
   ```bash
   python -m spacy download en_core_web_sm
   ```
4. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

---

## ⚡ Running the Project

To start all services simultaneously with a single command, open **PowerShell** or **Command Prompt** in the project root folder and execute:

### Using Batch (Command Prompt)
```cmd
start-all.bat
```

### Using PowerShell
```powershell
.\start-all.ps1
```

Once running, you can access the application components:
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:4000/api/health](http://localhost:4000/api/health)
- **AI Service Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🔑 Required API Keys

Ensure the following variables are configured in their respective `.env` files:

### Backend (`backend/.env`)
- `DATABASE_URL`: Connection string to PostgreSQL (e.g. `postgresql://postgres:postgres@localhost:5432/scope_hope`)
- `REDIS_URL`: Connection string to Redis (e.g. `redis://localhost:6379`)
- `RAPIDAPI_KEY`: Required for real-time JSearch job listings fetching.

### Frontend (`frontend/.env.local`)
- `VITE_CLERK_PUBLISHABLE_KEY`: Clerk Publishable Key.
- `VITE_API_BASE_URL`: Pointer to the Backend server (`http://localhost:4000/api`).

### AI Service (`ai-service/.env`)
- `GROQ_API_KEY`: Groq API Key to access Llama models.
