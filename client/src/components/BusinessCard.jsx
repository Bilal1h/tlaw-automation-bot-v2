import {
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Star,
} from 'lucide-react'
import { PainPointBadge } from './PainPointBadge.jsx'
import { ReviewPanel } from './ReviewPanel.jsx'
import { fetchBusinessContacts } from '../lib/api.js'
import { detectPainPoints } from '../lib/painPoints.js'

function StatChip({ icon: Icon, children, accent = false }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs"
      style={{
        background: accent ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.03)',
        border: accent ? '1px solid rgba(139,92,246,0.15)' : '1px solid rgba(255,255,255,0.06)',
        color: accent ? '#a78bfa' : '#9898b8',
      }}
    >
      <Icon className="h-3 w-3" style={{ color: accent ? '#8b5cf6' : '#4a4a6a' }} />
      {children}
    </span>
  )
}

function ScoreRing({ score = 0 }) {
  const r = 22
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ
  const color = score >= 75 ? '#ef4444' : score >= 45 ? '#f97316' : score >= 20 ? '#8b5cf6' : '#2a2a4a'

  return (
    <div className="relative flex h-14 w-14 items-center justify-center">
      <svg width="56" height="56" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
        <circle
          cx="28" cy="28" r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          style={{ filter: `drop-shadow(0 0 4px ${color})`, transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <span
        className="absolute text-[11px] font-bold text-white"
        style={{ fontFamily: 'Syne, sans-serif' }}
      >
        {score}
      </span>
    </div>
  )
}

function LeadReasonBlock({ reasons = [] }) {
  if (!reasons.length) return null
  return (
    <div
      className="mt-4 rounded-xl p-4"
      style={{
        background: 'rgba(139,92,246,0.05)',
        border: '1px solid rgba(139,92,246,0.15)',
      }}
    >
      <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#a78bfa' }}>
        <Sparkles className="h-3.5 w-3.5" />
        Why this lead
      </div>
      <ul className="mt-2.5 space-y-1.5">
        {reasons.slice(0, 4).map((r) => (
          <li key={r} className="flex items-start gap-2 text-xs" style={{ color: '#c8c8e0' }}>
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-500" />
            {r}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function BusinessCard({ business, onBusinessUpdate, onToggleSelect }) {
  const enrichedPainPoints = detectPainPoints(business?.reviews || [], {
    primaryEmail: business?.primaryEmail,
    website: business?.website,
    category: business?.category,
    rating: business?.rating,
    reviewCount: business?.reviewCount,
  })

  const score = enrichedPainPoints?.leadScore ?? 0
  const leadType = enrichedPainPoints?.leadType || 'Low Priority'
  const reasons = enrichedPainPoints?.reasons || []

  const isHot = score >= 75
  const isSelected = !!business?.selected

  async function handleFetchEmail() {
    if (!business?.website || business?.contactsLoading) return
    onBusinessUpdate?.(business.id, { contactsLoading: true, contactsLoaded: false, contactsError: '' })
    try {
      const response = await fetchBusinessContacts({ website: business.website })
      const nextPrimaryEmail = response?.primaryEmail || ''
      const nextEmails = response?.emails || []
      const recomputed = detectPainPoints(business?.reviews || [], {
        primaryEmail: nextPrimaryEmail,
        website: business?.website,
        category: business?.category,
        rating: business?.rating,
        reviewCount: business?.reviewCount,
      })
      onBusinessUpdate?.(business.id, {
        contactsLoading: false, contactsLoaded: true, contactsError: '',
        emails: nextEmails, primaryEmail: nextPrimaryEmail,
        contactSourceUrl: response?.sourceUrl || '', painPoints: recomputed,
      })
    } catch {
      onBusinessUpdate?.(business.id, {
        contactsLoading: false, contactsLoaded: true, contactsError: 'Failed to fetch email',
        emails: [], primaryEmail: '', contactSourceUrl: '',
      })
    }
  }

  return (
    <article
      className="group relative overflow-hidden rounded-2xl transition-all duration-300"
      style={{
        background: isHot ? 'linear-gradient(135deg, #0e0e1a, #130a0a)' : '#111120',
        border: isSelected
          ? '1px solid rgba(139,92,246,0.5)'
          : isHot
          ? '1px solid rgba(239,68,68,0.2)'
          : '1px solid rgba(139,92,246,0.1)',
        boxShadow: isSelected
          ? '0 0 0 2px rgba(139,92,246,0.2), 0 24px 64px rgba(0,0,0,0.4)'
          : isHot
          ? '0 0 30px rgba(239,68,68,0.1), 0 24px 64px rgba(0,0,0,0.4)'
          : '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      {/* Hot lead glow stripe */}
      {isHot && (
        <div
          className="absolute left-0 top-0 h-full w-0.5 rounded-r animate-glow-pulse"
          style={{ background: 'linear-gradient(180deg, transparent, #ef4444, transparent)' }}
        />
      )}

      {/* Card sheen on hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.04) 0%, transparent 60%)',
        }}
      />

      <div className="relative p-5">
        {/* Top row */}
        <div className="flex gap-4">
          {/* Score ring */}
          <div className="shrink-0">
            <ScoreRing score={score} />
          </div>

          {/* Main info */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h3
                  className="text-lg font-semibold leading-tight text-white"
                  style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.01em' }}
                >
                  {business?.name || 'Untitled Business'}
                </h3>
                {business?.category && (
                  <span
                    className="mt-1 inline-block rounded-md px-2 py-0.5 text-[11px] font-medium"
                    style={{
                      background: 'rgba(139,92,246,0.1)',
                      border: '1px solid rgba(139,92,246,0.2)',
                      color: '#c4b5fd',
                    }}
                  >
                    {business.category}
                  </span>
                )}
              </div>

              {/* Select + badge */}
              <div className="flex items-center gap-2 shrink-0">
                <label
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200"
                  style={{
                    borderColor: isSelected ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)',
                    background: isSelected ? 'rgba(139,92,246,0.1)' : 'transparent',
                    color: isSelected ? '#a78bfa' : '#6b6b8a',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect?.(business.id)}
                    className="h-3.5 w-3.5"
                  />
                  {isSelected ? 'Selected' : 'Select'}
                </label>
                <PainPointBadge score={score} leadType={leadType} />
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-3 flex flex-wrap gap-2">
              {business?.rating != null && (
                <StatChip icon={Star} accent>
                  <span className="font-semibold text-white">{business.rating}</span>
                  <span style={{ color: '#4a4a6a' }}>({business.reviewCount ?? 0})</span>
                </StatChip>
              )}
              {business?.address && <StatChip icon={MapPin}>{business.address}</StatChip>}
              {business?.phone && <StatChip icon={Phone}>{business.phone}</StatChip>}
            </div>
          </div>
        </div>

        {/* Email row */}
        <div className="mt-4 flex flex-wrap gap-2">
          {business?.primaryEmail ? (
            <div
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
              style={{
                background: 'rgba(52,211,153,0.06)',
                border: '1px solid rgba(52,211,153,0.2)',
                color: '#6ee7b7',
              }}
            >
              <Mail className="h-3.5 w-3.5" />
              {business.primaryEmail}
            </div>
          ) : !business?.primaryEmail && business?.contactsLoaded && !business?.contactsLoading ? (
            <div
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs"
              style={{
                background: 'rgba(245,158,11,0.06)',
                border: '1px solid rgba(245,158,11,0.2)',
                color: '#fcd34d',
              }}
            >
              <Mail className="h-3.5 w-3.5" />
              No public email found
            </div>
          ) : null}
          {business?.contactsError && (
            <span className="text-xs" style={{ color: '#fca5a5' }}>{business.contactsError}</span>
          )}
        </div>

        {/* Why this lead */}
        <LeadReasonBlock reasons={reasons} />

        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          {business?.website && (
            <a
              href={business.website}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost text-xs px-3 py-2"
            >
              <Globe className="h-3.5 w-3.5" />
              Website
            </a>
          )}
          {business?.googleMapsUrl && (
            <a
              href={business.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost text-xs px-3 py-2"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Maps
            </a>
          )}
          {business?.website && (
            <button
              type="button"
              onClick={handleFetchEmail}
              disabled={business?.contactsLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                borderColor: 'rgba(52,211,153,0.25)',
                background: 'rgba(52,211,153,0.06)',
                color: '#6ee7b7',
              }}
            >
              <Mail className="h-3.5 w-3.5" />
              {business?.contactsLoading ? 'Fetching…' : 'Fetch Email'}
            </button>
          )}
        </div>

        {/* Divider */}
        <div
          className="my-4 h-px"
          style={{ background: 'rgba(139,92,246,0.1)' }}
        />

        {/* Review panel */}
        <ReviewPanel business={business} onBusinessUpdate={onBusinessUpdate} />
      </div>
    </article>
  )
}
