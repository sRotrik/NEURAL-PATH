"""
gap.py — /gap-analysis
Compares user skill embeddings against the market demand vector stored
in pgvector and returns a ranked list of skill gaps with severity scores.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.models.demand_scorer import compute_gap_analysis

router = APIRouter()


class GapRequest(BaseModel):
    user_skills: List[str]
    user_id: Optional[str] = None


class SkillGap(BaseModel):
    skill: str
    market_demand: float   # 0–100
    user_level: float      # 0–100 (0 if not present)
    gap_score: float       # market_demand - user_level
    severity: str          # "high" | "medium" | "low"
    priority: int


class GapResponse(BaseModel):
    sds_score: float
    gaps: List[SkillGap]
    breakdown: dict
    total_gaps: int


@router.post("/", response_model=GapResponse)
async def gap_analysis(req: GapRequest):
    if not req.user_skills:
        raise HTTPException(status_code=400, detail="user_skills cannot be empty")
    try:
        result = compute_gap_analysis(req.user_skills)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
