from dotenv import load_dotenv
import os
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import extract, embed, gap, roadmap, coach, project, jobs
from dotenv import load_dotenv
import os

# Load .env file from the ai-service root directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

app = FastAPI(
    title="Scope & Hope AI Service",
    description="NLP skill extraction, embedding generation, gap analysis, and roadmap generation.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(extract.router, prefix="/extract-skills", tags=["Skill Extraction"])
app.include_router(embed.router, prefix="/generate-embeddings", tags=["Embeddings"])
app.include_router(gap.router, prefix="/gap-analysis", tags=["Gap Analysis"])
app.include_router(roadmap.router, prefix="/generate-roadmap", tags=["Roadmap"])
app.include_router(coach.router, prefix="/coach", tags=["Coach"])
app.include_router(project.router, prefix="/project", tags=["Project"])
app.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])

@app.get("/health")
def health():
    return {"status": "ok", "service": "Scope & Hope AI Microservice", "version": "1.0.0"}
