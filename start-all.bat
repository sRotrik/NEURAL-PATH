@echo off
echo Starting Frontend...
start cmd /k "cd frontend && npm run dev"

echo Starting Backend...
start cmd /k "cd backend && npm run dev"

echo Starting AI Service...
start cmd /k "cd ai-service && call venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

echo All services started!
