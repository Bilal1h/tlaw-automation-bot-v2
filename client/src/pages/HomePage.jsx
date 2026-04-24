import { ArrowRight, Building2, Mail, SearchCheck, Sparkles, Zap } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchBar } from '../components/SearchBar.jsx'

const EXAMPLES = [
  'accountants in New York',
  'debt defense firms in Texas',
  'real estate lawyers in Miami',
  'tax consultants in Chicago',
  'employment attorneys in LA',
]

const FEATURES = [
  {
    icon: Building2,
    title: 'Business Intelligence',
    description: 'Search any niche in any U.S. city and get structured lead profiles with contact data.',
    accent: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.2)',
  },
  {
    icon: SearchCheck,
    title: 'Pain Signal Detection',
    description: 'Analyze Google reviews to surface communication gaps, billing complaints, and service failures.',
    accent: '#ef4444',
    bg: 'rgba(239,68,68,0.06)',
    border: 'rgba(239,68,68,0.18)',
  },
  {
    icon: Mail,
    title: 'Gmail Outreach',
    description: '20 pre-built templates. One-click send through your own Gmail. Auto-logged to Google Sheets.',
    accent: '#22c55e',
    bg: 'rgba(34,197,94,0.06)',
    border: 'rgba(34,197,94,0.18)',
  },
]

function StatBlock({ value, label, accent }) {
  return (
    <div className="text-center animate-count-up">
      <div
        className="text-3xl font-bold"
        style={{ fontFamily: 'Syne, sans-serif', color: accent }}
      >
        {value}
      </div>
      <div className="mt-1 text-xs" style={{ color: '#6b6b8a' }}>
        {label}
      </div>
    </div>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  function handleSearch(query) {
    const q = String(query || '').trim()
    if (!q) return
    setLoading(true)
    navigate(`/results?q=${encodeURIComponent(q)}`)
  }

  return (
    <main className="relative overflow-x-hidden">
      {/* Background orbs */}
      <div
        className="pointer-events-none absolute left-1/4 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(109,40,217,0.12), transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute right-0 top-1/3 h-[400px] w-[400px] translate-x-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.06), transparent 70%)' }}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        {/* Hero section */}
        <section className="text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] animate-fade-up"
            style={{
              borderColor: 'rgba(139,92,246,0.3)',
              background: 'rgba(139,92,246,0.08)',
              color: '#c4b5fd',
            }}
          >
            <Sparkles className="h-3.5 w-3.5 animate-glow-pulse" />
            TariqLaw Internal Platform
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ background: 'rgba(139,92,246,0.25)', color: '#e9d5ff' }}
            >
              v1.0
            </span>
          </div>

          {/* Headline */}
          <h1
            className="mx-auto mt-6 max-w-4xl text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl animate-fade-up delay-75"
            style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.03em' }}
          >
            Find leads.{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Detect pain.
            </span>{' '}
            Close clients.
          </h1>

          <p
            className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed animate-fade-up delay-150"
            style={{ color: '#9898b8' }}
          >
            The internal lead generation and cold email platform built exclusively for
            TariqLaw. Search businesses, surface review-based pain signals, extract contact emails,
            and send outreach — all in one place.
          </p>

          {/* Search */}
          <div className="mx-auto mt-10 max-w-3xl animate-fade-up delay-225">
            <SearchBar large loading={loading} onSearch={handleSearch} />
          </div>

          {/* Example chips */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 animate-fade-up delay-300">
            <span className="text-xs" style={{ color: '#4a4a6a' }}>Try:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => handleSearch(ex)}
                className="group rounded-full border px-3.5 py-1.5 text-xs transition-all duration-200"
                style={{
                  borderColor: 'rgba(139,92,246,0.15)',
                  background: 'rgba(139,92,246,0.05)',
                  color: '#9898b8',
                }}
              >
                <span className="group-hover:text-violet-300 transition-colors duration-200">{ex}</span>
                <ArrowRight className="ml-1.5 inline h-3 w-3 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
              </button>
            ))}
          </div>
        </section>

        {/* Stats bar */}
        <section
          className="mx-auto mt-14 max-w-2xl rounded-2xl px-8 py-5 animate-fade-up delay-375"
          style={{
            background: 'rgba(14,14,26,0.8)',
            border: '1px solid rgba(139,92,246,0.15)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="grid grid-cols-3 gap-6 divide-x" style={{ borderColor: 'rgba(139,92,246,0.1)' }}>
            <StatBlock value="60+" label="Businesses per search" accent="#8b5cf6" />
            <div className="pl-6">
              <StatBlock value="20" label="Email templates" accent="#f59e0b" />
            </div>
            <div className="pl-6">
              <StatBlock value="$0" label="API cost" accent="#22c55e" />
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description, accent, bg, border }, i) => (
            <div
              key={title}
              className="group rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 animate-fade-up"
              style={{
                background: '#111120',
                border: `1px solid ${border}`,
                animationDelay: `${375 + i * 75}ms`,
              }}
            >
              {/* Icon */}
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
                style={{ background: bg, border: `1px solid ${border}` }}
              >
                <Icon className="h-5 w-5" style={{ color: accent }} />
              </div>

              <h3
                className="mt-4 text-base font-semibold text-white"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: '#6b6b8a' }}>
                {description}
              </p>

              {/* Arrow */}
              <div className="mt-4 flex items-center gap-1 text-xs font-medium opacity-0 transition-all duration-200 group-hover:opacity-100" style={{ color: accent }}>
                Learn more <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          ))}
        </section>

        {/* Bottom CTA strip */}
        <section
          className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl px-6 py-5 sm:flex-row animate-fade-up delay-450"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(91,33,182,0.08))',
            border: '1px solid rgba(139,92,246,0.2)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: 'rgba(139,92,246,0.2)' }}
            >
              <Zap className="h-5 w-5" style={{ color: '#c4b5fd' }} />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Ready for backend hookup</div>
              <div className="text-xs" style={{ color: '#6b6b8a' }}>
                This frontend matches your existing Express API routes exactly.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSearch(EXAMPLES[0])}
            className="btn-primary shrink-0"
          >
            <Sparkles className="h-4 w-4" />
            Run a Demo Search
            <ArrowRight className="h-4 w-4" />
          </button>
        </section>
      </div>
    </main>
  )
}
