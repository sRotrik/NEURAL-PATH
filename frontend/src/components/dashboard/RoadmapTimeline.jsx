const ROADMAP = [
  {
    phase: '30 Days',
    color: '#4f46e5',
    icon: '🚀',
    title: 'Foundation Sprint',
    tasks: [
      { skill: 'LangChain Basics', hours: '12h', type: 'course' },
      { skill: 'Vector DB fundamentals', hours: '8h', type: 'course' },
      { skill: 'Build a RAG prototype', hours: '10h', type: 'project' },
    ],
  },
  {
    phase: '60 Days',
    color: '#0ea5e9',
    icon: '⚡',
    title: 'Momentum Build',
    tasks: [
      { skill: 'Fine-tuning LLMs (LoRA)', hours: '20h', type: 'course' },
      { skill: 'FastAPI + ML serving', hours: '10h', type: 'course' },
      { skill: 'Production RAG pipeline project', hours: '15h', type: 'project' },
    ],
  },
  {
    phase: '90 Days',
    color: '#10b981',
    icon: '🎯',
    title: 'Market Ready',
    tasks: [
      { skill: 'MLOps with Docker + K8s', hours: '16h', type: 'course' },
      { skill: 'Open-source contribution', hours: '20h', type: 'project' },
      { skill: 'Portfolio deployment + blog post', hours: '8h', type: 'project' },
    ],
  },
]

export default function RoadmapTimeline() {
  return (
    <div className="card">
      <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>Your Learning Roadmap</h3>
      <p style={{ margin: '0 0 28px', fontSize: '13px', color: '#64748b' }}>AI-generated 30/60/90 day plan based on your skill gaps</p>

      <div style={{ position: 'relative' }}>
        {/* Timeline line */}
        <div style={{
          position: 'absolute', left: '27px', top: '20px', bottom: '20px', width: '2px',
          background: 'linear-gradient(to bottom, #4f46e5, #0ea5e9, #10b981)',
          opacity: 0.4,
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {ROADMAP.map((phase, i) => (
            <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              {/* Phase icon */}
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px', flexShrink: 0,
                background: phase.color + '22', border: `2px solid ${phase.color}44`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', position: 'relative', zIndex: 1,
                boxShadow: `0 0 20px ${phase.color}33`,
              }}>
                {phase.icon}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{
                    fontSize: '12px', fontWeight: '700', letterSpacing: '1px',
                    color: phase.color, textTransform: 'uppercase',
                    background: phase.color + '22', padding: '3px 10px', borderRadius: '100px',
                  }}>{phase.phase}</span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#f1f5f9' }}>{phase.title}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {phase.tasks.map((t, j) => (
                    <div key={j} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 14px',
                      border: '1px solid rgba(255,255,255,0.05)',
                      transition: 'all 0.2s',
                    }}
                      onMouseOver={e => e.currentTarget.style.background = phase.color + '11'}
                      onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '14px' }}>{t.type === 'course' ? '📖' : '🔨'}</span>
                        <span style={{ fontSize: '14px', color: '#e2e8f0' }}>{t.skill}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{t.hours}</span>
                        <span style={{
                          fontSize: '11px', padding: '2px 8px', borderRadius: '100px',
                          background: t.type === 'course' ? 'rgba(79,70,229,0.2)' : 'rgba(16,185,129,0.2)',
                          color: t.type === 'course' ? '#a5b4fc' : '#6ee7b7',
                          border: t.type === 'course' ? '1px solid rgba(79,70,229,0.3)' : '1px solid rgba(16,185,129,0.3)',
                        }}>{t.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
