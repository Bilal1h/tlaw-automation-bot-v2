import { CheckCircle2, ShieldAlert, Home, BarChart2 } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

export function AuthCallbackPage() {
  const [params] = useSearchParams()
  const status = String(params.get('status') || '')

  const content = useMemo(() => {
    if (status === 'success') return {
      title: 'Gmail Connected',
      body: 'Your Google account is authorized for sending outreach emails and logging to Google Sheets.',
      Icon: CheckCircle2,
      accent: '#22c55e',
      bg: 'rgba(34,197,94,0.08)',
      border: 'rgba(34,197,94,0.25)',
      iconBg: 'rgba(34,197,94,0.15)',
    }
    if (status === 'denied') return {
      title: 'Access Denied',
      body: 'Google access was not granted. You can reconnect anytime from the navigation bar.',
      Icon: ShieldAlert,
      accent: '#f59e0b',
      bg: 'rgba(245,158,11,0.06)',
      border: 'rgba(245,158,11,0.25)',
      iconBg: 'rgba(245,158,11,0.12)',
    }
    return {
      title: 'Authentication Complete',
      body: 'The authentication flow has finished. Return to the dashboard to continue.',
      Icon: ShieldAlert,
      accent: '#8b5cf6',
      bg: 'rgba(139,92,246,0.06)',
      border: 'rgba(139,92,246,0.2)',
      iconBg: 'rgba(139,92,246,0.12)',
    }
  }, [status])

  const { title, body, Icon, accent, bg, border, iconBg } = content

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-lg items-center justify-center px-4 py-12">
      <div
        className="w-full rounded-2xl p-8 text-center animate-fade-up"
        style={{ background: '#111120', border: `1px solid ${border}`, boxShadow: `0 0 60px ${bg}` }}
      >
        {/* Icon ring */}
        <div
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl"
          style={{ background: iconBg, border: `1px solid ${border}` }}
        >
          <Icon className="h-10 w-10" style={{ color: accent }} />
        </div>

        <h1
          className="mt-6 text-2xl font-bold text-white"
          style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}
        >
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed" style={{ color: '#6b6b8a' }}>
          {body}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/" className="btn-ghost text-sm px-5 py-2.5">
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link
            to="/results"
            className="btn-primary text-sm px-5 py-2.5"
          >
            <BarChart2 className="h-4 w-4" />
            Lead Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
