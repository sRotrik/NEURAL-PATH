const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth.middleware')
const { getGithubSkills } = require('../services/github.service')

/**
 * GET /api/users/profile
 * Returns the current user's full profile + skill profile
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    // Mock response — replace with Prisma query
    res.json({
      id: req.user.id,
      name: 'Arjun Mehta',
      email: 'arjun@example.com',
      githubUrl: 'https://github.com/arjunmehta',
      skillProfile: {
        sdsScore: 74,
        skills: [
          { skillName: 'React', level: 85, lastSeen: new Date() },
          { skillName: 'Node.js', level: 70, lastSeen: new Date() },
          { skillName: 'Python', level: 60, lastSeen: new Date() },
          { skillName: 'PostgreSQL', level: 75, lastSeen: new Date() },
          { skillName: 'Docker', level: 40, lastSeen: new Date() },
          { skillName: 'TypeScript', level: 65, lastSeen: new Date() },
        ],
        lastUpdated: new Date(),
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * PUT /api/users/profile
 * Update user name, githubUrl, etc.
 */
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name, githubUrl } = req.body
    // TODO: Prisma update
    res.json({ success: true, updated: { name, githubUrl } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/users/github-sync
 * Pull repos, extract languages & topics, infer skills
 */
router.post('/github-sync', requireAuth, async (req, res) => {
  try {
    const { githubUrl } = req.body
    if (!githubUrl) return res.status(400).json({ error: 'githubUrl is required' })

    const username = githubUrl.replace(/\/$/, '').split('/').pop()
    const skills = await getGithubSkills(username)

    res.json({ success: true, username, inferredSkills: skills })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
