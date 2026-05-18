/**
 * auth.middleware.js
 * Verifies Clerk JWT tokens on protected routes.
 * When CLERK_SECRET_KEY is not set, decodes the JWT payload (without
 * verification) to extract the real Clerk user ID so every account
 * gets its own data slot instead of all sharing 'dev-user-001'.
 */
const { createClerkClient } = require('@clerk/clerk-sdk-node')

const clerkClient = process.env.CLERK_SECRET_KEY
  ? createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
  : null

/**
 * Decode a JWT payload without verifying the signature.
 * Returns the parsed payload object, or null on failure.
 */
function decodeJwtPayload(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    // Base64url → Base64 → Buffer → JSON
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = Buffer.from(base64, 'base64').toString('utf8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization

  // ── No Clerk secret key configured (dev / local mode) ──────────────────────
  if (!clerkClient) {
    // Try to decode the bearer token to get the real Clerk user ID
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const payload = decodeJwtPayload(token)
      if (payload?.sub) {
        req.user = { clerkId: payload.sub }
        return next()
      }
    }
    // Absolute last-resort fallback (no token sent at all)
    req.user = { id: 'dev-user-fallback', email: 'dev@scope-and-hope.ai', name: 'Dev User' }
    return next()
  }

  // ── Production: full JWT verification via Clerk ─────────────────────────────
  try {
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization header' })
    }

    const token = authHeader.split(' ')[1]
    const payload = await clerkClient.verifyToken(token)
    req.user = { clerkId: payload.sub }
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

module.exports = { requireAuth }
