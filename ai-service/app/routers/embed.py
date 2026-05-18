"""
embed.py — /generate-embeddings
Converts a list of skill strings into Sentence-BERT embeddings (768-dim).
These vectors are stored in pgvector for cosine similarity search.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.models.embedder import generate_skill_embedding

router = APIRouter()


class EmbedRequest(BaseModel):
    skills: List[str]
    user_id: str


class EmbedResponse(BaseModel):
    user_id: str
    embedding: List[float]
    dimension: int
    skill_count: int
    model: str


@router.post("/", response_model=EmbedResponse)
async def generate_embeddings(req: EmbedRequest):
    if not req.skills:
        raise HTTPException(status_code=400, detail="skills list cannot be empty")
    try:
        embedding = generate_skill_embedding(req.skills)
        return EmbedResponse(
            user_id=req.user_id,
            embedding=embedding,
            dimension=len(embedding),
            skill_count=len(req.skills),
            model="all-MiniLM-L6-v2",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
