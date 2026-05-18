import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'

const STATS = [
  { value: '87%', label: 'CS grads report skill mismatch' },
  { value: '6.2mo', label: 'Avg. time to first relevant role' },
  { value: '$30K+', label: 'Cost per mismatched hire' },
  { value: '18mo', label: 'Curriculum lag behind market' },
]

const FEATURES = [
  {
    icon: '⚡',
    title: 'Skill Demand Score',
    desc: 'A real-time composite score (0–100) aligning your skill vector against live market demand signals.',
    color: '#4f46e5',
  },
  {
    icon: '🧠',
    title: 'NLP Skill Extraction',
    desc: 'Resume & GitHub parsed with transformer-based NER — not keyword lists. Skills extracted and versioned.',
    color: '#0ea5e9',
  },
  {
    icon: '🎯',
    title: 'Demand-Weighted Recs',
    desc: 'Roles and courses ranked by real-time market demand, not engagement signals or sponsored listings.',
    color: '#10b981',
  },
  {
    icon: '🗺️',
    title: 'Gap-to-Path Engine',
    desc: 'Every skill gap auto-mapped to a curated 30/60/90-day roadmap with time-to-proficiency estimates.',
    color: '#f59e0b',
  },
  {
    icon: '📈',
    title: 'Adaptive Skill Graph',
    desc: 'Your profile is a living vector — updated on every login, course completion, or new project push.',
    color: '#8b5cf6',
  },
  {
    icon: '🔗',
    title: 'GitHub Intelligence',
    desc: 'Connect your GitHub and we infer skills from repos, languages, commit patterns, and activity.',
    color: '#f43f5e',
  },
]

export default function Home() {
  const auroraRef = useRef(null)

  useEffect(() => {
    const el = auroraRef.current
    if (!el) return
    let x = 0
    const interval = setInterval(() => {
      x += 0.005
      el.style.transform = `translate(${Math.sin(x) * 5}%, ${Math.cos(x) * 5}%) scale(1.15)`
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', background: '#050816' }}>

      {/* Aurora Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div ref={auroraRef} style={{
          position: 'absolute', width: '120%', height: '120%', top: '-10%', left: '-10%',
          background: 'radial-gradient(ellipse 60% 50% at 30% 30%, rgba(79,70,229,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 70% 70%, rgba(56,189,248,0.12) 0%, transparent 60%)',
          transition: 'transform 0.1s ease',
        }} />
      </div>

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '100px 24px 80px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.3)',
          borderRadius: '100px', padding: '6px 16px', marginBottom: '32px',
          fontSize: '13px', color: '#a5b4fc',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4f46e5', display: 'inline-block', boxShadow: '0 0 8px #4f46e5', animation: 'pulse 2s infinite' }} />
          Career Intelligence, Not Career Matching
        </div>

        <h1 style={{
          fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: '900', lineHeight: 1.05,
          letterSpacing: '-2px', margin: '0 0 24px',
          background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 50%, #4f46e5 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Your Skills,<br />Demand-Weighted.
        </h1>

        <p style={{
          fontSize: '20px', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 48px',
          lineHeight: 1.7, fontWeight: '400',
        }}>
          Scope & Hope continuously maps your developer skills against live market demand,
          surfacing exactly what to learn next — not 18 months from now.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/onboarding">
            <button style={{
              background: 'linear-gradient(135deg, #4f46e5, #6d28d9)',
              color: 'white', border: 'none', padding: '16px 36px',
              borderRadius: '14px', fontSize: '16px', fontWeight: '700', cursor: 'pointer',
              boxShadow: '0 8px 40px rgba(79,70,229,0.5)',
              transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '8px',
            }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
               onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              Analyse My Skills <span>→</span>
            </button>
          </Link>
          <Link to="/dashboard">
            <button style={{
              background: 'transparent', color: '#94a3b8',
              border: '1px solid rgba(255,255,255,0.12)',
              padding: '16px 36px', borderRadius: '14px', fontSize: '16px',
              fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s',
            }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff' }}
               onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}>
              View Dashboard
            </button>
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px' }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1px', background: 'rgba(255,255,255,0.06)', borderRadius: '20px', overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              padding: '32px 24px', textAlign: 'center',
              background: 'rgba(13,18,36,0.8)',
              transition: 'background 0.3s',
            }} onMouseOver={e => e.currentTarget.style.background = 'rgba(79,70,229,0.1)'}
               onMouseOut={e => e.currentTarget.style.background = 'rgba(13,18,36,0.8)'}>
              <div style={{
                fontSize: '36px', fontWeight: '900', letterSpacing: '-1px',
                background: 'linear-gradient(135deg, #4f46e5, #38bdf8)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>{s.value}</div>
              <div style={{ color: '#64748b', fontSize: '13px', marginTop: '6px', lineHeight: 1.5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 120px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center', fontSize: '42px', fontWeight: '800',
            letterSpacing: '-1px', marginBottom: '12px', color: '#f1f5f9',
          }}>
            Intelligence, not indirection.
          </h2>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '16px', marginBottom: '64px' }}>
            Six interlocking systems that turn your skills into career momentum.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card" style={{ cursor: 'default' }}
                   onMouseOver={e => e.currentTarget.style.borderColor = f.color + '66'}
                   onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px',
                  background: f.color + '22', border: `1px solid ${f.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', marginBottom: '16px',
                }}>{f.icon}</div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 10px' }}>{f.title}</h3>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* End of Page */}

    </div>
  )
}
