import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@clerk/clerk-react'

const JOB_ROLES = [
  { label: 'Frontend Dev', icon: '🎨', slug: 'frontend' },
  { label: 'Backend Dev',  icon: '⚙️', slug: 'backend' },
  { label: 'Full Stack',   icon: '🚀', slug: 'full-stack' },
  { label: 'DevOps',       icon: '🛠️', slug: 'devops' },
  { label: 'Data Analyst', icon: '📊', slug: 'data-analyst' },
  { label: 'ML Engineer',  icon: '🤖', slug: 'ai-data-scientist' },
  { label: 'Mobile Dev',   icon: '📱', slug: 'flutter' },
  { label: 'Cloud / AWS',  icon: '☁️', slug: 'aws' },
]

const QUICK_PROMPTS = [
  'Best resources to get started',
  'What skills am I missing?',
  'Give me a 30/60/90 day roadmap',
  'How can I boost my ATS score?',
  'Top free courses for this role',
]

// Parse text into segments: plain text, **bold**, URLs
function RichText({ text }) {
  const urlRegex = /(https?:\/\/[^\s\)]+)/g
  const boldRegex = /\*\*(.+?)\*\*/g

  const renderSegment = (str, key) => {
    const parts = []
    let last = 0
    let m
    const combined = new RegExp(`(https?:\\/\\/[^\\s\\)]+|\\*\\*[^*]+\\*\\*)`, 'g')
    while ((m = combined.exec(str)) !== null) {
      if (m.index > last) parts.push(<span key={`t${last}`}>{str.slice(last, m.index)}</span>)
      const token = m[0]
      if (token.startsWith('http')) {
        parts.push(<a key={`u${m.index}`} href={token} target="_blank" rel="noopener noreferrer"
          style={{ color: '#38bdf8', fontWeight: '600', wordBreak: 'break-all' }}>{token}</a>)
      } else {
        // **bold**
        parts.push(<strong key={`b${m.index}`} style={{ color: '#e2e8f0' }}>{token.slice(2, -2)}</strong>)
      }
      last = m.index + token.length
    }
    if (last < str.length) parts.push(<span key={`t${last}`}>{str.slice(last)}</span>)
    return <span key={key}>{parts}</span>
  }

  return (
    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '14px' }}>
      {renderSegment(text, 0)}
    </div>
  )
}

export default function Coach() {
  const { getToken } = useAuth()
  const [profile, setProfile] = useState(null)
  const [jobRole, setJobRole]   = useState('')
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hi! I\'m **Scope & Hope Coach** — your job-aware AI mentor.\n\nSelect a target job role above and ask me anything. I\'ll recommend the best curated resources, roadmaps, and courses for your specific goal.' }
  ])
  const [history, setHistory]   = useState([])   // {role, content} for LLM context
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Load resume profile for context
  useEffect(() => {
    async function load() {
      try {
        const token = await getToken()
        const res = await fetch('http://localhost:4000/api/resume/my-profile', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        const data = await res.json()
        if (data.success && data.profile) setProfile(data.profile)
      } catch {}
    }
    load()
  }, [getToken])

  const knownSkills = [
    ...(profile?.programming_languages_known || []),
    ...(profile?.tools_known || []),
  ].slice(0, 10)

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return
    const userMsg = text.trim()
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setInput('')
    setLoading(true)

    const newHistory = [...history, { role: 'user', content: userMsg }]

    try {
      const res = await fetch('http://localhost:8000/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          job_role: jobRole,
          known_skills: knownSkills,
          conversation_history: history.slice(-6),
        })
      })
      const data = await res.json()
      const aiReply = data.reply || 'No response received.'
      setMessages(prev => [...prev, { role: 'ai', content: aiReply }])
      setHistory([...newHistory, { role: 'assistant', content: aiReply }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: 'ai', content: '❌ Unable to reach the AI Coach service. Make sure the Python AI service is running on port 8000.' }])
    }
    setLoading(false)
  }

  const handleQuickPrompt = (prompt) => sendMessage(prompt)
  const handleRoleSelect  = (role)   => {
    setJobRole(role.label)
    setMessages([{ role: 'ai', content: `Got it! I'll now focus on helping you become a **${role.label}**.\n\nI can see your skills: ${knownSkills.length ? knownSkills.join(', ') : 'none detected yet — upload a resume for personalised advice'}.\n\nWhat would you like to learn or improve first?` }])
    setHistory([])
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050816', padding: '80px 24px 0' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexShrink: 0 }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', boxShadow: '0 0 30px rgba(168,85,247,0.4)',
          }}>🤖</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#f1f5f9' }}>AI Career Coach</h1>
            <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '13px' }}>
              Job-aware · Resource-specific · Resume-contextualised
              {profile && <span style={{ color: '#10b981', marginLeft: '8px' }}>✓ Resume loaded</span>}
            </p>
          </div>
        </div>

        {/* Role Selection */}
        <div style={{ marginBottom: '14px', flexShrink: 0 }}>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Target Job Role</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {JOB_ROLES.map(r => (
              <button key={r.slug} onClick={() => handleRoleSelect(r)} style={{
                padding: '7px 14px', borderRadius: '100px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                background: jobRole === r.label ? 'rgba(168,85,247,0.25)' : 'rgba(255,255,255,0.04)',
                color:      jobRole === r.label ? '#d8b4fe' : '#94a3b8',
                border:     jobRole === r.label ? '1px solid rgba(168,85,247,0.5)' : '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.15s',
              }}>{r.icon} {r.label}</button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div style={{
          flex: 1, overflowY: 'auto', background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px',
          padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px',
          marginBottom: '12px',
        }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {m.role === 'ai' && (
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, marginRight: '10px',
                  background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                }}>🤖</div>
              )}
              <div style={{
                maxWidth: '78%', padding: '14px 18px', borderRadius: '16px',
                background: m.role === 'user' ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.04)',
                color: '#f1f5f9',
                border: m.role === 'user' ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.08)',
                borderBottomRightRadius: m.role === 'user' ? '4px' : '16px',
                borderBottomLeftRadius:  m.role === 'ai'   ? '4px' : '16px',
              }}>
                <RichText text={m.content} />
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🤖</div>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '14px 18px', borderRadius: '16px', borderBottomLeftRadius: '4px' }}>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#a855f7', animation: `bounce 1s ${i * 0.15}s infinite` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {jobRole && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px', flexShrink: 0 }}>
            {QUICK_PROMPTS.map(p => (
              <button key={p} onClick={() => handleQuickPrompt(p)} style={{
                padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: '600',
                background: 'rgba(99,102,241,0.1)', color: '#a5b4fc',
                border: '1px solid rgba(99,102,241,0.25)', cursor: 'pointer', transition: 'all 0.15s',
              }}>{p}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
          style={{ flexShrink: 0, display: 'flex', gap: '10px', paddingBottom: '20px' }}>
          <input
            type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder={jobRole ? `Ask about resources for ${jobRole}...` : 'Select a role above, then ask anything...'}
            style={{
              flex: 1, padding: '14px 20px', borderRadius: '14px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'white', fontSize: '14px', outline: 'none',
            }}
          />
          <button type="submit" disabled={loading || !input.trim()} style={{
            padding: '0 28px', borderRadius: '14px',
            background: loading || !input.trim() ? 'rgba(168,85,247,0.2)' : 'linear-gradient(135deg, #a855f7, #6366f1)',
            color: 'white', fontWeight: '700', border: 'none', fontSize: '14px',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
          }}>Send →</button>
        </form>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
