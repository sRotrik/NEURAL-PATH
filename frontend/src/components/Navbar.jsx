import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/clerk-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  const links = [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/resume-scanner', label: '📋 Scanner' },
    { to: '/jobs', label: 'Jobs' },
    { to: '/coach', label: 'Coach' },
    { to: '/profile', label: 'Profile' },
  ]

  // Hide the global Navbar on dedicated full-panel Auth pages
  if (pathname.includes('/sign-in') || pathname.includes('/sign-up')) {
    return null;
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(5, 8, 22, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '0 32px',
      height: '64px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #4f46e5, #38bdf8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', fontWeight: '800', color: 'white',
          boxShadow: '0 0 20px rgba(79,70,229,0.5)',
        }}>N</div>
        <span style={{
          fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px',
          background: 'linear-gradient(135deg, #ffffff, #94a3b8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Scope & Hope</span>
      </Link>

      {/* Desktop links */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{
            padding: '8px 18px', borderRadius: '10px',
            fontSize: '14px', fontWeight: '500',
            color: pathname === l.to ? '#fff' : '#94a3b8',
            background: pathname === l.to ? 'rgba(79,70,229,0.2)' : 'transparent',
            border: pathname === l.to ? '1px solid rgba(79,70,229,0.4)' : '1px solid transparent',
            transition: 'all 0.2s',
            textDecoration: 'none',
          }}>{l.label}</Link>
        ))}
      </div>

      {/* Auth State Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="btn-primary" style={{ padding: '10px 22px', fontSize: '13px' }}>
              Sign In
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: 'w-9 h-9 border-2 border-[#4f46e5]/50 shadow-[0_0_15px_rgba(79,70,229,0.4)]',
              }
            }}
          />
        </SignedIn>
      </div>
    </nav>
  )
}
