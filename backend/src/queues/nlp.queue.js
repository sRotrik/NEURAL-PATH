const Queue = require('bull')
const fs = require('fs')
const pdfParse = require('pdf-parse')
const axios = require('axios')

const nlpQueue = new Queue('nlp-skill-extraction', process.env.REDIS_URL || 'redis://localhost:6379')

nlpQueue.process(async (job) => {
  const { filePath, userId } = job.data
  try {
    // 1. Read PDF
    const dataBuffer = fs.readFileSync(filePath)
    
    job.progress(25)

    // 2. Extract Text
    const data = await pdfParse(dataBuffer)
    const rawText = data.text

    job.progress(50)

    // 3. Send text to AI microservice for skill extraction
    const response = await axios.post('http://localhost:8000/extract-skills/', {
      text: rawText,
      source: 'resume'
    })

    const extractedSkills = response.data.skills

    job.progress(85)

    // 4. Clean up temporary file
    fs.unlinkSync(filePath)

    job.progress(100)

    return { success: true, skills: extractedSkills }
  } catch (err) {
    console.error(`NLP Queue Error: ${err.message}`)
    throw err
  }
})

// Event Listeners
nlpQueue.on('completed', (job, result) => {
  console.log(`✅ NLP Job ${job.id} completed. Extracted ${result.skills.length} skills.`)
  // TODO: Save to Prisma DB and compute SDS 
})

nlpQueue.on('failed', (job, err) => {
  console.error(`❌ NLP Job ${job.id} failed: ${err.message}`)
})

module.exports = nlpQueue
