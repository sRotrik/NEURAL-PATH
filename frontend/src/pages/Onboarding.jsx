import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ResumeUpload from '../components/upload/ResumeUpload'

const STEPS = ['Import Profile', 'Add Skills', 'Compute Score']

const TOP_SKILLS = [
  'React', 'Node.js', 'Python', 'TypeScript', 'Docker',
  'PostgreSQL', 'Redis', 'FastAPI', 'LangChain', 'PyTorch',
  'AWS', 'GraphQL', 'Kubernetes', 'MongoDB', 'Rust',
  'RAG Pipelines', 'Vector DBs', 'Fine-tuning LLMs', 'Tailwind', 'Next.js',
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [githubUrl, setGithubUrl] = useState('')
  const [selected, setSelected] = useState([])
  const [resumeDone, setResumeDone] = useState(false)
  const navigate = useNavigate()

  const toggleSkill = (s) => setSelected(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])

  return (
    <div style={{ paddingTop: '88px', minHeight: '100vh', background: '#050816', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '100px 24px 80px' }}>
      <div style={{ width: '100%', maxWidth: '680px' }}>

        {/* Progress steps */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '48px', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: '20px', left: '0', right: '0', height: '2px',
            background: 'rgba(255,255,255,0.06)', zIndex: 0,
          }} />
          {STEPS.map((s, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: i <= step ? 'linear-gradient(135deg, #4f46e5, #6d28d9)' : 'rgba(255,255,255,0.05)',
                border: i <= step ? 'none' : '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: '800', color: i <= step ? '#fff' : '#475569',
                boxShadow: i === step ? '0 0 20px rgba(79,70,229,0.5)' : 'none',
                transition: 'all 0.4s',
              }}>{i < step ? '✓' : i + 1}</div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: i === step ? '#a5b4fc' : '#475569' }}>{s}</span>
            </div>
          ))}
        </div>

        {/* Step 0 — Import */}
        {step === 0 && (
          <div style={{ animation: 'fade-up 0.4s ease' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
              Import your profile
            </h2>
            <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '32px' }}>
              Upload a resume and Scope & Hope AI will instantly parse it, calculate your market match, and generate your dashboard.
            </p>

            <ResumeUpload onUploaded={(f, profile) => {
               // The user wants zero manual verification. Immediately bounce them to the real dashboard metrics!
               setTimeout(() => navigate('/dashboard'), 1500)
            }} />

            <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ color: '#475569', fontSize: '13px' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '10px' }}>
                🐙 GitHub Profile URL
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="url"
                  placeholder="https://github.com/yourusername"
                  value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', padding: '12px 16px', color: '#f1f5f9', fontSize: '14px', outline: 'none',
                  }}
                />
                <button style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px',
                }}>Analyse</button>
              </div>
            </div>

            <button
              onClick={() => setStep(1)}
              style={{
                width: '100%', marginTop: '24px',
                background: 'linear-gradient(135deg, #4f46e5, #6d28d9)',
                color: 'white', border: 'none', padding: '16px',
                borderRadius: '14px', fontSize: '16px', fontWeight: '700', cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(79,70,229,0.4)',
              }}>
              Continue →
            </button>
          </div>
        )}

         {/* Step 1 — Verify & Add Skills */}
        {step === 1 && (
          <div style={{ animation: 'fade-up 0.4s ease' }}>
            <div className="flex items-center gap-3 mb-2">
               <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse"></span>
               <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#f1f5f9', margin: '0', letterSpacing: '-0.5px' }}>
                 AI Verification
               </h2>
            </div>
            <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '32px' }}>
              We extracted these technologies from your resume. Verify them below or add missing ones. Accurate skills yield better job matches!
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '32px' }}>
              {Array.from(new Set([...selected, ...TOP_SKILLS])).map(s => {
                const on = selected.includes(s)
                return (
                  <button key={s} onClick={() => toggleSkill(s)} style={{
                    padding: '10px 18px', borderRadius: '100px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                    background: on ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.04)',
                    color: on ? '#34d399' : '#64748b',
                    border: on ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255,255,255,0.07)',
                    transition: 'all 0.2s',
                    boxShadow: on ? '0 0 12px rgba(16, 185, 129, 0.2)' : 'none',
                  }}>{on ? '✓ ' : '+ '}{s}</button>
                )
              })}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(0)} style={{
                flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8', padding: '14px', borderRadius: '14px', fontSize: '15px', cursor: 'pointer',
              }}>← Rescan PDF</button>
              <button onClick={() => navigate('/dashboard')} disabled={selected.length === 0} style={{
                flex: 2,
                background: selected.length > 0 ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)',
                color: selected.length > 0 ? 'white' : '#475569',
                border: 'none', padding: '14px', borderRadius: '14px', fontSize: '15px',
                fontWeight: '700', cursor: selected.length > 0 ? 'pointer' : 'not-allowed',
                boxShadow: selected.length > 0 ? '0 8px 30px rgba(16, 185, 129, 0.3)' : 'none',
                transition: 'all 0.3s',
              }}>
                {selected.length > 0 ? `Confirm ${selected.length} skills & Generate Dashboard →` : `Select at least 1 skill`}
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Computing */}
        {step === 2 && (
          <div style={{ animation: 'fade-up 0.4s ease', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px', animation: 'float 3s ease infinite' }}>🧠</div>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 12px' }}>
              Computing your score...
            </h2>
            <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '48px' }}>
              Vectorising {selected.length} skills · Querying live job market · Calculating Skill Demand Score
            </p>

            {[
              { label: 'Embedding skill vectors', done: true },
              { label: 'Fetching market demand data', done: true },
              { label: 'Running cosine similarity', done: true },
              { label: 'Generating recommendations', done: false },
            ].map((t, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 20px', background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px', marginBottom: '8px',
                border: `1px solid ${t.done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
              }}>
                <span style={{ fontSize: '16px' }}>{t.done ? '✅' : '⏳'}</span>
                <span style={{ fontSize: '14px', color: t.done ? '#94a3b8' : '#f1f5f9' }}>{t.label}</span>
              </div>
            ))}

            <button
              onClick={() => navigate('/dashboard')}
              style={{
                marginTop: '32px', width: '100%',
                background: 'linear-gradient(135deg, #4f46e5, #6d28d9)',
                color: 'white', border: 'none', padding: '16px',
                borderRadius: '14px', fontSize: '16px', fontWeight: '700', cursor: 'pointer',
                boxShadow: '0 0 30px rgba(79,70,229,0.5)',
              }}>
              View My Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
