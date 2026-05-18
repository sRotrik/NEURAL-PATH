import { useState, useRef } from 'react'
import { useAuth } from '@clerk/clerk-react'

export default function ResumeUpload({ onUploaded }) {
  const { getToken } = useAuth()
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('idle') // idle | uploading | done | error
  const inputRef = useRef(null)

  const handleFile = async (f) => {
    if (!f || f.type !== 'application/pdf') return
    setFile(f)
    setStatus('uploading')
    setProgress(30)

    try {
       const formData = new FormData()
       formData.append('resume', f)

       setProgress(60)

       // Get Clerk session token and pass it to the backend
       const token = await getToken()
       const headers = token ? { 'Authorization': `Bearer ${token}` } : {}

       const res = await fetch('http://localhost:4000/api/resume/upload', {
         method: 'POST',
         headers,
         body: formData,
       })

       if (!res.ok) throw new Error('Upload failed')
       
       const data = await res.json()
       setProgress(100)
       setStatus('done')
       if (onUploaded) onUploaded(f, data.profile)
       
    } catch (e) {
       console.error("Upload error:", e)
       setStatus('error')
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div className="card">
      <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>Upload Your Resume</h3>
      <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b' }}>PDF only · Max 10MB · Parsed with NLP in seconds</p>

      {status !== 'done' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? '#4f46e5' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '16px', padding: '48px 24px', textAlign: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
            background: dragging ? 'rgba(79,70,229,0.08)' : 'rgba(255,255,255,0.02)',
          }}>
          <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])} />

          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
          <p style={{ color: '#94a3b8', fontSize: '15px', fontWeight: '600', margin: '0 0 6px' }}>
            Drop your resume here
          </p>
          <p style={{ color: '#475569', fontSize: '13px', margin: '0 0 20px' }}>or click to browse files</p>

          <button style={{
            background: 'rgba(79,70,229,0.2)', border: '1px solid rgba(79,70,229,0.4)',
            color: '#a5b4fc', padding: '10px 24px', borderRadius: '10px',
            fontSize: '14px', fontWeight: '600', cursor: 'pointer',
          }}>Browse PDF</button>
        </div>
      ) : null}

      {status === 'uploading' && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>{file?.name}</span>
            <span style={{ fontSize: '13px', color: '#4f46e5', fontWeight: '700' }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '100px',
              background: 'linear-gradient(90deg, #4f46e5, #38bdf8)',
              width: `${progress}%`, transition: 'width 0.2s ease',
              boxShadow: '0 0 12px rgba(79,70,229,0.6)',
            }} />
          </div>
          <p style={{ color: '#64748b', fontSize: '12px', marginTop: '10px' }}>
            {progress < 50 ? 'Uploading...' : progress < 90 ? 'Extracting skills with NLP...' : 'Computing Skill Demand Score...'}
          </p>
        </div>
      )}

      {status === 'error' && (
        <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ color: '#ef4444', fontSize: '14px', margin: 0, fontWeight: '600' }}>⚠️ Upload failed. Ensure it's a valid text-based PDF under 10MB.</p>
        </div>
      )}

      {status === 'done' && (
        <div style={{
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '16px', padding: '24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
          <p style={{ color: '#34d399', fontSize: '15px', fontWeight: '700', margin: '0 0 4px' }}>Resume processed!</p>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 16px' }}>{file?.name} · Skills extracted & vectorised</p>
          <button onClick={() => { setFile(null); setStatus('idle'); setProgress(0) }} style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
            color: '#94a3b8', padding: '8px 20px', borderRadius: '10px',
            fontSize: '13px', cursor: 'pointer',
          }}>Upload another</button>
        </div>
      )}
    </div>
  )
}
