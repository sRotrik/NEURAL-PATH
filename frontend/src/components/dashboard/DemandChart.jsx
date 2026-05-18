import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { week: 'W1 Feb', react: 62, python: 55, llm: 40, docker: 48 },
  { week: 'W2 Feb', react: 65, python: 60, llm: 48, docker: 50 },
  { week: 'W3 Feb', react: 68, python: 65, llm: 58, docker: 52 },
  { week: 'W4 Feb', react: 72, python: 68, llm: 66, docker: 55 },
  { week: 'W1 Mar', react: 74, python: 70, llm: 72, docker: 57 },
  { week: 'W2 Mar', react: 76, python: 73, llm: 78, docker: 60 },
  { week: 'W3 Mar', react: 78, python: 76, llm: 85, docker: 62 },
  { week: 'W4 Mar', react: 80, python: 79, llm: 90, docker: 64 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#0d1224', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px', padding: '12px 16px',
    }}>
      <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 8px' }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: '600' }}>{p.name}: {p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function DemandChart() {
  return (
    <div className="card" style={{ height: '340px' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>Market Demand Trends</h3>
      <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#64748b' }}>Weekly demand signals from job postings (normalized 0-100)</p>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
          <defs>
            {[
              { id: 'react', color: '#4f46e5' },
              { id: 'python', color: '#10b981' },
              { id: 'llm', color: '#38bdf8' },
              { id: 'docker', color: '#f59e0b' },
            ].map(g => (
              <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={g.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={g.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[30, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="llm" name="LLMs/RAG" stroke="#38bdf8" fill="url(#llm)" strokeWidth={2} />
          <Area type="monotone" dataKey="react" name="React" stroke="#4f46e5" fill="url(#react)" strokeWidth={2} />
          <Area type="monotone" dataKey="python" name="Python" stroke="#10b981" fill="url(#python)" strokeWidth={2} />
          <Area type="monotone" dataKey="docker" name="Docker" stroke="#f59e0b" fill="url(#docker)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
