import { AlertTriangle, CalendarDays, Star, User } from 'lucide-react'
import { PAIN_POINT_CATEGORIES } from '../lib/painPoints.js'

function Stars({ count = 0 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-3 w-3"
          style={{
            color: i < count ? '#f59e0b' : '#2a2a4a',
            fill: i < count ? '#f59e0b' : 'transparent',
          }}
        />
      ))}
    </div>
  )
}

function highlightText(text = '') {
  let result = text
  Object.values(PAIN_POINT_CATEGORIES)
    .flat()
    .forEach((keyword) => {
      const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
      result = result.replace(
        regex,
        '<mark style="background:rgba(239,68,68,0.18);color:#fca5a5;padding:1px 4px;border-radius:3px;font-weight:500;">$1</mark>',
      )
    })
  return result
}

function detectReviewCategories(text = '') {
  const lower = text.toLowerCase()
  const matched = []
  for (const [cat, kws] of Object.entries(PAIN_POINT_CATEGORIES)) {
    if (kws.some((kw) => lower.includes(kw))) matched.push(cat)
  }
  return matched
}

export function ReviewCard({ review }) {
  const rating = Number(review?.rating || 0)
  const isNegative = rating <= 3
  const categories = detectReviewCategories(review?.text || '')

  return (
    <article
      className="group rounded-xl p-4 transition-all duration-200"
      style={{
        background: isNegative
          ? 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(185,28,28,0.04))'
          : 'rgba(255,255,255,0.02)',
        border: isNegative
          ? '1px solid rgba(239,68,68,0.2)'
          : '1px solid rgba(139,92,246,0.1)',
      }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: isNegative ? 'rgba(239,68,68,0.3)' : 'rgba(139,92,246,0.25)' }}
          >
            <User className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              {review?.author || 'Anonymous'}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Stars count={rating} />
              {review?.date && (
                <span className="flex items-center gap-1 text-[11px] text-obs-400">
                  <CalendarDays className="h-3 w-3" />
                  {review.date}
                </span>
              )}
            </div>
          </div>
        </div>

        {isNegative && (
          <span
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold"
            style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#fca5a5',
            }}
          >
            <AlertTriangle className="h-3 w-3" />
            Lead Signal
          </span>
        )}
      </div>

      {/* Category tags */}
      {categories.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {categories.slice(0, 3).map((cat) => (
            <span
              key={cat}
              className="rounded-md px-2 py-0.5 text-[10px] font-medium"
              style={{
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.2)',
                color: '#c4b5fd',
              }}
            >
              {cat.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}

      {/* Text */}
      <p
        className="mt-3 text-sm leading-relaxed text-obs-100"
        style={{ color: '#c8c8e0' }}
        dangerouslySetInnerHTML={{ __html: highlightText(review?.text || 'No review text.') }}
      />
    </article>
  )
}
