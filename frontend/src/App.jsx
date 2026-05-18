import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'

import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import Jobs from './pages/Jobs'
import Coach from './pages/Coach'
import Profile from './pages/Profile'
import ResumeScanner from './pages/ResumeScanner'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import Navbar from './components/Navbar'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

import { ErrorBoundary } from './components/ErrorBoundary'

// A wrapper to handle routing within Clerk
function ClerkProviderWithRoutes({ children }) {
  const navigate = useNavigate()
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      navigate={(to) => navigate(to)}
      appearance={{ baseTheme: 'dark' }}
    >
      {children}
    </ClerkProvider>
  )
}

function RequireAuth({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ClerkProviderWithRoutes>
          <Navbar />
          <Routes>
            <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
            <Route path="/sign-in/*" element={<SignInPage />} />
            <Route path="/sign-up/*" element={<SignUpPage />} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
            <Route path="/jobs" element={<RequireAuth><Jobs /></RequireAuth>} />
            <Route path="/coach" element={<RequireAuth><Coach /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/resume-scanner" element={<RequireAuth><ResumeScanner /></RequireAuth>} />
          </Routes>
        </ClerkProviderWithRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

