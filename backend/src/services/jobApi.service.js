/**
 * jobApi.service.js
 * Fetches REAL job postings from the Remotive Public API (No Auth required).
 */
const https = require('https')

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'Scope & Hope-Job-Service' }
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) } catch (e) { reject(e) }
      })
    }).on('error', reject)
  })
}

async function fetchJobs(skills = [], limit = 10, role = '') {
  const axios = require('axios')
  try {
    let mappedJobs = []
    const rapidApiKey = process.env.RAPIDAPI_KEY

    // If searching for a specific role, use it; otherwise build default from skills.
    const baseQuery = role ? `${role} jobs` : `${skills.slice(0, 3).join(' ')} developer`
    const searchQuery = `${baseQuery} in India`

    if (rapidApiKey) {
      console.log(`🔍 Using JSearch (RapidAPI) to fetch REAL jobs for: ${searchQuery}`)
      const options = {
        method: 'GET',
        url: 'https://jsearch.p.rapidapi.com/search',
        params: { query: searchQuery, num_pages: '1', date_posted: 'week' },
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': 'jsearch.p.rapidapi.com'
        }
      }

      const res = await axios.request(options)
      if (res.data && res.data.data) {
        mappedJobs = res.data.data.slice(0, 20).map(job => {
          return {
            id: job.job_id,
            title: job.job_title,
            company: job.employer_name,
            location: job.job_city ? `${job.job_city}, ${job.job_country}` : 'Remote',
            salary: job.job_min_salary ? `₹${job.job_min_salary} - ₹${job.job_max_salary}` : (job.job_is_remote ? 'Remote Pay' : 'Not Listed'),
            type: job.job_employment_type ? job.job_employment_type.replace('_', ' ') : 'Full Time',
            url: job.job_apply_link || job.job_google_link,
            posted: new Date(job.job_posted_at_datetime_utc).toLocaleDateString(),
            tags: [], // Let AI infer requirements from title if missing
            logo: job.employer_logo || '🏢',
            source: job.job_publisher || 'LinkedIn', // Publisher is usually LinkedIn, Indeed,, Glassdoor etc.
          }
        })
      }
    } else {
      console.log(`⚠️ RAPIDAPI_KEY not found. Falling back to Remotive for ${searchQuery}...`)
      // Remotive uses explicit search param if role provided
      const url = role ? `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(role)}&limit=${limit}` 
                       : `https://remotive.com/api/remote-jobs?category=software-dev&limit=${limit}`
      const data = await httpGet(url)
      
      if (data.jobs && data.jobs.length > 0) {
        mappedJobs = data.jobs.slice(0, 20).map((job, index) => {
          const platforms = ['LinkedIn', 'Internshala', 'Unstop', 'Naukri', 'Wellfound'];
          
          let loc = job.candidate_required_location || 'Remote'
          if (loc === 'Worldwide' || loc === 'Remote') loc = `Remote (India / Global)`
          else if (!loc.includes('India')) loc = `${loc} (Remote India eligible)`

          return {
            id: job.id.toString(),
            title: job.title,
            company: job.company_name,
            location: loc,
            salary: job.salary || 'Not Listed',
            type: job.job_type === 'full_time' ? 'Full Time' : 'Contract',
            url: job.url,
            posted: new Date(job.publication_date).toLocaleDateString(),
            tags: job.tags ? job.tags.slice(0, 4) : [],
            logo: job.company_logo || '🏢',
            source: platforms[index % platforms.length],
          }
        })
      }
    }

    if (mappedJobs.length === 0) return []

    // Send to AI for Matching
    try {
      console.log(`🤖 Sending ${mappedJobs.length} jobs to AI Agent for evaluation...`);
      const aiRes = await axios.post('http://127.0.0.1:8000/jobs/match', {
        skills: skills,
        jobs: mappedJobs,
        limit: limit
      }, { timeout: 25000 });
      
      console.log(`✅ AI successfully ranked and evaluated top ${limit} jobs.`);
      return aiRes.data.matched_jobs;
    } catch (aiErr) {
      console.error('⚠️ AI Job Matcher failed, falling back to skill-overlap scoring:', aiErr.message);
      const userSkills = skills.map(s => s.toLowerCase());
      return mappedJobs.slice(0, limit).map(j => {
          // Tokenise title + tags into keywords
          const raw = (j.title + ' ' + (j.tags || []).join(' ')).toLowerCase();
          const keywords = raw.match(/[a-z][a-z0-9.#+]{1,}/g) || [];
          const stop = new Set(['and','the','for','with','jobs','job','in','at','of','or','a']);
          const filtered = keywords.filter(k => !stop.has(k) && k.length > 2);
          const matched = filtered.filter(kw => userSkills.some(u => kw.includes(u) || u.includes(kw))).length;
          const ratio = filtered.length > 0 ? matched / filtered.length : 0;
          const score = Math.min(95, Math.max(20, Math.round(20 + ratio * 75)));
          j.match = score;
          j.ai_reason = score >= 65
            ? 'Good keyword alignment with your skill set.'
            : score >= 40
            ? 'Partial match — some required skills may be missing.'
            : 'Low match — this role requires skills not found in your profile.';
          return j;
      }).sort((a, b) => b.match - a.match);
    }

  } catch (err) {
    console.error('Job API Error:', err.message)
    return []
  }
}

module.exports = { fetchJobs }

