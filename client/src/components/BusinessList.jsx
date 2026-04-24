import { Building2, Telescope } from 'lucide-react'
import { BusinessCard } from './BusinessCard.jsx'

function SkeletonCard({ delay = 0 }) {
  return (
    <div
      className="rounded-2xl p-5 animate-fade-up"
      style={{
        background: '#111120',
        border: '1px solid rgba(139,92,246,0.08)',
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="flex gap-4">
        <div className="skeleton h-14 w-14 shrink-0 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-5 w-48 rounded-lg" />
          <div className="skeleton h-4 w-24 rounded-md" />
          <div className="flex gap-2">
            <div className="skeleton h-7 w-20 rounded-md" />
            <div className="skeleton h-7 w-32 rounded-md" />
          </div>
        </div>
        <div className="skeleton h-8 w-24 rounded-lg" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="skeleton h-3 w-full rounded-full" />
        <div className="skeleton h-3 w-4/5 rounded-full" />
        <div className="skeleton h-3 w-3/5 rounded-full" />
      </div>
      <div className="mt-4 skeleton h-20 rounded-xl" />
    </div>
  )
}

export function BusinessList({
  businesses,
  onBusinessUpdate,
  onToggleSelect,
  loading = false,
  query = '',
}) {
 if (loading && !businesses?.length) {
  return (
    <div className="space-y-4">
      <div
        className="flex items-center gap-3 rounded-xl px-5 py-4 animate-fade-in"
        style={{
          background: 'rgba(139,92,246,0.06)',
          border: '1px solid rgba(139,92,246,0.2)',
        }}
      >
        <div className="relative h-8 w-8 shrink-0">
          <div
            className="absolute inset-0 rounded-full"
            style={{ border: '2px solid rgba(139,92,246,0.2)' }}
          />
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{
              border: '2px solid transparent',
              borderTopColor: '#8b5cf6',
            }}
          />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">
            Building lead workspace for "{query || 'your search'}"
          </div>
          <div className="text-xs mt-0.5" style={{ color: '#6b6b8a' }}>
            Businesses, pain signals, and contacts loading…
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {[0, 75, 150, 225].map((d) => <SkeletonCard key={d} delay={d} />)}
      </div>
    </div>
  )
}
  if (!businesses?.length) {
    return (
      <div
        className="rounded-2xl px-6 py-16 text-center animate-fade-in"
        style={{
          background: 'rgba(139,92,246,0.03)',
          border: '1px dashed rgba(139,92,246,0.15)',
        }}
      >
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}
        >
          {query ? (
            <Telescope className="h-7 w-7" style={{ color: '#8b5cf6' }} />
          ) : (
            <Building2 className="h-7 w-7" style={{ color: '#8b5cf6' }} />
          )}
        </div>
        <h3
          className="mt-5 text-lg font-semibold text-white"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          {query ? 'No results found' : 'Ready to start'}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: '#6b6b8a' }}>
          {query
            ? `No matching businesses for "${query}". Try a broader search or different city.`
            : 'Run a search above to load businesses, detect pain signals, and prepare outreach.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {businesses.map((business, i) => (
        <div
          key={business.id}
          className="animate-fade-up"
          style={{ animationDelay: `${Math.min(i * 50, 400)}ms` }}
        >
          <BusinessCard
            business={business}
            onBusinessUpdate={onBusinessUpdate}
            onToggleSelect={onToggleSelect}
          />
        </div>
      ))}
    </div>
  )
}
