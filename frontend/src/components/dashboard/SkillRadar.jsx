import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'

const data = [
  { skill: 'React', user: 85, market: 90 },
  { skill: 'Node.js', user: 70, market: 80 },
  { skill: 'Python', user: 60, market: 88 },
  { skill: 'SQL', user: 75, market: 78 },
  { skill: 'Docker', user: 40, market: 72 },
  { skill: 'LLMs / RAG', user: 30, market: 91 },
  { skill: 'TypeScript', user: 65, market: 85 },
  { skill: 'Cloud (AWS)', user: 45, market: 82 },
]

export default function SkillRadar() {
  return (
    <div className="card" style={{ height: '380px' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>Skill Radar</h3>
      <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b' }}>Your skills vs. market demand</p>
      <ResponsiveContainer width="100%" height={290}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.07)" />
          <PolarAngleAxis dataKey="skill" tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ background: '#0d1224', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9' }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Radar name="Market Demand" dataKey="market" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.08} strokeWidth={2} dot={false} />
          <Radar name="Your Skills" dataKey="user" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} strokeWidth={2} dot={{ fill: '#4f46e5', r: 4 }} />
        </RadarChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: '20px', marginTop: '8px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4f46e5', display: 'inline-block' }} /> Your Skills
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }} /> Market Demand
        </div>
      </div>
    </div>
  )
}
