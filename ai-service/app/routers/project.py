import json
import os
import urllib.request
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class ProjectEnhanceRequest(BaseModel):
    repo_name: str
    description: Optional[str] = ""
    language: Optional[str] = ""
    target_role: Optional[str] = "Software Engineer"

class ProjectEnhanceResponse(BaseModel):
    enhanced_bullets: List[str]
    tech_stack: List[str]

@router.post("/enhance", response_model=ProjectEnhanceResponse)
async def enhance_project(req: ProjectEnhanceRequest):
    if not req.repo_name:
        raise HTTPException(status_code=400, detail="repo_name cannot be empty")

    api_key = os.getenv("GROQ_API_KEY")

    prompt = f"""
You are a top-tier Senior Engineering Manager and Career Coach.
The user wants to add their GitHub project to their resume.
Project Name: {req.repo_name}
Description: {req.description or "No description provided."}
Main Language: {req.language or "Unknown"}
Target Job Role: {req.target_role}

Please do 2 things:
1. Provide 3 highly professional, impactful resume bullet points for this project. They should use strong action verbs and (if possible to infer) quantifiable metrics or technical complexity. Tailor the language towards a {req.target_role}.
2. Infer a realistic list of 3-5 technologies/frameworks (tech_stack) that were likely used or could have been used in this project.

Return your response ONLY as valid JSON matching this schema:
{{
  "enhanced_bullets": ["bullet 1", "bullet 2", "bullet 3"],
  "tech_stack": ["tech 1", "tech 2", "tech 3"]
}}
"""

    def get_fallback():
        return ProjectEnhanceResponse(
            enhanced_bullets=[
                f"Designed and implemented {req.repo_name} focusing on scalable architecture.",
                f"Leveraged {req.language or 'modern'} ecosystem to improve development speed and maintainability.",
                f"Optimized core algorithms leading to performance improvements."
            ],
            tech_stack=[req.language or "JavaScript", "React", "Node.js"]
        )

    if not api_key:
        return get_fallback()

    try:
        payload = json.dumps({
            "model": "llama3-8b-8192",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.3,
            "max_tokens": 512
        }).encode()

        req_api = urllib.request.Request(
            "https://api.groq.com/openai/v1/chat/completions",
            data=payload,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req_api, timeout=10) as res:
            data = json.loads(res.read())
            reply = data["choices"][0]["message"]["content"]
            
            # parse json
            start = reply.find('{')
            end = reply.rfind('}') + 1
            parsed = json.loads(reply[start:end])
            
            bullets = parsed.get("enhanced_bullets", [])
            stack = parsed.get("tech_stack", [])
            
            if not bullets:
                 return get_fallback()
                 
            return ProjectEnhanceResponse(enhanced_bullets=bullets, tech_stack=stack)
            
    except Exception as e:
        print(f"Project Enhance Error: {e}")
        return get_fallback()
