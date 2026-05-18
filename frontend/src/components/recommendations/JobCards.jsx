import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function JobCards({ skills = [], searchRole = '', limit = 5, hideViewAll = false }) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const skillsQuery = skills.length > 0 ? skills.join(',') : 'software'

    let url = `http://localhost:4000/api/jobs?skills=${encodeURIComponent(skillsQuery)}&limit=${limit}`
    if (searchRole) {
      url += `&role=${encodeURIComponent(searchRole)}`
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data && data.jobs) {
          setJobs(data.jobs)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [skills, limit, searchRole])

  return (
    <div className="card h-full">
      <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', marginBottom: '20px' }} className="justify-between">
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>Real-time Open Roles</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Fetched live based on your skills</p>
        </div>
        {!hideViewAll && (
          <Link to="/jobs" style={{
            background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.3)',
            color: '#a5b4fc', padding: '8px 16px', borderRadius: '10px',
            fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
            textDecoration: 'none'
          }}>View all →</Link>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
             <div className="p-8 text-center text-indigo-400 font-medium animate-pulse">Scanning Global Job Markets...</div>
        ) : jobs.length === 0 ? (
             <div className="p-8 text-center text-gray-500 font-medium">No live jobs matching your exact stack right now.</div>
        ) : jobs.map((job, i) => (
          <a key={i} href={job.url} target="_blank" rel="noopener noreferrer" style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none', display: 'block'
          }}
            className="hover:!bg-indigo-500/10 hover:!border-indigo-500/30">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '20px', overflow: 'hidden'
              }}>
                {job.logo && job.logo !== '🏢' ? <img src={`https://wsrv.nl/?url=${encodeURIComponent(job.logo)}&w=128&h=128&output=webp`} alt="logo" style={{width: '100%', height:'100%', objectFit:'cover'}} onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerText = '🏢'; }} /> : '🏢'}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#f1f5f9' }}>{job.title}</span>
                  <div className="flex gap-2">
                     <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">From {job.source || 'Premium Board'}</span>
                     <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">Direct Apply</span>
                     <span style={{
                       fontSize: '13px', fontWeight: '800', padding: '3px 10px', borderRadius: '100px',
                       background: job.match >= 85 ? 'rgba(16,185,129,0.2)' : 'rgba(79,70,229,0.2)',
                       color: job.match >= 85 ? '#6ee7b7' : '#a5b4fc',
                       border: job.match >= 85 ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(79,70,229,0.3)',
                     }}>{job.match}% ATS Match</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>{job.company}</span>
                  <span style={{ color: '#334155', fontSize: '12px' }}>•</span>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>{job.location}</span>
                  <span style={{ color: '#334155', fontSize: '12px' }}>•</span>
                  <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 'bold' }}>{job.type}</span>
                  <span style={{ color: '#334155', fontSize: '12px' }}>•</span>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>{job.posted}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {job.tags && job.tags.map((tag, j) => (
                      <span key={j} style={{
                        fontSize: '11px', padding: '3px 10px', borderRadius: '100px',
                        background: 'rgba(16,185,129,0.1)', color: '#34d399',
                        border: '1px solid rgba(16,185,129,0.2)',
                      }}>{tag}</span>
                    ))}
                    {job.skill_gap && job.skill_gap.map((missingSkill, j) => (
                      <span key={`gap-${j}`} style={{
                        fontSize: '11px', padding: '3px 10px', borderRadius: '100px',
                        background: 'rgba(239,68,68,0.1)', color: '#f87171',
                        border: '1px solid rgba(239,68,68,0.3)',
                      }}>{missingSkill} (Missing)</span>
                    ))}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#22d3ee', flexShrink: 0, marginLeft: '8px' }}>
                    {job.salary === "Not Listed" ? "Salary Varies" : job.salary}
                  </span>
                </div>
                
                {job.ai_reason && (
                  <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(79,70,229,0.1)', borderLeft: '3px solid #6366f1', borderRadius: '0 8px 8px 0' }}>
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#cbd5e1', fontStyle: 'italic' }}>
                      <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>✨ AI Insight: </span> 
                      {job.ai_reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
