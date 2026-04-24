import { ArrowRight, Loader2, Search, Sparkles, Square } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

const LOADING_MESSAGES = [
  'Scanning Google Maps listings…',
  'Opening business profiles…',
  'Extracting business details…',
  'Building your intelligence workspace…',
]

export function SearchBar({
  initialValue = '',
  placeholder = 'Try "accountants in New York" or "debt defense firms in Texas"',
  onSearch,
  onStop,
  loading = false,
  large = false,
  progressCount = 0,
  progressTotal = 0,
}) {
  const [value, setValue] = useState(initialValue)
  const [msgIdx, setMsgIdx] = useState(0)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    if (!loading) {
      setMsgIdx(0)
      return
    }
    const iv = setInterval(() => {
      setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length)
    }, 2000)
    return () => clearInterval(iv)
  }, [loading])

  const helperMsg = useMemo(() => {
    return loading ? LOADING_MESSAGES[msgIdx] : null
  }, [loading, msgIdx])

  return (
    <div className="w-full">
      <form
        className={`flex w-full ${large ? 'flex-col gap-3 sm:flex-row' : 'gap-2'}`}
        onSubmit={(e) => {
          e.preventDefault()
          onSearch?.(value)
        }}
      >
        <div className="relative flex-1">
          <Search
            className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
              focused ? 'text-violet-400' : 'text-obs-400'
            } ${large ? 'h-5 w-5' : 'h-4 w-4'}`}
          />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            disabled={loading}
            className={`field w-full ${
              large ? 'py-4 pl-12 pr-5 text-base' : 'py-3 pl-11 pr-4 text-sm'
            } transition-all duration-200`}
            style={{
              borderColor: focused
                ? 'rgba(139,92,246,0.5)'
                : 'rgba(139,92,246,0.15)',
              boxShadow: focused
                ? '0 0 0 3px rgba(139,92,246,0.1), inset 0 1px 2px rgba(0,0,0,0.3)'
                : 'inset 0 1px 2px rgba(0,0,0,0.3)',
            }}
          />
        </div>

        {!loading ? (
          <button
            type="submit"
            disabled={!value.trim()}
            className={`btn-primary shrink-0 ${
              large ? 'px-7 py-4 text-base' : 'px-5 py-3 text-sm'
            }`}
          >
            {large ? (
              <>
                <Search className="h-4 w-4" />
                Search Businesses
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Search</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onStop}
            className={`shrink-0 inline-flex items-center gap-2 rounded-xl border font-semibold transition-all duration-200 ${
              large ? 'px-7 py-4 text-base' : 'px-5 py-3 text-sm'
            }`}
            style={{
              borderColor: 'rgba(239,68,68,0.25)',
              background: 'rgba(239,68,68,0.08)',
              color: '#fca5a5',
            }}
          >
            <Square className="h-4 w-4 fill-current" />
            Stop
          </button>
        )}
      </form>

      {loading && (
        <div
          className="mt-3 animate-fade-in overflow-hidden rounded-xl px-4 py-3"
          style={{
            background: 'rgba(139,92,246,0.06)',
            border: '1px solid rgba(139,92,246,0.2)',
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 animate-glow-pulse text-violet-400" />
              <span
                className="text-sm font-medium text-violet-300 transition-all duration-300"
                key={msgIdx}
              >
                {helperMsg}
              </span>
            </div>

            <div
              className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold"
              style={{
                background: 'rgba(0,0,0,0.22)',
                border: '1px solid rgba(139,92,246,0.2)',
                color: '#c4b5fd',
              }}
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {progressCount} fetched{progressTotal ? ` / ${progressTotal}` : ''}
            </div>
          </div>

          <div
            className="relative mt-3 h-1 overflow-hidden rounded-full"
            style={{ background: 'rgba(139,92,246,0.12)' }}
          >
            <div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{
                width:
                  progressTotal > 0
                    ? `${Math.max(
                        8,
                        Math.min(100, (progressCount / progressTotal) * 100)
                      )}%`
                    : `${Math.max(10, Math.min(90, progressCount * 8))}%`,
                background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                transition: 'width 0.35s ease',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}