/**
 * github.service.js
 * Fetches public repo data from the GitHub REST API
 * and infers skills from languages, topics, and README keywords.
 */
const https = require('https')

const LANGUAGE_TO_SKILL = {
  JavaScript: 'JavaScript', TypeScript: 'TypeScript',
  Python: 'Python', Rust: 'Rust', Go: 'Go',
  Java: 'Java', 'C++': 'C++', Ruby: 'Ruby',
  Dockerfile: 'Docker', Shell: 'Bash/Shell',
  HTML: 'HTML/CSS', CSS: 'HTML/CSS',
}

function githubGet(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path,
      method: 'GET',
      headers: {
        'User-Agent': 'Scope & Hope/1.0',
        Accept: 'application/vnd.github+json',
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
    }
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) } catch (e) { reject(e) }
      })
    })
    req.on('error', reject)
    req.end()
  })
}

async function getGithubSkills(username) {
  try {
    const repos = await githubGet(`/users/${username}/repos?per_page=30&sort=updated`)
    if (!Array.isArray(repos)) return []

    const skillSet = new Set()
    const languageCounts = {}

    for (const repo of repos) {
      // Count languages
      if (repo.language && LANGUAGE_TO_SKILL[repo.language]) {
        const skill = LANGUAGE_TO_SKILL[repo.language]
        languageCounts[skill] = (languageCounts[skill] || 0) + 1
        skillSet.add(skill)
      }

      // Infer from topics
      if (repo.topics) {
        for (const topic of repo.topics) {
          const t = topic.toLowerCase()
          if (t.includes('react')) skillSet.add('React')
          if (t.includes('nextjs') || t.includes('next-js')) skillSet.add('Next.js')
          if (t.includes('fastapi')) skillSet.add('FastAPI')
          if (t.includes('docker')) skillSet.add('Docker')
          if (t.includes('postgres') || t.includes('postgresql')) skillSet.add('PostgreSQL')
          if (t.includes('pytorch')) skillSet.add('PyTorch')
          if (t.includes('langchain')) skillSet.add('LangChain')
          if (t.includes('openai')) skillSet.add('OpenAI API')
          if (t.includes('kubernetes') || t.includes('k8s')) skillSet.add('Kubernetes')
          if (t.includes('redis')) skillSet.add('Redis')
          if (t.includes('graphql')) skillSet.add('GraphQL')
        }
      }
    }

    return Array.from(skillSet).map(skill => ({
      skill,
      confidence: languageCounts[skill] ? Math.min(95, 50 + languageCounts[skill] * 8) : 65,
      source: 'github',
    }))
  } catch (err) {
    console.error('GitHub API error:', err.message)
    return []
  }
}

module.exports = { getGithubSkills }
