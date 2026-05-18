import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import ScoreCard from '../components/dashboard/ScoreCard'
import SkillRadar from '../components/dashboard/SkillRadar'
import DemandChart from '../components/dashboard/DemandChart'
import JobCards from '../components/recommendations/JobCards'

export default function Dashboard() {
  const { getToken } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = await getToken()
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
        const res = await fetch('http://localhost:4000/api/resume/my-profile', { headers })
        const data = await res.json()
        if (data.success && data.profile) {
          setProfile(data.profile)
        }
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyItems: 'center', background: '#050816', color: 'white', justifyContent: 'center' }}>
         <div className="animate-pulse text-indigo-400 font-bold text-xl">Loading AI Analytics...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={{ paddingTop: '140px', minHeight: '100vh', background: '#050816', color: 'white', textAlign: 'center' }}>
        <h2 className="text-3xl font-bold mb-4">No Resume Detected</h2>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">You need to upload your resume to generate your Career Intelligence Dashboard. Our AI needs data to calculate your market score and fetch jobs.</p>
        <Link to="/onboarding" className="bg-gradient-to-r from-indigo-600 to-sky-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-500/20">
          Upload Resume Now
        </Link>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: '88px', minHeight: '100vh', background: '#050816', padding: '88px 24px 80px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #4f46e5, #38bdf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', boxShadow: '0 0 30px rgba(79,70,229,0.5)',
            }}>🧠</div>
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-0.5px' }}>
                Career Intelligence Dashboard
              </h1>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
                Extracted cleanly from your uploaded Resume Document.
              </p>
            </div>
          </div>
        </div>

        {/* Row 1: Score + Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 320px) 1fr', gap: '20px', marginBottom: '20px' }} className="lg:grid-cols-[320px_1fr] grid-cols-1">
          <ScoreCard 
             score={profile.ats_score || 0} 
             breakdown={profile.ats_breakdown || []}
          />
          
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
             <h3 className="text-xl font-bold text-white mb-2 border-b border-white/5 pb-3">AI Extracted Overview</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                   <div className="text-sm text-gray-400 mb-1">Education</div>
                   <div className="font-semibold text-white">{profile.education?.length > 0 ? profile.education[0] : "None Detected"}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                   <div className="text-sm text-gray-400 mb-1">Certifications</div>
                   <div className="font-semibold text-white">{profile.certifications?.length > 0 ? profile.certifications[0] : "None Detected"}</div>
                </div>
             </div>

              <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20">
                 <div className="text-sm text-indigo-300 mb-2 font-semibold">Programming Languages</div>
                 <div className="flex flex-wrap gap-2">
                    {(profile.programming_languages_known || []).map((s, i) => (
                       <span key={i} className="text-xs bg-indigo-500/20 text-indigo-200 px-2 py-1 rounded-md">{s}</span>
                    ))}
                    {!(profile.programming_languages_known?.length) && <span className="text-gray-500 text-xs">Not detected — upload a resume</span>}
                 </div>
              </div>

              <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                 <div className="text-sm text-emerald-300 mb-2 font-semibold">Tools & Frameworks</div>
                 <div className="flex flex-wrap gap-2">
                    {(profile.tools_known || []).map((s, i) => (
                       <span key={i} className="text-xs bg-emerald-500/20 text-emerald-200 px-2 py-1 rounded-md">{s}</span>
                    ))}
                    {!(profile.tools_known?.length) && <span className="text-gray-500 text-xs">Not detected — upload a resume</span>}
                 </div>
              </div>
              
              <div className="bg-sky-500/10 p-4 rounded-xl border border-sky-500/20">
                 <div className="text-sm text-sky-300 mb-2 font-semibold">Extracted Soft Skills</div>
                 <div className="flex flex-wrap gap-2">
                    {(profile.soft_skills || []).map((s, i) => (
                       <span key={i} className="text-xs bg-sky-500/20 text-sky-200 px-2 py-1 rounded-md">{s}</span>
                    ))}
                    {!(profile.soft_skills?.length) && <span className="text-gray-500 text-xs">Not detected — upload a resume</span>}
                 </div>
              </div>

              {/* Show Experience & Achievements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-fuchsia-500/10 p-4 rounded-xl border border-fuchsia-500/20">
                    <div className="text-sm text-fuchsia-300 mb-2 font-semibold">Experience & Roles</div>
                    <div className="flex flex-col gap-2">
                       {(profile.experience || []).map((exp, i) => {
                          const textRender = typeof exp === 'object' 
                             ? `${exp.role || ''} at ${exp.company || ''} (${exp.duration || ''}) - ${exp.summary || ''}` 
                             : exp;
                          return (
                            <div key={i} className="text-xs text-fuchsia-100 bg-black/20 p-2 rounded-md border border-fuchsia-500/10 line-clamp-3 leading-relaxed">
                              • {textRender}
                            </div>
                          )
                       })}
                       {!(profile.experience?.length) && <span className="text-gray-500 text-xs">No experience found</span>}
                    </div>
                 </div>
                 <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                    <div className="text-sm text-amber-300 mb-2 font-semibold">Achievements & Projects</div>
                    <div className="flex flex-col gap-2">
                       {(profile.achievements || []).map((ach, i) => {
                          const textRender = typeof ach === 'object' ? JSON.stringify(ach) : ach;
                          return (
                            <div key={i} className="text-xs text-amber-100 bg-black/20 p-2 rounded-md border border-amber-500/10 line-clamp-3 leading-relaxed">
                              🏆 {textRender}
                            </div>
                          )
                       })}
                       {!(profile.achievements?.length) && <span className="text-gray-500 text-xs">No achievements found</span>}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Real-Time Jobs Section */}
        <div style={{ display: 'block', marginTop: '40px' }}>
           <div className="flex items-center gap-3 mb-6">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
              <h2 className="text-2xl font-bold text-white">Live Job Matches</h2>
              <span className="text-gray-400 ml-2">Synced in real-time</span>
           </div>
          <JobCards skills={profile.programming_languages_known} searchRole={profile.top_role || ''} />
        </div>

      </div>
    </div>
  )
}
