"""
demand_scorer.py
Compares a user's skill set to the current market demand.
Since pgvector requires a running DB, this model provides a deterministic
Python fallback mapping logic when the DB vector search is unavailable.
"""

MARKET_DEMAND_VECTORS = {
    "React": 90, "Node.js": 80, "Python": 88, "TypeScript": 85,
    "Docker": 72, "Kubernetes": 75, "AWS": 82, "GCP": 78, "PostgreSQL": 70,
    "Redis": 65, "GraphQL": 68, "FastAPI": 74, "PyTorch": 80, "TensorFlow": 76,
    "LangChain": 88, "RAG Pipelines": 91, "LLMs": 91, "Vector DBs": 87, 
    "Rust": 69, "Go": 73, "Java": 77, "Next.js": 82, "Pinecone": 83,
    "MongoDB": 66, "Prisma ORM": 64, "Tailwind CSS": 70,
    "Fine-tuning LLMs": 85, "LoRA/PEFT": 80, "CI/CD": 77,
}

def compute_gap_analysis(user_skills):
    # Normalize user skills for comparison
    user_skill_set = {s.lower() for s in user_skills}
    
    gaps = []
    
    for market_skill, demand in MARKET_DEMAND_VECTORS.items():
        user_level = 0
        if market_skill.lower() in user_skill_set:
            user_level = 85 # Arbitrary "proficient" level for matched skills
        
        gap_score = max(0, demand - user_level)
        
        severity = "low"
        priority = 3
        if gap_score > 50:
            severity = "high"
            priority = 1
        elif gap_score > 20:
            severity = "medium"
            priority = 2
            
        if gap_score > 0:
            gaps.append({
                "skill": market_skill,
                "market_demand": demand,
                "user_level": user_level,
                "gap_score": gap_score,
                "severity": severity,
                "priority": priority
            })
            
    # Sort gaps by priority and then by gap score (highest first)
    gaps.sort(key=lambda x: (x["priority"], -x["gap_score"]))
    
    # Take the top 5 most critical gaps
    top_gaps = gaps[:5]
    
    # Approximate an SDS score
    sds_score = sum(100 - g["gap_score"] for g in gaps[:10]) / min(10, max(1, len(gaps))) if gaps else 100
    if user_skills:
        sds_score += 10 # Bonus for having any skills
    
    return {
        "sds_score": min(100, round(sds_score)),
        "gaps": top_gaps,
        "breakdown": {
            "skills_analyzed": len(user_skills),
            "market_skills": len(MARKET_DEMAND_VECTORS),
            "critical_gaps": len([g for g in gaps if g["severity"] == "high"])
        },
        "total_gaps": len(gaps)
    }
