const COURSES = [
  {
    title: 'LLM Engineering: Build RAG Apps',
    provider: 'DeepLearning.AI',
    duration: '14h',
    level: 'Intermediate',
    relevance: 94,
    skills: ['LangChain', 'RAG', 'Embeddings'],
    icon: '🧬',
    color: '#38bdf8',
    upskillGap: 'LLMs/RAG',
  },
  {
    title: 'Docker & Kubernetes for Devs',
    provider: 'Udemy',
    duration: '22h',
    level: 'Beginner',
    relevance: 88,
    skills: ['Docker', 'K8s', 'CI/CD'],
    icon: '🐳',
    color: '#4f46e5',
    upskillGap: 'Docker',
  },
  {
    title: 'Fine-Tuning LLMs with LoRA',
    provider: 'Hugging Face',
    duration: '10h',
    level: 'Advanced',
    relevance: 82,
    skills: ['PEFT', 'LoRA', 'PyTorch'],
    icon: '🔧',
    color: '#f59e0b',
    upskillGap: 'Fine-tuning',
  },
]

export default function CourseCards() {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>Gap-Targeted Courses</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Prioritised by your skill gap severity</p>
        </div>
        <button style={{
          background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.3)',
          color: '#a5b4fc', padding: '8px 16px', borderRadius: '10px',
          fontSize: '13px', fontWeight: '600', cursor: 'pointer',
        }}>Browse all →</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {COURSES.map((c, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseOver={e => { e.currentTarget.style.background = c.color + '11'; e.currentTarget.style.borderColor = c.color + '44' }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', gap: '14px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                background: c.color + '22', border: `1px solid ${c.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
              }}>{c.icon}</div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#f1f5f9', lineHeight: 1.4 }}>{c.title}</span>
                  <span style={{
                    fontSize: '12px', fontWeight: '800', flexShrink: 0,
                    padding: '3px 10px', borderRadius: '100px',
                    background: c.color + '22', color: c.color,
                    border: `1px solid ${c.color}44`,
                  }}>{c.relevance}%</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{c.provider}</span>
                  <span style={{ color: '#1e293b' }}>•</span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{c.duration}</span>
                  <span style={{ color: '#1e293b' }}>•</span>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '100px',
                    background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
                  }}>{c.level}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {c.skills.map((s, j) => (
                      <span key={j} style={{
                        fontSize: '11px', padding: '3px 10px', borderRadius: '100px',
                        background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
                        border: '1px solid rgba(255,255,255,0.07)',
                      }}>{s}</span>
                    ))}
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Fills gap: <span style={{ color: c.color, fontWeight: '600' }}>{c.upskillGap}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
