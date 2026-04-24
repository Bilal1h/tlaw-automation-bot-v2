import {
  Brain,
  ChevronDown,
  Loader2,
  MailPlus,
  MessageSquareWarning,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { fetchReviews } from '../lib/api.js'
import { detectPainPoints } from '../lib/painPoints.js'
import { EmailModal } from './EmailModal.jsx'
import { ReviewCard } from './ReviewCard.jsx'

function prettyCategory(v) {
  return String(v || '').split('_').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
}

function getOpportunityStyle(leadType = '', leadScore = 0) {
  if (leadType === 'Partnership Lead') return { border: 'rgba(56,189,248,0.25)', bg: 'rgba(56,189,248,0.06)', color: '#7dd3fc' }
  if (leadScore >= 75) return { border: 'rgba(239,68,68,0.25)', bg: 'rgba(239,68,68,0.06)', color: '#fca5a5' }
  if (leadScore >= 45) return { border: 'rgba(249,115,22,0.25)', bg: 'rgba(249,115,22,0.06)', color: '#fb923c' }
  return { border: 'rgba(139,92,246,0.2)', bg: 'rgba(139,92,246,0.05)', color: '#a78bfa' }
}

export function ReviewPanel({ business, onBusinessUpdate }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailOpen, setEmailOpen] = useState(false)

  const reviews = business?.reviews || []
  const painPoints = business?.painPoints || null
  const badReviews = useMemo(() => reviews.filter((r) => Number(r?.rating || 5) <= 3), [reviews])

  const painPointSummary = useMemo(() => {
    if (!painPoints?.hasPainPoints) return 'customer complaints'
    const top = painPoints.topCategory
    const phrases = painPoints?.categories?.[top]?.matchedPhrases || []
    return phrases.length
      ? `${prettyCategory(top)} - ${phrases.slice(0, 2).join(', ')}`
      : prettyCategory(top)
  }, [painPoints])

  const topMatchedPhrases = useMemo(() => {
    if (!painPoints?.topCategory) return []
    return painPoints?.categories?.[painPoints.topCategory]?.matchedPhrases || []
  }, [painPoints])

  async function handleLoadReviews() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchReviews({
        name: business?.name,
        googleMapsUrl: business?.googleMapsUrl,
        rating: business?.rating,
        reviewCount: business?.reviewCount,
      })
      let next = data?.reviews || []
      next = Array.from(new Map(next.map((r) => [`${r.author}-${r.text}`, r])).values())
      const computed = detectPainPoints(next, {
        primaryEmail: business?.primaryEmail,
        website: business?.website,
        category: business?.category,
        rating: business?.rating,
        reviewCount: business?.reviewCount,
      })
      onBusinessUpdate?.(business.id, { reviews: next, painPoints: computed })
      setOpen(true)
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const oppStyle = getOpportunityStyle(painPoints?.leadType, painPoints?.leadScore)

  return (
    <div className="space-y-3">
      {/* Action row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[12px]" style={{ color: '#6b6b8a' }}>
          {reviews.length
            ? `${reviews.length} reviews · ${badReviews.length} negative`
            : 'Reviews not fetched'}
        </span>

        <div className="flex flex-wrap gap-2">
          {/* Fetch / Toggle Reviews */}
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              if (reviews.length) { setOpen((p) => !p); return }
              handleLoadReviews()
            }}
            className="inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all duration-200"
            style={{
              borderColor: 'rgba(245,158,11,0.25)',
              background: 'rgba(245,158,11,0.06)',
              color: '#fcd34d',
            }}
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageSquareWarning className="h-3.5 w-3.5" />}
            {loading ? 'Loading…' : reviews.length ? (open ? 'Hide Reviews' : 'View Reviews') : 'Fetch Reviews'}
            {!loading && reviews.length > 0 && (
              <ChevronDown
                className="h-3.5 w-3.5 transition-transform duration-200"
                style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            )}
          </button>

          {/* Send Email */}
          <button
            type="button"
            onClick={() => setEmailOpen(true)}
            disabled={!business?.primaryEmail}
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: business?.primaryEmail
                ? 'linear-gradient(135deg, #7c3aed, #5b21b6)'
                : 'rgba(255,255,255,0.04)',
              color: '#fff',
              boxShadow: business?.primaryEmail ? '0 2px 12px rgba(124,58,237,0.3)' : 'none',
              border: business?.primaryEmail ? 'none' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <MailPlus className="h-3.5 w-3.5" />
            Send Email
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}
        >
          {error}
        </div>
      )}

      {/* Expanded panel */}
      {open && (
        <div
          className="animate-fade-in space-y-4 rounded-xl p-4"
          style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(139,92,246,0.1)' }}
        >
          {/* Intelligence header */}
          {painPoints && (
            <div
              className="rounded-xl p-4"
              style={{ background: oppStyle.bg, border: `1px solid ${oppStyle.border}` }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Brain className="h-4 w-4" style={{ color: oppStyle.color }} />
                  Lead Intelligence
                </div>
                {[
                  painPoints?.leadType || 'Low Priority',
                  `Score: ${painPoints?.leadScore || 0}/100`,
                  `${painPoints?.negativeReviews || 0} negative`,
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md px-2 py-0.5 text-[11px] font-medium"
                    style={{ background: 'rgba(0,0,0,0.3)', color: oppStyle.color, border: `1px solid ${oppStyle.border}` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {painPoints?.topCategory && (
                <div className="mt-2 text-sm">
                  <span className="font-semibold text-white">Top pain: </span>
                  <span style={{ color: oppStyle.color }}>{prettyCategory(painPoints.topCategory)}</span>
                </div>
              )}

              {topMatchedPhrases.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {topMatchedPhrases.map((phrase) => (
                    <span
                      key={phrase}
                      className="rounded-md px-2 py-0.5 text-[11px]"
                      style={{ background: 'rgba(0,0,0,0.25)', color: oppStyle.color, border: `1px solid ${oppStyle.border}` }}
                    >
                      {phrase}
                    </span>
                  ))}
                </div>
              )}

              {painPoints?.reasons?.length > 0 && (
                <div
                  className="mt-3 rounded-lg p-3"
                  style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: oppStyle.color }}>
                    <Sparkles className="h-3 w-3" />
                    Why this matters
                  </div>
                  <ul className="mt-2 space-y-1.5 text-sm text-obs-100">
                    {painPoints.reasons.slice(0, 4).map((r) => (
                      <li key={r} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: oppStyle.color }} />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Negative reviews */}
          {badReviews.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold" style={{ color: '#fca5a5' }}>
                <ShieldAlert className="h-3.5 w-3.5" />
                Negative Reviews — Lead Opportunities
              </div>
              <div className="space-y-2">
                {badReviews.map((rev, i) => <ReviewCard key={`bad-${i}`} review={rev} />)}
              </div>
            </div>
          )}

          {/* All reviews */}
          <div>
            <div className="mb-2 text-xs font-semibold" style={{ color: '#6b6b8a' }}>
              All Reviews ({reviews.length})
            </div>
            {reviews.length ? (
              <div className="space-y-2">
                {reviews.map((rev, i) => <ReviewCard key={`all-${i}`} review={rev} />)}
              </div>
            ) : (
              <div className="py-6 text-center text-sm" style={{ color: '#6b6b8a' }}>No reviews found</div>
            )}
          </div>
        </div>
      )}

      <EmailModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        business={business}
        painPointSummary={painPointSummary}
      />
    </div>
  )
}
