import json
import os
import re
import urllib.request
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()


def _skill_overlap_score(user_skills: List[str], job_title: str, job_tags: List[str]) -> int:
    """
    Deterministic fallback: score = % of job-related keywords found in user skills.
    - Parses keywords from job title + tags.
    - Each matched keyword adds weight; missing ones penalise the score.
    - Returns 20-95 range (never 100 unless perfect, never 0 so UI shows something).
    """
    user_lower = {s.lower() for s in user_skills}

    # Build a keyword set from title + tags
    raw_text = (job_title + " " + " ".join(job_tags)).lower()
    # Split on non-alphanumeric, keep meaningful tokens
    tokens = re.findall(r'[a-z][a-z0-9.#+]{1,}', raw_text)
    # Filter very short/common words
    stop = {"and", "the", "for", "with", "jobs", "job", "in", "at", "of", "or", "a"}
    keywords = [t for t in tokens if t not in stop and len(t) > 2]

    if not keywords:
        # No keywords to compare — give a neutral-low score
        return 35

    matched = sum(
        1 for kw in keywords
        if any(kw in u or u in kw for u in user_lower)
    )
    ratio = matched / len(keywords)

    # Scale: 0% match → 20, 100% match → 95
    score = int(20 + ratio * 75)
    return min(95, max(20, score))

class JobItem(BaseModel):
    id: str
    title: str
    company: str
    location: str
    salary: str
    type: str
    url: str
    posted: str
    tags: List[str]
    logo: str
    source: str

class MatchRequest(BaseModel):
    skills: List[str]
    jobs: List[JobItem]
    limit: int = 5

@router.post("/match")
async def match_jobs(req: MatchRequest):
    if not req.jobs or not req.skills:
        return {"matched_jobs": req.jobs[:req.limit]}

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        # No Groq key — use deterministic skill-overlap scoring
        results = []
        for j in req.jobs[:req.limit]:
            j_dict = j.dict()
            score = _skill_overlap_score(req.skills, j.title, j.tags)
            j_dict["match"] = score
            j_dict["ai_reason"] = (
                "Good skill alignment with this role." if score >= 65
                else "Partial match — consider upskilling for this role." if score >= 40
                else "Low match — key skills for this role are missing from your profile."
            )
            j_dict["skill_gap"] = []
            results.append(j_dict)
        results = sorted(results, key=lambda x: x["match"], reverse=True)
        return {"matched_jobs": results}

    # Prepare jobs JSON for the prompt
    jobs_summary = []
    for j in req.jobs:
        jobs_summary.append(f"ID: {j.id} | Title: {j.title} | Tags: {','.join(j.tags)}")

    prompt = f"""
You are an expert HR AI Agent and ATS scoring system.
The candidate has these skills: {', '.join(req.skills)}

Here are {len(req.jobs)} live job postings:
{chr(10).join(jobs_summary)}

TASK:
Select the top {req.limit} jobs that best fit the candidate's skills and return a STRICT, ACCURATE ATS match score.

SCORING RULES (follow exactly):
- 85-95: Candidate has 80%+ of the required skills for this role.
- 65-84: Candidate has 50-79% of the required skills.
- 40-64: Candidate has 25-49% of the required skills — notable gaps exist.
- 20-39: Candidate has less than 25% of the required skills — major mismatch.
- NEVER give 75+ if the job title requires skills clearly absent from the candidate's list.
- NEVER give all jobs the same score — differentiate based on actual skill overlap.
- If candidate skills have NO overlap with the job title/tags, score MUST be below 40.

For each job also:
- Write a 1-sentence 'ai_reason' explaining the match or mismatch.
- List 1-3 critical missing skills as 'skill_gap' (empty list if perfect match).

Return ONLY valid JSON:
{{
  "top_jobs": [
    {{ "id": "job id here", "match": 87, "ai_reason": "Your React and Node.js skills align well with this role.", "skill_gap": ["Docker"] }}
  ]
}}
"""
    try:
        payload = json.dumps({
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.0,
            "response_format": { "type": "json_object" }
        }).encode()

        req_api = urllib.request.Request(
            "https://api.groq.com/openai/v1/chat/completions",
            data=payload,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
        )

        with urllib.request.urlopen(req_api, timeout=20) as res:
            data = json.loads(res.read())
            content = data["choices"][0]["message"]["content"]
            ai_data = json.loads(content)

        # Merge results securely
        top_ids = {str(item["id"]): item for item in ai_data.get("top_jobs", [])}
        
        final_jobs = []
        for j in req.jobs:
            if str(j.id) in top_ids:
                j_dict = j.dict()
                j_dict["match"] = top_ids[str(j.id)].get("match", 80)
                j_dict["ai_reason"] = top_ids[str(j.id)].get("ai_reason", "Great match based on your skills.")
                j_dict["skill_gap"] = top_ids[str(j.id)].get("skill_gap", [])
                final_jobs.append(j_dict)
        
        # Sort by match score
        final_jobs = sorted(final_jobs, key=lambda x: x["match"], reverse=True)

        # If LLM failed to return enough, fallback correctly
        if not final_jobs:
            raise Exception("LLM returned empty match list")

        return {"matched_jobs": final_jobs[:req.limit]}

    except Exception as e:
        print(f"Job AI Error: {e}. Using skill-overlap fallback.")
        # Deterministic fallback: compute real skill overlap per job
        results = []
        for j in req.jobs[:req.limit]:
            j_dict = j.dict()
            score = _skill_overlap_score(req.skills, j.title, j.tags)
            j_dict["match"] = score
            if score >= 65:
                j_dict["ai_reason"] = "Good keyword alignment with your skill set."
            elif score >= 40:
                j_dict["ai_reason"] = "Partial match — some required skills may be missing."
            else:
                j_dict["ai_reason"] = "Low match — this role requires skills not found in your profile."
            j_dict["skill_gap"] = []
            results.append(j_dict)
        # Sort by score descending
        results = sorted(results, key=lambda x: x["match"], reverse=True)
        return {"matched_jobs": results}
