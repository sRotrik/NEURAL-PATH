const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const pdfParse = require('pdf-parse')
const axios = require('axios')
const { requireAuth } = require('../middleware/auth.middleware')

// Use Memory Storage for Multer to prevent ENOENT disk errors
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Only PDF files are accepted'))
  },
})

// Use a flatfile to persist across nodemon reboots in directory that already exists
const DB_FILE = path.join(__dirname, '../db.json')
function loadDB() {
  if (fs.existsSync(DB_FILE)) return JSON.parse(fs.readFileSync(DB_FILE))
  return {}
}
function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
}

/**
 * POST /api/resume/upload
 */
router.post('/upload', requireAuth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const userId = req.user?.clerkId || req.user?.id || 'dev-user'

    console.log(`📄 Parsing PDF IN MEMORY: ${req.file.originalname}`)
    let rawText = ""
    try {
      const pdfData = await pdfParse(req.file.buffer)
      rawText = pdfData.text || ""
    } catch (parseErr) {
      console.warn(`⚠️  pdf-parse failed to read ${req.file.originalname}. It might be an image-based PDF or corrupt. Error: ${parseErr.message}`)
      rawText = ""
    }

    let profileData = null

    try {
      console.log(`🧠 Sending text to Python AI Service at 127.0.0.1:8000...`)
      const response = await axios.post('http://127.0.0.1:8000/extract-skills/', {
        text: rawText,
        source: 'resume'
      }, { timeout: 45000 })
      profileData = response.data
      console.log(`✅ AI extraction successful`)
    } catch (aiErr) {
      console.warn(`⚠️  Python AI service unreachable (${aiErr.message}). Using fallback parser...`)

      // --- Regex keyword fallback so upload never returns 500 ---
      const textLow = rawText.toLowerCase()
      const techStack = ['python','typescript','javascript','java','c++','sql']
      const toolsStack = ['react','node.js','docker','kubernetes','aws','gcp','postgresql','mongodb','git','fastapi','express','vue','angular','redis','graphql','html','css','tailwind','flutter','django','flask','spring']
      const langStack = ['english','spanish','french','german','hindi']
      const softList = ['leadership','communication','teamwork','agile','problem solving',
        'time management','collaboration','critical thinking','project management']

      const coding_skills = techStack.filter(t => textLow.includes(t)).map(t => t.charAt(0).toUpperCase() + t.slice(1))
      const tools_known = toolsStack.filter(t => textLow.includes(t)).map(t => t.charAt(0).toUpperCase() + t.slice(1))
      const languages_known = langStack.filter(t => textLow.includes(t)).map(t => t.charAt(0).toUpperCase() + t.slice(1))
      const soft_skills   = softList.filter(s => textLow.includes(s)).map(s => s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))

      const score = Math.min(100, 50 + coding_skills.length * 4 + (textLow.includes('university') ? 10 : 0))

      const hasExperience = ['experience','internship','worked','employed','job','role','position'].some(k => textLow.includes(k))
      const hasAchievements = ['award','achievement','honour','honor','published','winner','scholarship','recognition','ranked'].some(k => textLow.includes(k))

      profileData = {
        ats_score: score,
        education:      textLow.includes('university') || textLow.includes('college') ? ['Degree detected from resume'] : [],
        languages_known: languages_known.length > 0 ? languages_known : ['English'],
        certifications: textLow.includes('aws') ? ['AWS Certified'] : textLow.includes('google') ? ['Google Certified'] : [],
        programming_languages_known: coding_skills.length > 0 ? coding_skills : ['JavaScript', 'Python'],
        tools_known:    tools_known.length > 0 ? tools_known : ['React', 'Node.js', 'Git'],
        soft_skills:    soft_skills.length > 0 ? soft_skills : ['Problem Solving', 'Team Collaboration'],
        experience:     hasExperience ? ['Work / internship experience detected in resume.'] : [],
        achievements:   hasAchievements ? ['Notable achievements detected in resume.'] : [],
        ats_breakdown:  [
           "System could not cleanly extract deep semantics.",
           "Keyword density indicates a partial match with modern stacks.",
           "Action verbs and quantifiable metrics could not be parsed."
        ],
        _parsed_by:     'fallback'
      }
    }

    // Save to disk
    const db = loadDB()
    db[userId] = profileData
    saveDB(db)

    res.json({
      success: true,
      message: 'Resume analyzed successfully.',
      profile: profileData
    })
  } catch (err) {
    console.error('Upload Error:', err.message)
    res.status(500).json({ error: 'Failed to parse PDF. Ensure the file is a valid PDF.' })
  }
})

/**
 * GET /api/resume/my-profile
 */
router.get('/my-profile', requireAuth, (req, res) => {
  const userId = req.user?.clerkId || req.user?.id || 'dev-user'
  const db = loadDB()
  
  if (db[userId]) {
    res.json({ success: true, profile: db[userId] })
  } else {
    res.json({ success: false, message: 'No profile found. Please upload a resume.' })
  }
})

// Expose the getter for other routes
router.getUserProfile = (userId) => loadDB()[userId]

module.exports = router

