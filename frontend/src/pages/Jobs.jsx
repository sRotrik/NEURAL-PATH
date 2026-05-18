import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import JobCards from '../components/recommendations/JobCards'

export default function Jobs() {
  const { getToken } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchRole, setSearchRole] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = await getToken()
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const res = await fetch('http://localhost:4000/api/resume/my-profile', { headers })
        const data = await res.json()
        if (data.success && data.profile) {
          setProfile(data.profile)
          // Pre-fill search role from AI-inferred top_role
          if (data.profile.top_role) setSearchRole(data.profile.top_role)
        }
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  return (
    <div style={{ paddingTop: '88px', minHeight: '100vh', background: '#050816', padding: '88px 24px 80px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', boxShadow: '0 0 30px rgba(16, 185, 129,0.3)',
            }}>💼</div>
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-0.5px' }}>
                Extracted Job Market
              </h1>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
                Live postings matched dynamically to your uploaded Resume configuration
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="animate-pulse text-indigo-400 font-bold text-xl">Loading your career profile...</div>
          </div>
        ) : !profile ? (
          <div style={{ paddingTop: '60px', textAlign: 'center' }}>
            <h2 className="text-3xl font-bold mb-4 text-white">No Resume Detected</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">Upload your resume so the AI can figure out what skills you have, then we will fetch you exact live jobs here.</p>
            <Link to="/onboarding" className="bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-500/20 inline-block">
              Upload Resume Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl mb-2">
               <h3 className="text-xl font-bold text-indigo-200 mb-2">How this works:</h3>
               <p className="text-gray-400 text-sm">
                  Scope & Hope analyzed your resume and found you excel in: <strong className="text-indigo-300">{(profile.programming_languages_known || []).join(', ')}</strong>. 
                  Search for a specific target role below, or leave it blank to auto-fetch jobs based on your skills! Our AI will analyze the live postings and tell you your exact ATS match.
               </p>
               
               <form 
                 onSubmit={(e) => { e.preventDefault(); const val = new FormData(e.target).get("jobRole"); setSearchRole(val); }} 
                 className="mt-4 flex gap-3"
               >
                 <input 
                    name="jobRole"
                    placeholder="e.g. Prompt Engineer, MERN Developer..." 
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                 />
                 <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                   Search Live Jobs
                 </button>
               </form>
            </div>
            
            {/* Expanded Job List wrapper */}
            <div className="w-full">
               <JobCards 
                 skills={profile.programming_languages_known || []} 
                 searchRole={searchRole}
                 limit={30} 
                 hideViewAll={true} 
               />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
