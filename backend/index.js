const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
const port = process.env.PORT || 4000

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'))
app.use('/api/users', require('./src/routes/user.routes'))
app.use('/api/resume', require('./src/routes/resume.routes'))
app.use('/api/score', require('./src/routes/score.routes'))
app.use('/api/jobs', require('./src/routes/jobs.routes'))
app.use('/api/courses', require('./src/routes/courses.routes'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Scope & Hope API', version: '1.0.0', timestamp: new Date().toISOString() })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error', message: err.message })
})

app.listen(port, () => {
  console.log(`✅ Scope & Hope backend running on http://localhost:${port}`)
})

module.exports = app
