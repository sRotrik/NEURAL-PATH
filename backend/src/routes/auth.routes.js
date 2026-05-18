const express = require('express')
const router = express.Router()

/**
 * POST /api/auth/webhook
 * Receives Clerk user.created / user.deleted events
 * and syncs them into the local PostgreSQL database.
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = JSON.parse(req.body)
    const { type, data } = event

    if (type === 'user.created') {
      // TODO: Prisma upsert user
      console.log('New user created via Clerk:', data.id, data.email_addresses?.[0]?.email_address)
    }

    if (type === 'user.deleted') {
      console.log('User deleted via Clerk:', data.id)
    }

    res.json({ received: true })
  } catch (err) {
    res.status(400).json({ error: 'Webhook error', message: err.message })
  }
})

/**
 * GET /api/auth/me
 * Returns the current authenticated user's basic info.
 */
router.get('/me', (req, res) => {
  // Will be gated by requireAuth middleware in production
  res.json({
    id: 'mock-001',
    name: 'Arjun Mehta',
    email: 'arjun@example.com',
    githubUrl: 'https://github.com/arjunmehta',
    createdAt: new Date().toISOString(),
  })
})

module.exports = router
