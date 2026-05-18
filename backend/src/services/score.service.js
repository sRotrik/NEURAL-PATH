/**
 * score.service.js
 * Computes the Skill Demand Score (SDS) using the formula:
 * SDS = (cosine_similarity × 0.6) + (demand_weight × 0.3) + (freshness_bonus × 0.1) × 100
 *
 * In production: calls the Python ai-service for embeddings + pgvector cosine sim.
 * In development: uses a local approximation with market demand lookup table.
 */

const MARKET_DEMAND = {
  react: 90, node: 80, nodejs: 80, python: 88, typescript: 85,
  docker: 72, kubernetes: 75, aws: 82, gcp: 78, postgresql: 70,
  redis: 65, graphql: 68, fastapi: 74, pytorch: 80, tensorflow: 76,
  langchain: 88, rag: 91, llm: 91, 'vector db': 87, pinecone: 83,
  rust: 69, go: 73, java: 77, 'next.js': 82, vite: 68,
  mongodb: 66, prisma: 64, tailwind: 70,
}

function normalizeSkill(s) {
  return s.toLowerCase().replace(/[^a-z0-9. ]/g, '').trim()
}

function getDemandWeight(skill) {
  const key = normalizeSkill(skill)
  for (const [k, v] of Object.entries(MARKET_DEMAND)) {
    if (key.includes(k)) return v / 100
  }
  return 0.55 // default for unknown skills
}

function cosineSimilarityApprox(skills) {
  // Approximate: average demand coverage of user skills vs full market
  const weights = skills.map(s => getDemandWeight(s))
  const avg = weights.reduce((a, b) => a + b, 0) / (weights.length || 1)
  // Add variance factor — diverse skill set gets closer to market vector
  const unique = new Set(skills.map(normalizeSkill)).size
  const diversityBonus = Math.min(0.1, unique * 0.008)
  return Math.min(1, avg + diversityBonus)
}

function computeAvgDemand(skills) {
  const weights = skills.map(s => getDemandWeight(s))
  return weights.reduce((a, b) => a + b, 0) / (weights.length || 1)
}

function computeFreshnessBonus(skills) {
  // Skills trending in last 30 days get a bonus
  const trending = ['langchain', 'rag', 'llm', 'vector db', 'rust', 'pinecone']
  const hits = skills.filter(s =>
    trending.some(t => normalizeSkill(s).includes(t))
  ).length
  return Math.min(1, hits * 0.15)
}

async function computeSDS(skills) {
  if (!skills || skills.length === 0) return { sdsScore: 0, breakdown: {} }

  const cosineSim = cosineSimilarityApprox(skills)
  const demandWeight = computeAvgDemand(skills)
  const freshnessBonus = computeFreshnessBonus(skills)

  const rawScore = (cosineSim * 0.6) + (demandWeight * 0.3) + (freshnessBonus * 0.1)
  const sdsScore = Math.round(Math.min(100, rawScore * 100))

  // Identify gaps: market skills not in user profile
  const userSet = new Set(skills.map(normalizeSkill))
  const topGaps = Object.entries(MARKET_DEMAND)
    .filter(([k]) => !Array.from(userSet).some(u => u.includes(k) || k.includes(u)))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill, demand]) => ({
      skill,
      marketDemand: demand,
      gap: demand - Math.round(cosineSim * 70),
    }))

  return {
    sdsScore,
    breakdown: {
      cosineSimilarity: +cosineSim.toFixed(3),
      demandWeight: +demandWeight.toFixed(3),
      freshnessBonus: +freshnessBonus.toFixed(3),
    },
    topGaps,
    skillCount: skills.length,
    computedAt: new Date().toISOString(),
  }
}

module.exports = { computeSDS }
