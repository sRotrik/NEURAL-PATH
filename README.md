# Scope & Hope - AI-Powered Career Intelligence

Scope & Hope is a real-time, AI-powered career intelligence platform designed to bridge the gap between developer skills and market demand.

## Services
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, D3.js (Port: 3000)
- **Backend**: Node.js, Express, Prisma ORM, Bull, Redis (Port: 4000)
- **AI Service**: Python FastAPI, spaCy, Sentence-BERT, pgvector (Port: 8000)
- **Database**: PostgreSQL with pgvector extension (Port: 5432)
- **Cache/Queue**: Redis (Port: 6379)

## Getting Started

1. Clone the project.
2. Ensure Docker Desktop is installed. Run the database and redis:
   ```bash
   docker-compose up -d
   ```
3. Set up the Backend `backend`:
   ```bash
   cd backend
   npm install
   cp .env.example .env # update your env variables
   npx prisma migrate dev
   npm run dev
   ```
4. Set up the Frontend `frontend`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
5. Set up the AI Service `ai-service`:
   ```bash
   cd ai-service
   python -m venv venv
   source venv/Scripts/activate # Windows
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```
