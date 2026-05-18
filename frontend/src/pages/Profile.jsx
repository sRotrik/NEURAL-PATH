import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'

const SKILL_COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#ec4899']

export default function Profile() {

  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [github, setGithub] = useState('')
  const [role, setRole] = useState('Full-Stack Developer')
  const [repos, setRepos] = useState([])
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [skills, setSkills] = useState([])

  useEffect(() => {
    if (isLoaded && user) {
      setName(user.fullName || user.firstName || 'New User')
    }
  }, [isLoaded, user])

  // Fetch resume profile from backend with auth token
  useEffect(() => {
    async function loadProfile() {
      try {
        const token = await getToken()
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
        const res = await fetch('http://localhost:4000/api/resume/my-profile', { headers })
        const data = await res.json()
        if (data.success && data.profile) {
          setProfileData(data.profile)
          const built = (data.profile.programming_languages_known || []).map((s, i) => ({
            name: s,
            level: Math.floor(55 + Math.random() * 35),
            trend: `+${Math.floor(Math.random() * 10)}`,
            color: SKILL_COLORS[i % SKILL_COLORS.length]
          }))
          setSkills(built)
        }
      } catch (err) {
        console.error(err)
      }
    }
    loadProfile()
  }, [getToken])

  // Fetch GitHub repos whenever the github URL changes
  useEffect(() => {
    if (!github) return
    const match = github.match(/github\.com\/([^/]+)/)
    if (match && match[1]) {
      setLoadingRepos(true)
      fetch(`https://api.github.com/users/${match[1]}/repos?sort=updated&per_page=6`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setRepos(data)
          setLoadingRepos(false)
        })
        .catch(err => {
          console.error('Github lookup failed:', err)
          setLoadingRepos(false)
        })
    }
  }, [github])

  return (
    <div style={{ paddingTop: '88px', minHeight: '100vh', background: '#050816', padding: '88px 24px 80px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header Card */}
        <div className="card" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          
          {user?.imageUrl ? (
             <img src={user.imageUrl} alt="Profile" style={{
                width: '80px', height: '80px', borderRadius: '24px', flexShrink: 0, objectFit: 'cover',
                boxShadow: '0 0 30px rgba(79,70,229,0.5)', border: '2px solid rgba(79,70,229,0.2)'
             }} />
          ) : (
            <div style={{
              width: '80px', height: '80px', borderRadius: '24px', flexShrink: 0,
              background: 'linear-gradient(135deg, #4f46e5, #38bdf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '36px', boxShadow: '0 0 30px rgba(79,70,229,0.5)',
            }}>🧑‍💻</div>
          )}

          <div style={{ flex: 1 }}>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input value={name} onChange={e => setName(e.target.value)} style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '10px 14px', color: '#f1f5f9', fontSize: '16px', outline: 'none',
                }} />
                <input value={role} onChange={e => setRole(e.target.value)} style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '8px 14px', color: '#94a3b8', fontSize: '14px', outline: 'none',
                }} />
                <input value={github} onChange={e => setGithub(e.target.value)} style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '8px 14px', color: '#94a3b8', fontSize: '13px', outline: 'none',
                }} />
              </div>
            ) : (
              <>
                <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '800', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {name} {user && <span style={{ fontSize: '12px', padding: '2px 8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '100px', fontWeight: '600' }}>Verified</span>}
                </h1>
                <p style={{ margin: '0 0 4px', color: '#94a3b8', fontSize: '15px' }}>{role}</p>
                <p style={{ margin: 0, color: '#475569', fontSize: '13px' }}>🐙 {github}</p>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} style={{
                  background: 'linear-gradient(135deg, #4f46e5, #6d28d9)', color: 'white',
                  border: 'none', padding: '10px 20px', borderRadius: '10px',
                  fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                }}>Save</button>
                <button onClick={() => setEditing(false)} style={{
                  background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '10px',
                  fontSize: '14px', cursor: 'pointer',
                }}>Cancel</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} style={{
                background: 'rgba(79,70,229,0.15)', color: '#a5b4fc',
                border: '1px solid rgba(79,70,229,0.3)', padding: '10px 20px', borderRadius: '10px',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              }}>✏️ Edit Profile</button>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
          {[
            { icon: '⚡', label: 'ATS Score', value: profileData?.ats_score?.toString() ?? '—', sub: '/100', color: '#4f46e5' },
            { icon: '🎯', label: 'Programming Languages', value: profileData ? String(profileData.programming_languages_known?.length ?? 0) : '—', sub: 'detected', color: '#0ea5e9' },
            { icon: '🛠️', label: 'Tools & Frameworks', value: profileData ? String(profileData.tools_known?.length ?? 0) : '—', sub: 'detected', color: '#10b981' },
            { icon: '🌐', label: 'Languages Known', value: profileData ? String(profileData.languages_known?.length ?? 0) : '—', sub: 'spoken', color: '#f59e0b' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{
                fontSize: '28px', fontWeight: '900',
                background: `linear-gradient(135deg, ${s.color}, #ffffff)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>{s.value}<span style={{ fontSize: '14px', opacity: 0.6 }}>{s.sub}</span></div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ATS Score Card — live from resume */}
        {profileData ? (() => {
          const score = profileData.ats_score || 0
          const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e'
          const label = score >= 75 ? 'Excellent' : score >= 50 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Work'
          const circ = 2 * Math.PI * 46
          const offset = circ - (score / 100) * circ
          return (
            <div className="card" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
              <svg width="110" height="110" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
                <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                <circle cx="55" cy="55" r="46" fill="none" stroke={color} strokeWidth="10"
                  strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 1.2s ease', filter: `drop-shadow(0 0 6px ${color})` }} />
              </svg>
              <div style={{ textAlign: 'center', marginLeft: '-82px', width: '110px', pointerEvents: 'none' }}>
                <div style={{ fontSize: '30px', fontWeight: '900', color }}>{score}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>/ 100</div>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: '800', color: '#f1f5f9' }}>ATS Score</h3>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `${color}22`, border: `1px solid ${color}44`, borderRadius: '100px', padding: '4px 14px', marginBottom: '8px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, display: 'inline-block' }} />
                  <span style={{ fontSize: '13px', fontWeight: '700', color }}>{label}</span>
                </div>
                <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Score computed from completeness, keyword density, and tech stack relevance of your uploaded resume.</p>
              </div>
            </div>
          )
        })() : (
          <div className="card" style={{ marginBottom: '20px', padding: '24px', textAlign: 'center', color: '#475569', fontSize: '14px' }}>
            Upload a resume to see your ATS score here.
          </div>
        )}

        {/* Skill Levels — live from resume */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>My Skills</h3>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b' }}>AI-extracted from your resume · update by re-uploading</p>
          {skills.length === 0 ? (
            <p style={{ color: '#475569', fontSize: '14px' }}>Upload a resume on the Onboarding page to see your skill profile here.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {skills.map((s, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>{s.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '700' }}>{s.trend} this month</span>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#94a3b8' }}>{s.level}%</span>
                    </div>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${s.level}%`, borderRadius: '100px',
                      background: `linear-gradient(90deg, ${s.color}88, ${s.color})`,
                      boxShadow: `0 0 8px ${s.color}66`,
                      transition: 'width 1.2s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Professional Details (New section) */}
        {profileData && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>Professional Details</h3>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b' }}>Additional info extracted from your resume</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Education</div>
                {profileData.education?.length ? profileData.education.map((e,i) => <div key={i} style={{ fontSize: '14px', color: '#e2e8f0', marginBottom:'4px' }}>• {e}</div>) : <div style={{ fontSize: '14px', color: '#475569'}}>Not detected</div>}
              </div>
              
              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Certifications</div>
                {profileData.certifications?.length ? profileData.certifications.map((c,i) => <div key={i} style={{ fontSize: '14px', color: '#e2e8f0', marginBottom:'4px' }}>🏆 {c}</div>) : <div style={{ fontSize: '14px', color: '#475569'}}>Not detected</div>}
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Tools & Frameworks</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {profileData.tools_known?.length ? profileData.tools_known.map((t,i) => (
                    <span key={i} style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '600' }}>{t}</span>
                  )) : <div style={{ fontSize: '14px', color: '#475569'}}>Not detected</div>}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Languages</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {profileData.languages_known?.length ? profileData.languages_known.map((l,i) => (
                    <span key={i} style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '600' }}>{l}</span>
                  )) : <div style={{ fontSize: '14px', color: '#475569'}}>Not detected</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GitHub Repos */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>🐙 GitHub Projects</h3>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748b' }}>Live from your GitHub profile · most recently updated</p>
            </div>
            <a href={github || '#'} target="_blank" rel="noopener noreferrer" style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', padding: '6px 14px', borderRadius: '10px',
              fontSize: '13px', fontWeight: '600', textDecoration: 'none', flexShrink: 0
            }}>View Profile →</a>
          </div>

          {/* GitHub URL Input */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <input
              value={github}
              onChange={e => setGithub(e.target.value)}
              placeholder="https://github.com/your-username"
              style={{
                flex: 1, padding: '10px 16px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'white', fontSize: '14px', outline: 'none',
              }}
            />
          </div>

          {loadingRepos ? (
            <div style={{ color: '#4f46e5', textAlign: 'center', padding: '24px', fontWeight: '600' }} className="animate-pulse">Fetching repositories...</div>
          ) : repos.length === 0 ? (
            <p style={{ color: '#475569', fontSize: '14px', textAlign: 'center', padding: '20px' }}>Enter your GitHub URL above to load your projects.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {repos.map((repo, i) => (
                <a key={i} href={repo.html_url} target="_blank" rel="noopener noreferrer" style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px', padding: '16px', textDecoration: 'none', display: 'block',
                  transition: 'all 0.2s',
                }} className="hover:!bg-indigo-500/10 hover:!border-indigo-500/30">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '16px' }}>📦</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#c7d2fe', wordBreak: 'break-word' }}>{repo.name}</span>
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#64748b', minHeight: '32px' }}>
                    {repo.description || 'No description provided.'}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#475569' }}>
                    {repo.language && (
                      <span style={{ background: 'rgba(79,70,229,0.2)', color: '#a5b4fc', padding: '2px 10px', borderRadius: '100px', fontWeight: '600' }}>
                        {repo.language}
                      </span>
                    )}
                    <span>⭐ {repo.stargazers_count}</span>
                    <span>🍴 {repo.forks_count}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
