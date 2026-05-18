"""
embedder.py
Generates a skill embedding vector using Sentence-BERT (all-MiniLM-L6-v2).
The embedding is used for cosine similarity against market demand vectors in pgvector.
"""
from typing import List

try:
    from sentence_transformers import SentenceTransformer
    _model = SentenceTransformer("all-MiniLM-L6-v2")
    _USE_MODEL = True
except Exception as e:
    print(f"[embedder] SentenceTransformer unavailable: {e}. Using mock embeddings.")
    _USE_MODEL = False


def generate_skill_embedding(skills: List[str]) -> List[float]:
    """
    Joins skills into a sentence and encodes it.
    Returns a 384-dim float list (all-MiniLM-L6-v2).
    Falls back to a deterministic mock vector in dev mode.
    """
    if not skills:
        return [0.0] * 384

    skill_sentence = ", ".join(skills)

    if _USE_MODEL:
        embedding = _model.encode(skill_sentence, normalize_embeddings=True)
        return embedding.tolist()

    # Mock: stable hash-based vector for dev / CI
    import hashlib, math
    seed = int(hashlib.md5(skill_sentence.encode()).hexdigest(), 16)
    vec = []
    for i in range(384):
        val = math.sin(seed * (i + 1) * 0.0001)
        vec.append(round(val, 6))

    # Normalize mock vector
    magnitude = math.sqrt(sum(v * v for v in vec))
    return [round(v / magnitude, 6) for v in vec] if magnitude else vec
