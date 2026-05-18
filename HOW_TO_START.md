# 🧠 Scope & Hope — How to Start Everything

## ⚡ QUICKSTART (Recommended)

Open **PowerShell** in `d:\SCOPE_AND_HOPE` and run:

```powershell
.\start-all.ps1
```

This automatically opens **3 separate terminal windows** — one for each service.

---

## 🖐️ Manual Start (If start-all.ps1 doesn't work)

Open **3 separate PowerShell terminals**, all from `d:\SCOPE_AND_HOPE`:

### Terminal 1 — Frontend (React + Vite)
```powershell
cd frontend
npm run dev
```
✅ Runs at: http://localhost:5173

---

### Terminal 2 — Backend (Node.js + Express)
```powershell
cd backend
npm run dev
```
✅ Runs at: http://localhost:4000

---

### Terminal 3 — AI Service (Python FastAPI)
```powershell
cd ai-service
.\venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```
✅ Runs at: http://localhost:8000

---

## 🔑 Required API Keys (in Files)

### `d:\SCOPE_AND_HOPE\backend\.env`
```
DATABASE_URL="prisma+postgres://..."
RAPIDAPI_KEY="cb4a4ad9c6msh1c380320da616dfp1b9a6ejsn65b66539ac5c"
```

### `d:\SCOPE_AND_HOPE\ai-service\.env` (or same folder)
```
GROQ_API_KEY="your_groq_api_key_here"
```
> Get your free Groq key from: https://console.groq.com

### `d:\SCOPE_AND_HOPE\frontend\.env.local`
```
VITE_CLERK_PUBLISHABLE_KEY="pk_test_your_clerk_key_here"
VITE_API_BASE_URL="http://localhost:4000/api"
```
> Get your Clerk key from: https://dashboard.clerk.com → API Keys

---

## ✅ Health Check — Is Everything Running?

After starting all 3 services, open your browser and verify:

| Service      | URL                              | Expected Response            |
|--------------|----------------------------------|------------------------------|
| Frontend     | http://localhost:5173            | Scope & Hope login page loads  |
| Backend      | http://localhost:4000/api/jobs   | JSON response with jobs data |
| AI Service   | http://localhost:8000/docs       | FastAPI Swagger UI           |

---

## 🧠 AI Models Used

| Feature          | Primary Model           | Fallback Model         |
|------------------|-------------------------|------------------------|
| Resume Scanner   | llama-3.3-70b-versatile | llama-3.1-8b-instant   |
| AI Career Coach  | llama-3.3-70b-versatile | llama-3.1-8b-instant   |
| Roadmap Gen      | llama-3.3-70b-versatile | llama-3.1-8b-instant   |
| Job Matching     | llama-3.1-8b-instant    | Regex fallback          |

> The system automatically switches to the 8B fallback if the 70B model hits rate limits. No action needed from you.

---

## 🚨 Troubleshooting

### App shows "Authentication Error" (red screen)
→ Your `VITE_CLERK_PUBLISHABLE_KEY` in `frontend/.env.local` is wrong or expired.
→ Go to https://dashboard.clerk.com → copy the full key → paste into the file → save.

### Coach / Resume Scanner shows generic fallback response
→ Your `GROQ_API_KEY` in `ai-service/.env` is missing or invalid.
→ Go to https://console.groq.com → create a key → paste it → restart the AI service terminal.

### Jobs not loading from LinkedIn / real sources 
→ Your `RAPIDAPI_KEY` in `backend/.env` may be expired or invalid.
→ Go to https://rapidapi.com → JSearch API → copy the key → paste it → restart the backend terminal.

### AI Service doesn't start (venv error)
Run this once to set up the Python environment:
```powershell
cd ai-service
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

---

## 📁 Project Structure

```
d:\SCOPE_AND_HOPE\
├── frontend/          ← React + Vite (Port 5173)
├── backend/           ← Node.js + Express (Port 4000)
├── ai-service/        ← Python FastAPI AI Agent (Port 8000)
├── start-all.ps1      ← One-click startup script
└── HOW_TO_START.md    ← This file
```
