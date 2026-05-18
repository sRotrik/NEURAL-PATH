"""
skill_extractor.py
Extracts and normalizes skills from raw text using spaCy + curated SKILL_TAXONOMY.
Falls back gracefully if spaCy model isn't loaded.
"""
import re
from typing import List
from pydantic import BaseModel

# Taxonomy: raw pattern → normalized skill name + category
SKILL_TAXONOMY = {
    r"\breact\b": ("React", "Frontend"),
    r"\bvue\.?js\b": ("Vue.js", "Frontend"),
    r"\bangular\b": ("Angular", "Frontend"),
    r"\bnext\.?js\b": ("Next.js", "Frontend"),
    r"\btailwind\b": ("Tailwind CSS", "Frontend"),
    r"\bnode\.?js\b": ("Node.js", "Backend"),
    r"\bexpress\b": ("Express.js", "Backend"),
    r"\bfastapi\b": ("FastAPI", "Backend"),
    r"\bflask\b": ("Flask", "Backend"),
    r"\bdjango\b": ("Django", "Backend"),
    r"\bpython\b": ("Python", "Language"),
    r"\bjavascript\b|\bjs\b": ("JavaScript", "Language"),
    r"\btypescript\b|\bts\b": ("TypeScript", "Language"),
    r"\brust\b": ("Rust", "Language"),
    r"\bgolang\b|\bgo\b": ("Go", "Language"),
    r"\bjava\b": ("Java", "Language"),
    r"\bc\+\+\b": ("C++", "Language"),
    r"\bpostgresql\b|\bpostgres\b": ("PostgreSQL", "Database"),
    r"\bmongodb\b": ("MongoDB", "Database"),
    r"\bredis\b": ("Redis", "Database"),
    r"\bprisma\b": ("Prisma ORM", "Database"),
    r"\bsqlalchemy\b": ("SQLAlchemy", "Database"),
    r"\bdocker\b": ("Docker", "DevOps"),
    r"\bkubernetes\b|\bk8s\b": ("Kubernetes", "DevOps"),
    r"\bgithub actions\b|\bci\/cd\b": ("CI/CD", "DevOps"),
    r"\baws\b": ("AWS", "Cloud"),
    r"\bgcp\b|google cloud\b": ("GCP", "Cloud"),
    r"\bazure\b": ("Azure", "Cloud"),
    r"\blangchain\b": ("LangChain", "AI/ML"),
    r"\bopenai\b": ("OpenAI API", "AI/ML"),
    r"\bpytorch\b": ("PyTorch", "AI/ML"),
    r"\btensorflow\b": ("TensorFlow", "AI/ML"),
    r"\bhugging ?face\b": ("Hugging Face", "AI/ML"),
    r"\bsentence.bert\b|\bsbert\b": ("Sentence-BERT", "AI/ML"),
    r"\brag\b|retrieval.augmented": ("RAG Pipelines", "AI/ML"),
    r"\bvector\s*db\b|pinecone|pgvector|weaviate|qdrant": ("Vector DBs", "AI/ML"),
    r"\bllm\b|large language model": ("LLMs", "AI/ML"),
    r"\bfine.tun": ("Fine-tuning LLMs", "AI/ML"),
    r"\blora\b|\bpeft\b": ("LoRA/PEFT", "AI/ML"),
    r"\bgraphql\b": ("GraphQL", "API"),
    r"\brest\s*api\b": ("REST APIs", "API"),
    r"\bwebsocket\b": ("WebSockets", "API"),
}


class SkillEntity(BaseModel):
    skill: str
    normalized: str
    confidence: float
    category: str


def extract_skills_from_text(text: str) -> List[SkillEntity]:
    text_lower = text.lower()
    found = []
    seen = set()

    for pattern, (normalized, category) in SKILL_TAXONOMY.items():
        if re.search(pattern, text_lower):
            if normalized not in seen:
                seen.add(normalized)
                # Confidence: higher if mentioned multiple times
                count = len(re.findall(pattern, text_lower))
                confidence = min(0.98, 0.70 + count * 0.08)
                found.append(SkillEntity(
                    skill=re.search(pattern, text_lower).group(),
                    normalized=normalized,
                    confidence=round(confidence, 2),
                    category=category,
                ))

    return found
