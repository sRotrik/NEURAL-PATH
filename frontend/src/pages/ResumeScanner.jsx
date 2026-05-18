import { useState, useRef } from 'react'
import { useAuth } from '@clerk/clerk-react'

const COLORS = {
  programming:  '#4f46e5',
  tools:        '#10b981',
  soft:         '#f59e0b',
  lang:         '#0ea5e9',
  cert:         '#ec4899',
  edu:          '#8b5cf6',
  experience:   '#38bdf8',
  achievements: '#f97316',
}

function ScoreRing({ score }) {
  const radius = 54
  const circ = 2 * Math.PI * radius
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e'

  return (
    <div style={{ position: 'relative', width: '140px', height: '140px', flexShrink: 0 }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={radius} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: '32px', fontWeight: '900', color }}>{score}</span>
        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>/ 100</span>
      </div>
    </div>
  )
}

function TagList({ items, color, empty = 'Not detected' }) {
  if (!items?.length) return <span style={{ color: '#475569', fontSize: '13px' }}>{empty}</span>
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {items.map((item, i) => (
        <span key={i} style={{
          background: `${color}18`, color, border: `1px solid ${color}44`,
          padding: '4px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: '600',
        }}>{item}</span>
      ))}
    </div>
  )
}

function BulletList({ items, color, empty = 'Not detected' }) {
  if (!items?.length) return <span style={{ color: '#475569', fontSize: '13px' }}>{empty}</span>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map((item, i) => {
        const textRender = typeof item === 'object' 
           ? `${item.role || ''} ${item.company ? 'at ' + item.company : ''} ${item.duration ? '('+item.duration+')' : ''} ${item.summary ? '- ' + item.summary : ''}`.trim() || JSON.stringify(item)
           : item;

        return (
          <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ color, fontSize: '16px', lineHeight: '1.4', flexShrink: 0 }}>▸</span>
            <span style={{ fontSize: '14px', color: '#e2e8f0', lineHeight: '1.5' }}>{textRender}</span>
          </div>
        )
      })}
    </div>
  )
}

function Section({ icon, title, children, fullWidth = false }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px',
      gridColumn: fullWidth ? '1 / -1' : undefined,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span style={{ fontSize: '18px' }}>{icon}</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#e2e8f0' }}>{title}</span>
      </div>
      {children}
    </div>
  )
}

export default function ResumeScanner() {
  const { getToken } = useAuth()
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle')   // idle | scanning | done | error
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const handleFile = async (f) => {
    if (!f || f.type !== 'application/pdf') return
    setFile(f)
    setStatus('scanning')
    setProgress(20)

    try {
      const formData = new FormData()
      formData.append('resume', f)
      setProgress(50)

      const token = await getToken()
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const res = await fetch('http://localhost:4000/api/resume/upload', {
        method: 'POST', headers, body: formData,
      })
      if (!res.ok) throw new Error('Upload failed')

      const data = await res.json()
      setProgress(100)
      setStatus('done')
      setResult(data.profile)
    } catch (e) {
      console.error(e)
      setStatus('error')
    }
  }

  const onDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }
  const reset  = () => { setFile(null); setStatus('idle'); setProgress(0); setResult(null) }

  const score = result?.ats_score ?? 0
  const scoreLabel = score >= 80 ? '🟢 Excellent' : score >= 60 ? '🟡 Good' : score >= 40 ? '🟠 Fair' : '🔴 Needs Work'

  return (
    <div style={{ minHeight: '100vh', background: '#050816', padding: '96px 24px 80px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.3)',
            borderRadius: '100px', padding: '6px 16px', marginBottom: '16px',
          }}>
            <span style={{ fontSize: '13px', color: '#a5b4fc', fontWeight: '600' }}>🤖 AI-Powered Resume Agent</span>
          </div>
          <h1 style={{
            fontSize: '40px', fontWeight: '900', margin: '0 0 12px',
            background: 'linear-gradient(135deg, #e0e7ff, #94a3b8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Resume Scanner</h1>
          <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>
            Upload your PDF resume. Our AI blends <strong style={{color:'#a5b4fc'}}>resume quality</strong> + <strong style={{color:'#34d399'}}>live job market demand</strong> to compute your real ATS score.
          </p>
        </div>

        {/* Upload Zone */}
        {status === 'idle' && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? '#4f46e5' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '20px', padding: '64px 32px', textAlign: 'center', cursor: 'pointer',
              background: dragging ? 'rgba(79,70,229,0.06)' : 'rgba(255,255,255,0.015)',
              transition: 'all 0.25s', marginBottom: '32px',
            }}
          >
            <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>📋</div>
            <p style={{ color: '#c7d2fe', fontSize: '18px', fontWeight: '700', margin: '0 0 8px' }}>Drop your resume here</p>
            <p style={{ color: '#475569', fontSize: '14px', margin: '0 0 24px' }}>PDF only · Max 10 MB · Parsed by NLP + Groq LLM</p>
            <button style={{
              background: 'linear-gradient(135deg, #4f46e5, #6d28d9)', color: 'white',
              border: 'none', padding: '12px 32px', borderRadius: '12px',
              fontSize: '14px', fontWeight: '700', cursor: 'pointer',
              boxShadow: '0 0 20px rgba(79,70,229,0.4)',
            }}>Browse PDF</button>
          </div>
        )}

        {/* Scanning Progress */}
        {status === 'scanning' && (
          <div className="card" style={{ marginBottom: '32px', textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px', animation: 'spin 2s linear infinite' }}>⚙️</div>
            <p style={{ color: '#a5b4fc', fontSize: '18px', fontWeight: '700', margin: '0 0 20px' }}>
              {progress < 50 ? 'Uploading resume...' : progress < 90 ? 'AI extracting skills & inferring target role...' : 'Fetching live job market demand via JSearch...'}
            </p>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden', maxWidth: '360px', margin: '0 auto' }}>
              <div style={{
                height: '100%', borderRadius: '100px',
                background: 'linear-gradient(90deg, #4f46e5, #38bdf8)',
                width: `${progress}%`, transition: 'width 0.4s ease',
                boxShadow: '0 0 12px rgba(79,70,229,0.7)',
              }} />
            </div>
            <p style={{ color: '#475569', fontSize: '13px', marginTop: '12px' }}>{file?.name}</p>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="card" style={{ marginBottom: '32px', textAlign: 'center', padding: '40px', border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.06)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>❌</div>
            <p style={{ color: '#f87171', fontSize: '16px', fontWeight: '700', margin: '0 0 16px' }}>Scan failed.</p>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px' }}>Make sure the backend and AI service are running, then try again.</p>
            <button onClick={reset} style={{ background: 'rgba(244,63,94,0.15)', color: '#f87171', border: '1px solid rgba(244,63,94,0.3)', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>Try Again</button>
          </div>
        )}

        {/* Results */}
        {status === 'done' && result && (
          <>
            {/* ATS Score Hero */}
            <div className="card" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
              <ScoreRing score={score} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#f1f5f9' }}>ATS Score</h2>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#94a3b8' }}>{scoreLabel}</span>
                </div>
                {/* Sub-scores */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {result.llm_quality_score != null && (
                    <div style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '10px', padding: '6px 14px' }}>
                      <span style={{ fontSize: '11px', color: '#818cf8', fontWeight: '700', display: 'block' }}>📄 RESUME QUALITY</span>
                      <span style={{ fontSize: '18px', fontWeight: '900', color: '#a5b4fc' }}>{result.llm_quality_score}<span style={{fontSize:'11px', color:'#64748b'}}>/100</span></span>
                    </div>
                  )}
                  {result.market_score != null && result.market_score > 0 && (
                    <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '6px 14px' }}>
                      <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', display: 'block' }}>🌐 MARKET DEMAND</span>
                      <span style={{ fontSize: '18px', fontWeight: '900', color: '#34d399' }}>{result.market_score}<span style={{fontSize:'11px', color:'#64748b'}}>/100</span></span>
                    </div>
                  )}
                  {result.jobs_analyzed > 0 && (
                    <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '10px', padding: '6px 14px' }}>
                      <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '700', display: 'block' }}>🔍 JOBS ANALYZED</span>
                      <span style={{ fontSize: '18px', fontWeight: '900', color: '#fcd34d' }}>{result.jobs_analyzed}</span>
                    </div>
                  )}
                </div>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 6px' }}>
                  Blended score: <strong style={{color:'#a5b4fc'}}>60% resume quality</strong> + <strong style={{color:'#34d399'}}>40% live market demand</strong> via JSearch (RapidAPI).
                </p>
                <p style={{ color: '#475569', fontSize: '12px', margin: 0, fontStyle: 'italic' }}>
                  📄 {file?.name} · {result.top_role && <span>Target role: <strong style={{color:'#c7d2fe'}}>{result.top_role}</strong> · </span>}Scope & Hope AI Agent
                </p>
              </div>
              <button onClick={reset} style={{
                background: 'rgba(79,70,229,0.15)', color: '#a5b4fc',
                border: '1px solid rgba(79,70,229,0.3)', padding: '10px 20px',
                borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', flexShrink: 0,
              }}>Scan Another</button>
            </div>

            {/* ATS Breakdown */}
            {result.ats_breakdown?.length > 0 && (
              <div style={{
                marginBottom: '20px', padding: '20px', borderRadius: '16px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '18px' }}>📊</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#e2e8f0' }}>ATS Score Breakdown</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {result.ats_breakdown.map((b, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start',
                      background: 'rgba(255,255,255,0.025)', borderRadius: '10px', padding: '10px 14px' }}>
                      <span style={{ fontSize: '15px', lineHeight: '1.4', flexShrink: 0 }}>
                        {b.startsWith('🔥') ? '' : b.startsWith('📉') ? '' : b.startsWith('📊') ? '' : '▸'}
                      </span>
                      <span style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Market Demand Chart */}
            {result.demand_data && Object.keys(result.demand_data).length > 0 && (
              <div style={{
                marginBottom: '20px', padding: '20px', borderRadius: '16px',
                background: 'rgba(16,185,129,0.03)', border: '1px solid rgba(16,185,129,0.15)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '18px' }}>🌐</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#e2e8f0' }}>Live Market Demand</span>
                  <span style={{ fontSize: '12px', color: '#64748b', marginLeft: 'auto' }}>
                    Based on {result.jobs_analyzed} live {result.top_role} job postings
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(result.demand_data)
                    .sort(([,a],[,b]) => b - a)
                    .map(([skill, pct]) => {
                      const barColor = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#f43f5e'
                      return (
                        <div key={skill}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '600', textTransform: 'capitalize' }}>{skill}</span>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: barColor }}>{pct}% of jobs</span>
                          </div>
                          <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: '100px',
                              background: barColor, width: `${pct}%`,
                              transition: 'width 1s ease',
                              boxShadow: `0 0 8px ${barColor}88`,
                            }} />
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              </div>
            )}

            {/* Feature Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '16px' }}>

              <Section icon="🎓" title="Education">
                {result.education?.length
                  ? result.education.map((e, i) => <div key={i} style={{ fontSize: '14px', color: '#e2e8f0' }}>• {e}</div>)
                  : <span style={{ color: '#475569', fontSize: '13px' }}>Not detected</span>}
              </Section>

              <Section icon="🏆" title="Certifications">
                <TagList items={result.certifications} color={COLORS.cert} />
              </Section>

              <Section icon="💻" title="Programming Languages">
                <TagList items={result.programming_languages_known} color={COLORS.programming} />
              </Section>

              <Section icon="🛠️" title="Tools & Frameworks">
                <TagList items={result.tools_known} color={COLORS.tools} />
              </Section>

              <Section icon="🌐" title="Languages Known">
                <TagList items={result.languages_known} color={COLORS.lang} />
              </Section>

              <Section icon="🤝" title="Soft Skills">
                <TagList items={result.soft_skills} color={COLORS.soft} />
              </Section>

              {/* Experience — full width */}
              <Section icon="💼" title="Work & Internship Experience" fullWidth>
                <BulletList items={result.experience} color={COLORS.experience} empty="No work experience detected — consider adding internships, freelance work, or projects." />
              </Section>

              {/* Achievements — full width */}
              <Section icon="🏅" title="Achievements & Recognitions" fullWidth>
                <BulletList items={result.achievements} color={COLORS.achievements} empty="No achievements detected — consider adding awards, scholarships, publications, or open-source contributions." />
              </Section>

            </div>

            {/* Tip Banner */}
            <div style={{
              marginTop: '24px', padding: '16px 20px', borderRadius: '14px',
              background: 'rgba(79,70,229,0.07)', border: '1px solid rgba(79,70,229,0.2)',
              display: 'flex', alignItems: 'flex-start', gap: '12px',
            }}>
              <span style={{ fontSize: '20px' }}>💡</span>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>
                <strong style={{ color: '#a5b4fc' }}>Boost your ATS score:</strong> Add quantifiable achievements (e.g., "reduced load time by 40%"), include keywords from live job postings shown above in red/orange, list certifications clearly, and add tools that appear in high-demand (green bars above).
              </p>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
