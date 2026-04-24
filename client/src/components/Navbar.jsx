import { Activity, Mail, Scale, ShieldCheck, Zap } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { fetchAuthStatus } from '../lib/api.js'

export function Navbar() {
  const location = useLocation()
  const { auth, setAuth } = useApp()

  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const data = await fetchAuthStatus()
        if (!ignore) setAuth({ authenticated: Boolean(data?.authenticated), checked: true })
      } catch {
        if (!ignore) setAuth({ authenticated: false, checked: true })
      }
    })()
    return () => { ignore = true }
  }, [location.pathname, setAuth])

  const authUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/google`

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(8,8,16,0.8)',
        backdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid rgba(139,92,246,0.1)',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-3">
          <div
            className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
            }}
          >
            <Scale className="h-5 w-5 text-white" />
            {/* Ping dot */}
            <span
              className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400"
              style={{ boxShadow: '0 0 6px rgba(52,211,153,0.8)' }}
            />
          </div>
          <div>
            <div
              className="text-sm font-semibold leading-none text-white"
              style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.01em' }}
            >
              TariqLaw
            </div>
            <div className="mt-0.5 text-[11px] text-obs-300 leading-none">Lead Intelligence</div>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Auth status */}
          {auth.checked && (
            <div
              className="hidden items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium sm:flex animate-fade-in"
              style={
                auth.authenticated
                  ? {
                      borderColor: 'rgba(52,211,153,0.25)',
                      background: 'rgba(52,211,153,0.06)',
                      color: '#6ee7b7',
                    }
                  : {
                      borderColor: 'rgba(245,158,11,0.25)',
                      background: 'rgba(245,158,11,0.06)',
                      color: '#fcd34d',
                    }
              }
            >
              {auth.authenticated ? (
                <ShieldCheck className="h-3 w-3" />
              ) : (
                <Activity className="h-3 w-3" />
              )}
              {auth.authenticated ? 'Gmail connected' : 'Gmail not connected'}
            </div>
          )}

          {/* Connect Gmail */}
          <a
            href={authUrl}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
            }}
          >
            {/* Sheen */}
            <span
              className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)',
              }}
            />
            <Mail className="relative h-4 w-4" />
            <span className="relative">Connect Gmail</span>
            <Zap className="relative h-3.5 w-3.5 opacity-60" />
          </a>
        </div>
      </div>
    </header>
  )
}
