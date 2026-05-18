const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth.middleware')

/**
 * GET /api/courses
 * Returns gap-targeted course recommendations ranked by skill gap severity
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { skills, gaps } = req.query
    // TODO: call Coursera Partner API and rank by gap severity
    res.json({
      courses: [
        {
          id: 'c1',
          title: 'LLM Engineering: Build RAG Apps',
          provider: 'DeepLearning.AI',
          url: 'https://deeplearning.ai',
          duration: '14h',
          level: 'Intermediate',
          relevance: 94,
          skills: ['LangChain', 'RAG', 'Embeddings'],
          upskillGap: 'LLMs / RAG Pipelines',
        },
        {
          id: 'c2',
          title: 'Docker & Kubernetes for Developers',
          provider: 'Udemy',
          url: 'https://udemy.com',
          duration: '22h',
          level: 'Beginner',
          relevance: 88,
          skills: ['Docker', 'K8s', 'CI/CD'],
          upskillGap: 'Docker & Kubernetes',
        },
        {
          id: 'c3',
          title: 'Fine-Tuning LLMs with LoRA & PEFT',
          provider: 'Hugging Face',
          url: 'https://huggingface.co',
          duration: '10h',
          level: 'Advanced',
          relevance: 82,
          skills: ['PEFT', 'LoRA', 'PyTorch'],
          upskillGap: 'Fine-tuning LLMs',
        },
        {
          id: 'c4',
          title: 'AWS Solutions Architect – Associate',
          provider: 'A Cloud Guru',
          url: 'https://acloudguru.com',
          duration: '40h',
          level: 'Intermediate',
          relevance: 77,
          skills: ['EC2', 'S3', 'Lambda', 'VPC'],
          upskillGap: 'Cloud (AWS/GCP)',
        },
      ],
      source: 'Coursera Partner API + curated',
      total: 4,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/courses/roadmap
 * Generates a 30/60/90-day learning path via GPT-4o / Groq
 */
router.post('/roadmap', requireAuth, async (req, res) => {
  try {
    const { skillGaps, currentSkills } = req.body
    if (!skillGaps || !Array.isArray(skillGaps)) {
      return res.status(400).json({ error: 'skillGaps array is required' })
    }

    // TODO: call ai-service /generate-roadmap endpoint
    res.json({
      roadmap: {
        '30days': {
          title: 'Foundation Sprint',
          tasks: [
            { skill: 'LangChain Basics', hours: '12h', type: 'course' },
            { skill: 'Vector DB fundamentals', hours: '8h', type: 'course' },
            { skill: 'Build a RAG prototype', hours: '10h', type: 'project' },
          ],
        },
        '60days': {
          title: 'Momentum Build',
          tasks: [
            { skill: 'Fine-tuning LLMs (LoRA)', hours: '20h', type: 'course' },
            { skill: 'FastAPI + ML serving', hours: '10h', type: 'course' },
            { skill: 'Production RAG pipeline', hours: '15h', type: 'project' },
          ],
        },
        '90days': {
          title: 'Market Ready',
          tasks: [
            { skill: 'MLOps with Docker + K8s', hours: '16h', type: 'course' },
            { skill: 'Open-source contribution', hours: '20h', type: 'project' },
            { skill: 'Portfolio deploy + blog', hours: '8h', type: 'project' },
          ],
        },
      },
      generatedBy: 'GPT-4o',
      generatedAt: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
