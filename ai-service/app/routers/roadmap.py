"""
roadmap.py — /generate-roadmap
Uses Groq (Llama-3 70B, free tier) or OpenAI GPT-4o to generate
a personalised 30/60/90-day learning roadmap from skill gaps.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os, json, urllib.request, urllib.error

router = APIRouter()


class RoadmapRequest(BaseModel):
    skill_gaps: List[str]
    current_skills: Optional[List[str]] = []
    target_role: Optional[str] = "AI/ML Engineer"


class RoadmapResponse(BaseModel):
    roadmap: dict
    generated_by: str
    target_role: str


def call_groq(prompt: str) -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None

    payload = json.dumps({
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
        "max_tokens": 1200,
    }).encode()

    req = urllib.request.Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=payload,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as res:
            data = json.loads(res.read())
            return data["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"🚨 Roadmap 70B Failed ({e}). Attempting 8B failover...")
        try:
            payload_8b = json.dumps({
                "model": "llama-3.1-8b-instant",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
                "max_tokens": 1200,
            }).encode()
            req_8b = urllib.request.Request(
                "https://api.groq.com/openai/v1/chat/completions",
                data=payload_8b,
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
            )
            with urllib.request.urlopen(req_8b, timeout=15) as res:
                data = json.loads(res.read())
                return data["choices"][0]["message"]["content"]
        except Exception as e_fail:
            print(f"🚨🚨 Roadmap Critical Failover Error: {e_fail}")
            return None


def mock_roadmap(gaps, role):
    return {
        "30days": {
            "title": "Foundation Sprint",
            "tasks": [
                {"skill": gaps[0] if gaps else "LangChain Basics", "hours": "12h", "type": "course"},
                {"skill": "Vector DB fundamentals", "hours": "8h", "type": "course"},
                {"skill": f"Build a small {role} prototype", "hours": "10h", "type": "project"},
            ]
        },
        "60days": {
            "title": "Momentum Build",
            "tasks": [
                {"skill": gaps[1] if len(gaps) > 1 else "FastAPI + ML serving", "hours": "18h", "type": "course"},
                {"skill": "Production pipeline project", "hours": "15h", "type": "project"},
                {"skill": "Write technical blog post", "hours": "5h", "type": "project"},
            ]
        },
        "90days": {
            "title": "Market Ready",
            "tasks": [
                {"skill": gaps[2] if len(gaps) > 2 else "MLOps with Docker", "hours": "16h", "type": "course"},
                {"skill": "Open-source contribution", "hours": "20h", "type": "project"},
                {"skill": "Portfolio deployment", "hours": "8h", "type": "project"},
            ]
        }
    }


@router.post("/", response_model=RoadmapResponse)
async def generate_roadmap(req: RoadmapRequest):
    if not req.skill_gaps:
        raise HTTPException(status_code=400, detail="skill_gaps cannot be empty")

    prompt = f"""
You are a senior engineering career coach. Generate a concise 30/60/90-day learning roadmap as JSON.

Target role: {req.target_role}
Current skills: {', '.join(req.current_skills or [])}
Skill gaps to close: {', '.join(req.skill_gaps)}

Return ONLY valid JSON with keys: 30days, 60days, 90days.
Each key: {{ title: string, tasks: [{{ skill, hours, type: "course"|"project" }}] }}
"""

    llm_output = call_groq(prompt)
    generated_by = "groq/llama-3.3-70b"

    roadmap = None
    if llm_output:
        try:
            start = llm_output.find('{')
            end = llm_output.rfind('}') + 1
            roadmap = json.loads(llm_output[start:end])
        except Exception:
            roadmap = None

    if not roadmap:
        roadmap = mock_roadmap(req.skill_gaps, req.target_role)
        generated_by = "mock-fallback"

    return RoadmapResponse(roadmap=roadmap, generated_by=generated_by, target_role=req.target_role)
