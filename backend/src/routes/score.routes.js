const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth.middleware')
const { computeSDS } = require('../services/score.service')

/**
 * GET /api/score
 * Returns the current SDS score for the authenticated user
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    // TODO: fetch real embedding from pgvector and compute live
    const mockScore = {
      sdsScore: 74,
      breakdown: {
        cosineSimilarity: 0.89,
        demandWeight: 0.76,
        freshnessBonus: 0.62,
      },
      formula: 'SDS = (cos_sim × 0.6) + (demand_wt × 0.3) + (freshness × 0.1) × 100',
      topGaps: [
        { skill: 'LLMs / RAG Pipelines', gap: 61, marketDemand: 91 },
        { skill: 'Docker & Kubernetes', gap: 32, marketDemand: 72 },
        { skill: 'Cloud (AWS/GCP)', gap: 37, marketDemand: 82 },
      ],
      lastComputed: new Date().toISOString(),
    }
    res.json(mockScore)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/score/recompute
 * Forces a fresh SDS computation — calls AI microservice
 */
router.post('/recompute', requireAuth, async (req, res) => {
  try {
    const { skills } = req.body
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ error: 'skills array is required' })
    }

    const result = await computeSDS(skills)
    res.json({ success: true, ...result })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/score/history
 * Returns monthly SDS score history for chart rendering
 */
router.get('/history', requireAuth, async (req, res) => {
  res.json({
    history: [
      { month: 'Nov', score: 58 },
      { month: 'Dec', score: 62 },
      { month: 'Jan', score: 65 },
      { month: 'Feb', score: 68 },
      { month: 'Mar', score: 71 },
      { month: 'Apr', score: 74 },
    ],
  })
})

module.exports = router
