"""
coach.py — /coach/chat
Job-aware AI Career Coach Agent.
Accepts the user message + optional job_role and known_skills context
so the LLM can give personalised, job-specific resource recommendations.
"""
import json
import os
import urllib.request
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    job_role: Optional[str] = ""
    known_skills: Optional[List[str]] = []
    conversation_history: Optional[List[dict]] = []   # [{role, content}]

SYSTEM_PROMPT = """You are Scope & Hope Coach, an expert AI Career Coach and Technical Mentor.

Your primary job is to recommend the BEST, most specific learning resources for the user's target job role, taking into account what skills they already have.

When recommending resources, always:
1. Recommend REAL, named resources with URLs where possible (YouTube channels, GitHub repos, official docs, Coursera/Udemy course names, freeCodeCamp, roadmap.sh paths).
2. Categorise resources by type: 📹 Video, 📘 Doc/Book, 🧪 Practice, 🗺️ Roadmap, 🎓 Course.
3. Prioritise free resources first, then paid alternatives.
4. Be specific — name exact course titles, channel names, GitHub project names.
5. If the user mentions a specific skill gap or job role, tailor EVERY recommendation to that context.
6. Structure your reply with clear sections and bullet points.
7. For ANY specific skill or tech role you recommend learning, ALWAYS include the exact direct roadmap link in the format: https://roadmap.sh/[skill-or-role-slug] (e.g., https://roadmap.sh/data-analyst, https://roadmap.sh/python, https://roadmap.sh/react).
8. Keep replies focused, actionable, and under 500 words.
9. IMPORTANT RESTRICTION: You are strictly a Career, Programming, and Professional Development Mentor. You should converse naturally and helpfully like ChatGPT, BUT if the user asks you about topics outside of career advice, tech skills, interview prep, resumes, or learning resources (e.g., general knowledge, recipes, politics), you MUST politely refuse to answer and steer them back to their career goals.
10. EXACT ROADMAP MAPPING RULES: When generating a roadmap.sh link, you MUST ONLY use one of the following exact slugs: frontend, backend, full-stack, devops, devsecops, data-analyst, ai-engineer, ai-data-scientist, data-engineer, android, postgresql-dba, ios, blockchain, qa, software-architect, cyber-security, ux-design, technical-writer, game-developer, server-side-game-developer, mlops, product-manager, engineering-manager, developer-relations, bi-analyst, sql, computer-science, react, vue, angular, javascript, typescript, nodejs, python, system-design, java, aspnet-core, api-design, spring-boot, flutter, cpp, rust, golang, design-and-architecture, graphql, react-native, design-system, prompt-engineering, mongodb, linux, kubernetes, docker, aws, terraform, data-structures-and-algorithms, redis, git-github, php, cloudflare, ai-red-teaming, ai-agents, nextjs, code-review, kotlin, html, css, swift, laravel, elasticsearch, wordpress, django, ruby, ruby-on-rails, claude-code, vibe-coding, api-security, backend-performance, frontend-performance. Match the closest skill and use exactly https://roadmap.sh/<slug>.

Examples of great resource recommendations:
- 📹 Video: "CS50's Introduction to AI with Python" — https://www.youtube.com/cs50
- 📘 Docs: React Official Documentation — https://react.dev
- 🎓 Course: "Complete Node.js Developer" on Udemy by Zero to Mastery
- 🗺️ Roadmap: https://roadmap.sh/react
- 🧪 Practice: LeetCode (algorithms), Frontend Mentor (UI projects)
"""

def get_fallback_response(message: str, job_role: str, known_skills: List[str]) -> str:
    msg_lower = message.lower()
    role = job_role.lower() if job_role else ""

    skill_map = {
        "react":       ("React Developer", "https://roadmap.sh/react",        ["📹 The Net Ninja React Course (YouTube, free)", "📘 React Official Docs — https://react.dev", "🎓 React — The Complete Guide (Udemy, Maximilian)", "🧪 Build projects on Frontend Mentor"]),
        "python":      ("Python Developer","https://roadmap.sh/python",        ["📹 CS50P — Python for Everybody (YouTube, free)", "📘 Official Python Docs — https://docs.python.org", "🎓 100 Days of Code: Python (Udemy, Angela Yu)", "🧪 Practice on HackerRank / LeetCode"]),
        "node":        ("Node.js Developer","https://roadmap.sh/nodejs",       ["📹 Traversy Media Node.js Crash Course (YouTube)", "📘 Node.js Official Docs — https://nodejs.org/docs", "🎓 Complete Node.js Developer (Udemy, Zero to Mastery)", "🧪 Build REST APIs and deploy on Railway"]),
        "data":        ("Data Analyst",    "https://roadmap.sh/data-analyst",  ["📹 Alex The Analyst YouTube Channel (free)", "📘 Kaggle Learn — https://www.kaggle.com/learn", "🎓 Google Data Analytics Certificate (Coursera, free audit)", "🧪 Work on Kaggle datasets"]),
        "machine learning": ("ML Engineer","https://roadmap.sh/ai-data-scientist", ["📹 Andrej Karpathy Zero to Hero (YouTube, free)", "📘 fast.ai — https://www.fast.ai", "🎓 Machine Learning Specialization by Andrew Ng (Coursera)", "🧪 Compete on Kaggle"]),
        "devops":      ("DevOps Engineer", "https://roadmap.sh/devops",        ["📹 TechWorld with Nana (YouTube, free)", "📘 Docker Official Docs — https://docs.docker.com", "🎓 DevOps Bootcamp (Udemy, Mumshad Mannambeth)", "🧪 Set up CI/CD on a personal GitHub repo"]),
        "aws":         ("Cloud Engineer",  "https://roadmap.sh/devops",        ["📹 FreeCodeCamp AWS Course (YouTube, free)", "📘 AWS Documentation — https://docs.aws.amazon.com", "🎓 AWS Certified Solutions Architect (A Cloud Guru)", "🧪 Use AWS Free Tier for hands-on practice"]),
        "java":        ("Java Developer",  "https://roadmap.sh/java",          ["📹 Telusko Java Tutorials (YouTube, free)", "📘 Official Java Docs — https://docs.oracle.com/javase", "🎓 Java Masterclass (Udemy, Tim Buchalka)", "🧪 LeetCode with Java, build Spring Boot projects"]),
        "flutter":     ("Flutter Developer","https://roadmap.sh/flutter",      ["📹 Flutter Official YouTube Channel", "📘 Flutter Docs — https://flutter.dev/docs", "🎓 Flutter & Dart Complete Guide (Udemy, Maximilian)", "🧪 Build and publish an app on Google Play"]),
        "sql":         ("Database Engineer","https://roadmap.sh/sql",          ["📹 FreeCodeCamp SQL Course (YouTube, free)", "📘 SQLZoo — https://sqlzoo.net", "🎓 The Complete SQL Bootcamp (Udemy, Jose Portilla)", "🧪 Practice on Mode Analytics SQL School"]),
    }

    for keyword, (title, roadmap_url, resources) in skill_map.items():
        if keyword in msg_lower or keyword in role:
            lines = [f"Great choice! Here are the best resources to become a **{title}**:\n"]
            for r in resources:
                lines.append(f"• {r}")
            lines.append(f"\n🗺️ Full Roadmap: {roadmap_url}")
            if known_skills:
                lines.append(f"\nYou already know: {', '.join(known_skills[:5])} — focus on the gaps above!")
            return "\n".join(lines)

    # ATS / resume advice
    if any(k in msg_lower for k in ["ats", "resume", "score", "improve"]):
        return (
            "Here's how to boost your ATS score:\n\n"
            "• **Use keywords** from the job description in your resume\n"
            "• **Quantify achievements** — 'Increased performance by 40%' beats 'Improved performance'\n"
            "• **Add a skills section** with both technical and soft skills\n"
            "• **Keep formatting clean** — avoid tables, images, headers inside headers\n"
            "• **Include certifications** and education prominently\n\n"
            "🛠️ Test your resume at https://www.jobscan.co or upload again to Scope & Hope Scanner!"
        )

    return (
        f"I can help you find the best resources for any tech role!\n\n"
        f"Try asking:\n• 'Best resources to learn React'\n• 'How do I become a DevOps engineer?'\n• 'Resources for Data Science with Python'\n\n"
        f"Or explore roadmaps at: https://roadmap.sh"
    )


@router.post("/chat")
async def chat_coach(req: ChatRequest):
    if not req.message:
        raise HTTPException(status_code=400, detail="Empty query")

    api_key = os.getenv("GROQ_API_KEY")

    # Build contextual system prompt
    context_parts = []
    if req.job_role:
        context_parts.append(f"The user's target job role is: {req.job_role}.")
    if req.known_skills:
        context_parts.append(f"Skills they already have: {', '.join(req.known_skills)}.")
    context_note = " ".join(context_parts) if context_parts else ""

    user_content = req.message
    if context_note:
        user_content = f"[Context: {context_note}]\n\nUser asks: {req.message}"

    if not api_key:
        return {"reply": get_fallback_response(req.message, req.job_role or "", req.known_skills or [])}

    try:
        # Build messages with history support
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for h in (req.conversation_history or [])[-6:]:  # last 6 exchanges for context
            if h.get("role") in ("user", "assistant"):
                messages.append(h)
        messages.append({"role": "user", "content": user_content})

        payload = json.dumps({
            "model": "llama-3.3-70b-versatile",
            "messages": messages,
            "temperature": 0.5,
            "max_tokens": 800
        }).encode()

        req_api = urllib.request.Request(
            "https://api.groq.com/openai/v1/chat/completions",
            data=payload,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
        )
        with urllib.request.urlopen(req_api, timeout=15) as res:
            data = json.loads(res.read())
            reply = data["choices"][0]["message"]["content"]
            return {"reply": reply}

    except Exception as e:
        print(f"🚨 Coach 70B Failed ({e}). Initiating seamless 8B failover...")
        try:
            payload = json.dumps({
                "model": "llama-3.1-8b-instant",
                "messages": messages,
                "temperature": 0.5,
                "max_tokens": 800
            }).encode()
            req_api = urllib.request.Request(
                "https://api.groq.com/openai/v1/chat/completions",
                data=payload,
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
            )
            with urllib.request.urlopen(req_api, timeout=15) as res:
                data = json.loads(res.read())
                reply = data["choices"][0]["message"]["content"]
                return {"reply": reply}
        except Exception as e_failover:
            print(f"🚨🚨 Critical Coach Failover Error: {e_failover}")
            fallback = get_fallback_response(req.message, req.job_role or "", req.known_skills or [])
            return {"reply": fallback}
