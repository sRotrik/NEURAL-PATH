import { useEffect, useRef } from 'react'

export default function ScoreCard({ score = 74, breakdown = [] }) {
  const circleRef = useRef(null)
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color = score >= 75 ? '#22d3ee' : score >= 50 ? '#4f46e5' : '#f43f5e'
  const label = score >= 75 ? 'Excellent' : score >= 50 ? 'Good' : 'Needs Work'

  useEffect(() => {
    const el = circleRef.current
    if (!el) return
    el.style.transition = 'none'
    el.style.strokeDashoffset = circumference
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
        el.style.strokeDashoffset = offset
      })
    })
  }, [score])

  return (
    <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>Skill Demand Score</h3>
      <p style={{ margin: '0 0 28px', fontSize: '13px', color: '#64748b' }}>Your market alignment score</p>

      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
        <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
          {/* Progress */}
          <circle
            ref={circleRef}
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            filter={`drop-shadow(0 0 10px ${color})`}
          />
        </svg>
        <div style={{ position: 'absolute', textAlign: 'center' }}>
          <div style={{
            fontSize: '52px', fontWeight: '900', lineHeight: 1,
            background: `linear-gradient(135deg, ${color}, #ffffff)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>{score}</div>
          <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>/ 100</div>
        </div>
      </div>

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: color + '22', border: `1px solid ${color}44`,
        borderRadius: '100px', padding: '6px 18px',
        fontSize: '14px', fontWeight: '600', color, marginBottom: '24px'
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, display: 'inline-block' }} />
        {label}
      </div>

      {breakdown && breakdown.length > 0 && (
         <div className="text-left bg-white/5 border border-white/10 p-4 rounded-xl">
            <div className="text-xs text-gray-400 font-bold mb-2 uppercase tracking-wide">🧠 ATS Breakdown</div>
            <ul className="text-xs text-gray-300 space-y-2 m-0 p-0 pl-1 list-none">
               {breakdown.map((item, i) => (
                  <li key={i} className="flex gap-2 items-start leading-relaxed">
                     <span className="text-indigo-400 mt-0.5">•</span>
                     {item}
                  </li>
               ))}
            </ul>
         </div>
      )}

    </div>
  )
}
