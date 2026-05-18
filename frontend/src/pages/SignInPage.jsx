import { SignIn } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex text-white relative overflow-hidden bg-[#030614]">
      {/* Animated Aurora Background */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] right-[0%] w-[50%] h-[70%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute top-[40%] -left-[10%] w-[50%] h-[60%] rounded-full bg-sky-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full flex">
         {/* Left Side: Branding / Narrative */}
         <div className="hidden lg:flex flex-col justify-center w-1/2 p-20 relative px-24">
           <Link to="/" className="absolute top-12 left-24 flex items-center gap-3 hover:opacity-80 transition-opacity">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-400 flex items-center justify-center font-bold text-lg text-white shadow-[0_0_20px_rgba(79,70,229,0.5)]">N</div>
             <span className="text-2xl font-black tracking-tight text-white">Scope & Hope</span>
           </Link>
           
           <div className="glass p-12 rounded-3xl border border-white/5 relative overflow-hidden mt-12 shadow-2xl">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-sky-400"></div>
             <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight leading-tight">
               Welcome back to <br/>Career Intelligence.
             </h1>
             <p className="text-lg text-gray-400 leading-relaxed mb-8">
               Log in to access your real-time dashboard, visualize market velocity against your skills, and dominate your upskilling roadmap.
             </p>
             <div className="flex flex-wrap gap-4">
                <div className="px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span> Real-time Market Data
                </div>
                <div className="px-4 py-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> AI-powered Roadmaps
                </div>
             </div>
           </div>
         </div>

         {/* Right Side: Clerk Component */}
         <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 relative">
           <Link to="/" className="lg:hidden mb-10 flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-400 flex items-center justify-center font-bold text-white shadow-lg">N</div>
             <span className="text-2xl font-bold text-white">Scope & Hope</span>
           </Link>

           <div className="relative">
             {/* Glow behind the card */}
             <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-sky-500 rounded-[24px] blur opacity-20"></div>
             
             <SignIn 
               routing="path" 
               path="/sign-in" 
               signUpUrl="/sign-up"
               localization={{
                 signIn: {
                   start: {
                     title: 'Sign in to Scope & Hope',
                   }
                 }
               }}
               appearance={{
                  layout: {
                    socialButtonsPlacement: 'bottom',
                    socialButtonsVariant: 'blockButton',
                  },
                  variables: {
                    colorPrimary: '#4f46e5',
                    colorBackground: '#0b1021',
                    colorInputBackground: '#131b31',
                    colorInputText: '#ffffff',
                    colorText: '#e2e8f0',
                    colorTextSecondary: '#94a3b8',
                    borderRadius: '16px',
                    fontFamily: '"Inter", sans-serif',
                  },
                  elements: {
                    card: 'border border-white/10 shadow-2xl shadow-indigo-500/10 bg-[#0b1021]/90 backdrop-blur-2xl !p-10',
                    headerTitle: 'text-3xl font-bold text-white tracking-tight',
                    headerSubtitle: 'text-gray-400',
                    formButtonPrimary: 'shadow-lg shadow-indigo-500/25 border border-indigo-400/20 transition-all hover:scale-[1.02] hover:bg-indigo-500 font-semibold !py-3 font-medium',
                    socialButtonsBlockButton: 'border-white/10 transition-all hover:bg-white/5 text-gray-300 font-medium !py-3',
                    formFieldInput: 'border-white/10 focus:border-indigo-500 transition-colors !py-3',
                    formFieldLabel: 'font-medium',
                    dividerRow: 'my-6',
                    dividerText: 'text-gray-500',
                    footerActionLink: 'text-indigo-400 hover:text-indigo-300 font-medium',
                  }
               }}
             />
           </div>
         </div>
      </div>
    </div>
  )
}
