"""
extract.py  –  Scope & Hope ATS Scoring Engine

Pipeline:
  1. Groq LLaMA (70B → 8B failover) extracts structured profile from resume text.
  2. JSearch (RapidAPI) fetches live job postings for the candidate's top role.
  3. Skill demand is computed by counting how often each skill appears in live JDs.
  4. Final ATS score = 60 % LLM quality score  +  40 % real-time market demand score.
  5. ats_breakdown bullet-points include concrete demand % numbers.
"""

import json
import re
import os
import urllib.request
import urllib.parse
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

GROQ_API_KEY  = os.getenv("GROQ_API_KEY", "")
RAPIDAPI_KEY  = os.getenv("RAPIDAPI_KEY", "")

# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class ExtractRequest(BaseModel):
    text: str
    source: Optional[str] = "resume"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _groq_chat(model: str, prompt: str, timeout: int = 45) -> dict:
    """Call Groq chat-completions and return parsed JSON from content."""
    payload = json.dumps({
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.0,
        "response_format": {"type": "json_object"},
    }).encode()
    req = urllib.request.Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "Scope & Hope/1.0",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as res:
        data = json.loads(res.read())
    content = data["choices"][0]["message"]["content"]
    content = content.replace("```json", "").replace("```", "").strip()
    return json.loads(content)


def _extract_with_groq(resume_text: str) -> Optional[dict]:
    """Primary: 70B model → failover: 8B model."""
    prompt = f"""
You are an elite ATS (Applicant Tracking System) Algorithm and HR Parser.
Analyze this resume and extract structured data + assign an initial quality ATS score.

RULES:
1. Normalize text: Remove fluff. Output standard skill names (e.g., 'Python', 'React').
2. Strict Capitalisation: e.g. Node.js, PostgreSQL, TensorFlow.
3. ATS Quality Score (1-100): Based purely on resume quality signals:
   - Keyword density and specificity
   - Quantifiable metrics (e.g., "increased throughput by 30%")
   - Action verbs (Built, Designed, Led, Optimised)
   - Breadth of relevant experience
4. ATS Breakdown: 3 short bullet points explaining the quality score.

Output ONLY raw JSON (no markdown):
{{
  "education": ["Degree string"],
  "languages_known": ["English"],
  "certifications": ["Certification Name"],
  "programming_languages_known": ["Python", "SQL"],
  "tools_known": ["Git", "Figma"],
  "soft_skills": ["Agile"],
  "experience": ["Role, Company, Duration, summary"],
  "achievements": ["Notable accomplishments"],
  "top_role": "inferred target job title (e.g. 'Software Engineer', 'Data Analyst')",
  "ats_score": 74,
  "ats_breakdown": [
    "Good use of action verbs across project descriptions.",
    "Lacks quantifiable metrics in work experience.",
    "Strong certification portfolio boosts keyword density."
  ]
}}

Resume Text:
{resume_text[:3500]}
"""
    if not GROQ_API_KEY:
        return None

    # Primary: 70B
    try:
        return _groq_chat("llama-3.3-70b-versatile", prompt, timeout=45)
    except Exception as e:
        print(f"🚨 70B model failed ({e}). Failing over to 8B Instant…")

    # Failover: 8B
    try:
        result = _groq_chat("llama-3.1-8b-instant", prompt, timeout=20)
        print("✅ 8B failover successful.")
        return result
    except Exception as e2:
        print(f"🚨 8B failover also failed: {e2}")
        return None


def _fetch_live_job_demand(role: str, candidate_skills: List[str]) -> dict:
    """
    Call JSearch (RapidAPI) to fetch up to 10 live job postings for `role`.
    Returns a dict: { skill_lower: demand_pct, ..., "total_jobs": N }
    """
    if not RAPIDAPI_KEY or not role:
        return {}

    try:
        query = urllib.parse.quote(f"{role} jobs")
        url = (
            f"https://jsearch.p.rapidapi.com/search"
            f"?query={query}&num_pages=1&date_posted=month"
        )
        req = urllib.request.Request(
            url,
            headers={
                "x-rapidapi-key": RAPIDAPI_KEY,
                "x-rapidapi-host": "jsearch.p.rapidapi.com",
                "User-Agent": "Scope & Hope/1.0",
            },
        )
        with urllib.request.urlopen(req, timeout=15) as res:
            data = json.loads(res.read())

        jobs = data.get("data", [])[:10]
        total = len(jobs)
        if total == 0:
            return {}

        demand: dict = {"total_jobs": total}
        for skill in candidate_skills:
            skill_lower = skill.lower()
            # Count jobs that mention this skill at least once
            count = sum(
                1 for j in jobs
                if skill_lower in (
                    j.get("job_description", "") + " " +
                    " ".join(j.get("job_required_skills") or [])
                ).lower()
            )
            demand[skill_lower] = round((count / total) * 100)

        return demand

    except Exception as e:
        print(f"⚠️  JSearch demand fetch failed: {e}")
        return {}


def _compute_market_score(demand: dict, candidate_skills: List[str]) -> int:
    """
    Market demand score (0–100).
    Average of demand % across the candidate's skills that appear in JDs.
    """
    if not demand or not candidate_skills:
        return 0
    total = demand.get("total_jobs", 0)
    if total == 0:
        return 0
    percents = [demand.get(s.lower(), 0) for s in candidate_skills]
    if not percents:
        return 0
    return round(sum(percents) / len(percents))


def _build_demand_bullets(demand: dict, candidate_skills: List[str]) -> List[str]:
    """Generate human-readable bullet points from real demand data."""
    if not demand:
        return []
    total = demand.get("total_jobs", 0)
    bullets = []
    # Sort skills by demand % descending
    ranked = sorted(
        [(s, demand.get(s.lower(), 0)) for s in candidate_skills],
        key=lambda x: -x[1]
    )
    high_demand = [(s, p) for s, p in ranked if p >= 60]
    low_demand  = [(s, p) for s, p in ranked if p < 30]

    if high_demand:
        top = high_demand[:3]
        skills_str = ", ".join(f"{s} ({p}%)" for s, p in top)
        bullets.append(
            f"🔥 High market demand: {skills_str} are required in {total} live job postings analyzed."
        )
    if low_demand:
        bottom = low_demand[:2]
        skills_str = ", ".join(f"{s} ({p}%)" for s, p in bottom)
        bullets.append(
            f"📉 Low market signal: {skills_str} appeared rarely in current live job listings — consider adding trending tools."
        )
    if not bullets and total > 0:
        bullets.append(
            f"📊 Skill demand analyzed across {total} live job postings for your target role."
        )
    return bullets


def _regex_fallback(text: str) -> dict:
    """Deterministic fallback when Groq is unavailable."""
    text_lower = text.lower()
    tech_stack  = ["python", "typescript", "java", "c++", "javascript", "sql", "go", "rust", "kotlin", "swift"]
    tools_stack = ["react", "node.js", "docker", "kubernetes", "aws", "gcp", "postgresql", "mongodb",
                   "git", "fastapi", "express", "vue", "angular", "redis", "graphql", "tailwind", "django", "flask", "spring"]
    lang_stack  = ["english", "spanish", "french", "german", "hindi"]
    soft_list   = ["leadership", "communication", "teamwork", "agile", "problem solving", "time management"]

    coding = [t.title() for t in tech_stack  if t in text_lower] or ["JavaScript", "Python"]
    tools  = [t.title() for t in tools_stack if t in text_lower] or ["React", "Git"]
    langs  = [l.title() for l in lang_stack  if l in text_lower] or ["English"]
    soft   = [s.title() for s in soft_list   if s in text_lower] or ["Problem Solving", "Teamwork"]

    edu_kws  = ["b.tech","bsc","bachelor","master","phd","university","college","degree","diploma"]
    cert_kws = ["certified","certification","coursera","udemy","aws","gcp","azure","nptel","certificate"]

    edu_lines  = [l.strip() for l in text.split('\n') if len(l.strip()) > 5 and any(k in l.lower() for k in edu_kws)][:3]
    cert_lines = [l.strip() for l in text.split('\n') if len(l.strip()) > 5 and any(k in l.lower() for k in cert_kws)][:3]

    score = min(100, 50 + len(coding) * 4 + (10 if edu_lines else 0))

    has_exp = any(k in text_lower for k in ["experience","internship","worked","employed"])
    has_ach = any(k in text_lower for k in ["award","achievement","winner","scholarship","published"])

    return {
        "education":                    edu_lines  or ["Higher Education detected"],
        "languages_known":              langs,
        "certifications":              cert_lines or [],
        "programming_languages_known": coding,
        "tools_known":                 tools,
        "soft_skills":                 soft,
        "experience":                  ["Work experience detected."] if has_exp else [],
        "achievements":                ["Achievements detected."]    if has_ach else [],
        "top_role":                    "Software Engineer",
        "ats_score":                   score,
        "ats_breakdown":               [
            "Resume parsed using offline fallback (AI service unavailable).",
            "Keyword density indicates a partial match with modern stacks.",
            "Action verbs and quantifiable metrics could not be deep-analyzed.",
        ],
        "_parsed_by": "fallback",
    }


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------
@router.post("/")
async def extract_skills(req: ExtractRequest):
    if not req.text or len(req.text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Text too short for extraction")

    try:
        # ── Step 1: LLM extraction ──────────────────────────────────────────
        parsed = _extract_with_groq(req.text)
        if not parsed:
            parsed = _regex_fallback(req.text)

        # Ensure ats_score exists
        if "ats_score" not in parsed:
            s = 40
            if parsed.get("experience"):   s += 20
            if parsed.get("education"):    s += 15
            if parsed.get("achievements"): s += 10
            s += min(10, len(parsed.get("programming_languages_known", [])) * 2)
            s += min(5,  len(parsed.get("tools_known", [])))
            parsed["ats_score"] = min(100, s)

        llm_quality_score = parsed["ats_score"]

        # ── Step 2: Real-time market demand via JSearch ─────────────────────
        all_skills = (
            parsed.get("programming_languages_known", []) +
            parsed.get("tools_known", [])
        )
        top_role   = parsed.get("top_role", "Software Engineer")

        print(f"🌐 Fetching live job demand for '{top_role}' via JSearch…")
        demand = _fetch_live_job_demand(top_role, all_skills)
        market_score = _compute_market_score(demand, all_skills)

        if demand:
            total_jobs = demand.get("total_jobs", 0)
            print(f"✅ Demand analyzed across {total_jobs} live postings. Market score: {market_score}")
        else:
            print("⚠️  No live demand data available. Using LLM score only.")

        # ── Step 3: Weighted final ATS score ───────────────────────────────
        if market_score > 0:
            # 60% LLM quality  +  40% market demand
            final_score = round(0.60 * llm_quality_score + 0.40 * market_score)
        else:
            final_score = llm_quality_score

        parsed["ats_score"]         = min(100, max(1, final_score))
        parsed["llm_quality_score"] = llm_quality_score
        parsed["market_score"]      = market_score

        # ── Step 4: Enrich breakdown with demand bullets ────────────────────
        existing_breakdown = parsed.get("ats_breakdown", [])
        demand_bullets     = _build_demand_bullets(demand, all_skills)

        # Keep up to 2 LLM bullets + all demand bullets (max 5 total)
        parsed["ats_breakdown"] = (existing_breakdown[:2] + demand_bullets)[:5]

        if demand:
            parsed["demand_data"] = {
                k: v for k, v in demand.items() if k != "total_jobs"
            }
            parsed["jobs_analyzed"] = demand.get("total_jobs", 0)

        return {"source": req.source, **parsed}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
