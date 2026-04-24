import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Flame,
  Mail,
  Sparkles,
  Target,
  X,
  Zap,
} from 'lucide-react'
import { BusinessList } from '../components/BusinessList.jsx'
import { FilterSidebar } from '../components/FilterSidebar.jsx'
import { SearchBar } from '../components/SearchBar.jsx'
import { useApp } from '../context/AppContext.jsx'
import {
  startBusinessSearch,
  getBusinessSearchProgress,
  stopBusinessSearch,
  sendBulkColdEmails,
} from '../lib/api.js'
import { detectPainPoints } from '../lib/painPoints.js'

/* ── helpers ── */
function isInSelectedRange(rating, ranges) {
  const n = Number(rating)
  const enabled = Object.entries(ranges || {}).filter(([, v]) => v)
  if (!enabled.length) return true
  if (!n || isNaN(n)) return false
  return enabled.some(([r]) => {
    if (r === '1-2') return n >= 1 && n < 2
    if (r === '2-3') return n >= 2 && n < 3
    if (r === '3-4') return n >= 3 && n < 4
    if (r === '4-5') return n >= 4 && n <= 5
    return true
  })
}

function buildPainPointSummary(b) {
  const top = b?.painPoints?.topCategory
  if (!top) return 'customer concerns'
  return top.split('_').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
}

function enrichBusiness(b) {
  return {
    ...b,
    painPoints: detectPainPoints(b?.reviews || [], {
      primaryEmail: b?.primaryEmail,
      website: b?.website,
      category: b?.category,
      rating: b?.rating,
      reviewCount: b?.reviewCount,
    }),
  }
}

function escapeCsv(v) {
  const s = String(v ?? '')
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
}

function getExportRows(bs) {
  return bs.map((b) => ({
    'Business Name': b?.name || '',
    'Lead Type': b?.painPoints?.leadType || '',
    'Lead Score': b?.painPoints?.leadScore || 0,
    'Rating': b?.rating ?? '',
    'Review Count': b?.reviewCount ?? 0,
    'Top Pain': buildPainPointSummary(b),
    'Negative Reviews': b?.painPoints?.negativeReviews || 0,
    'Primary Email': b?.primaryEmail || '',
    'Phone': b?.phone || '',
    'Website': b?.website || '',
    'Address': b?.address || '',
    'Google Maps URL': b?.googleMapsUrl || '',
  }))
}

function downloadCsv(selected, query) {
  const rows = getExportRows(selected)
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const csv = [
    headers.map(escapeCsv).join(','),
    ...rows.map((r) => headers.map((h) => escapeCsv(r[h])).join(',')),
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `lead-export-${(query || 'results').replace(/\s+/g, '-').toLowerCase()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function openPrintExport(selected, query) {
  const rows = getExportRows(selected)
  if (!rows.length) return
  const htmlRows = rows.map((r) => `
    <tr>
      <td>${r['Business Name']}</td><td>${r['Lead Type']}</td><td>${r['Lead Score']}</td>
      <td>${r['Rating']}</td><td>${r['Review Count']}</td><td>${r['Top Pain']}</td>
      <td>${r['Primary Email']}</td><td>${r['Phone']}</td><td>${r['Website']}</td>
    </tr>`).join('')
  const w = window.open('', '_blank', 'width=1200,height=900')
  if (!w) return
  w.document.write(`<html><head><title>Lead Export</title><style>
    body{font-family:system-ui;padding:32px;color:#111}
    h1{margin:0 0 8px}p{margin:0 0 24px;color:#6b7280}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th,td{border:1px solid #d1d5db;padding:10px;text-align:left;vertical-align:top}
    th{background:#f3f4f6}
  </style></head><body>
    <h1>Lead Export Report</h1>
    <p>Query: ${query || 'N/A'} · Leads: ${selected.length}</p>
    <table><thead><tr>
      <th>Business Name</th><th>Lead Type</th><th>Score</th><th>Rating</th>
      <th>Reviews</th><th>Top Pain</th><th>Email</th><th>Phone</th><th>Website</th>
    </tr></thead><tbody>${htmlRows}</tbody></table>
  </body></html>`)
  w.document.close()
  w.focus()
  w.print()
}

/* ── StatCard ── */
function StatCard({ label, value, accent, sub, delay = 0 }) {
  return (
    <div
      className="stat-box animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: accent || '#4a4a6a' }}
      >
        {label}
      </div>
      <div
        className="text-3xl font-bold text-white"
        style={{ fontFamily: 'Syne, sans-serif' }}
      >
        {value}
      </div>
      {sub && <div className="text-[11px]" style={{ color: '#6b6b8a' }}>{sub}</div>}
    </div>
  )
}

/* ── ExportMenu ── */
function ExportMenu({ open, onToggle, onCsv, onPdf, disabled }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className="btn-ghost text-sm px-4 py-2.5"
      >
        <Download className="h-4 w-4" />
        Export
        <ChevronDown
          className="h-4 w-4 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
        />
      </button>
      {open && (
        <div
          className="absolute right-0 z-20 mt-1.5 w-44 overflow-hidden rounded-xl animate-slide-down"
          style={{
            background: '#0e0e1a',
            border: '1px solid rgba(139,92,246,0.2)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}
        >
          {[
            { Icon: FileSpreadsheet, label: 'Export CSV', color: '#22c55e', fn: onCsv },
            { Icon: FileText, label: 'Export PDF', color: '#ef4444', fn: onPdf },
          ].map(({ Icon, label, color, fn }) => (
            <button
              key={label}
              type="button"
              onClick={fn}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-white transition-all duration-150 hover:bg-white/5"
            >
              <Icon className="h-4 w-4" style={{ color }} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Main Page ── */
export function ResultsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requestedQuery = String(searchParams.get('q') || '').trim()
  const {
  businesses,
  setBusinesses,
  filters,
  setFilters,
  setQuery,
  searchJob,
  setSearchJob,
} = useApp()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [bulkSending, setBulkSending] = useState(false)
  const [bulkResult, setBulkResult] = useState(null)
  const [bulkError, setBulkError] = useState('')
  const [exportOpen, setExportOpen] = useState(false)
  const exportRef = useRef(null)
const activeSearchKeyRef = useRef('')
  useEffect(() => { setQuery(requestedQuery) }, [requestedQuery, setQuery])

  useEffect(() => {
    function onClickOutside(e) {
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

useEffect(() => {
  if (!requestedQuery) return
const searchKey = requestedQuery.trim().toLowerCase()
if (!searchKey) return

if (activeSearchKeyRef.current === searchKey && loading) {
  return
}

activeSearchKeyRef.current = searchKey
  let ignore = false
  let pollTimer = null

  ;(async () => {
    setLoading(true)
    setError('')
    setBulkResult(null)
    setBulkError('')
    setExportOpen(false)
    setBusinesses([])

    setSearchJob({
      jobId: '',
      status: 'starting',
      fetchedCount: 0,
      totalDiscovered: 0,
      done: false,
      stopped: false,
      error: '',
    })

    try {
      const start = await startBusinessSearch(requestedQuery, 25)

      if (ignore) return

      const jobId = start?.jobId || ''
      if (!jobId) throw new Error('Failed to start search job')

      setSearchJob((prev) => ({
        ...prev,
        jobId,
        status: 'running',
      }))

      const poll = async () => {
        try {
          const progress = await getBusinessSearchProgress(jobId)
          if (ignore) return

          const liveBusinesses = (progress?.businesses || []).map((b) =>
            enrichBusiness({
              ...b,
              selected: false,
              reviews: b?.reviews || [],
              emails: b?.emails || [],
              primaryEmail: b?.primaryEmail || '',
              contactSourceUrl: b?.contactSourceUrl || '',
              contactsLoaded: b?.contactsLoaded || false,
              contactsLoading: false,
              contactsError: '',
            }),
          )

          setBusinesses(liveBusinesses)

          setSearchJob({
            jobId,
            status: progress?.status || 'running',
            fetchedCount: progress?.fetchedCount || 0,
            totalDiscovered: progress?.totalDiscovered || 0,
            done: !!progress?.done,
            stopped: !!progress?.stopped,
            error: progress?.error || '',
          })

          if (progress?.done) {
            setLoading(false)

            if (progress?.status === 'failed') {
              setError(progress?.error || 'Search failed')
            }

            return
          }

          pollTimer = window.setTimeout(poll, 1000)
        } catch (e) {
          if (ignore) return
          setLoading(false)
          setError(e?.response?.data?.error || e?.message || 'Search progress failed')
        }
      }

      poll()
    } catch (e) {
      if (ignore) return
      setLoading(false)
      setBusinesses([])
      setError(e?.response?.data?.error || e?.message || 'Search failed')
    }
  })()

  return () => {
    ignore = true
    if (pollTimer) window.clearTimeout(pollTimer)
  }
}, [requestedQuery, setBusinesses, setSearchJob])
  const categories = useMemo(() => {
    const s = new Set()
    businesses.forEach((b) => { if (b?.category?.trim()) s.add(b.category.trim()) })
    return Array.from(s).sort()
  }, [businesses])

  const filteredBusinesses = useMemo(() => {
    const minR = Number(filters.minReviews || 0)
    const maxR = filters.maxReviews === '' ? null : Number(filters.maxReviews)
    return businesses.filter((b) => {
      if (!isInSelectedRange(b?.rating, filters.ratingRanges)) return false
      if ((b?.reviewCount || 0) < minR) return false
      if (maxR != null && (b?.reviewCount || 0) > maxR) return false
      if (filters.category !== 'all' && b?.category !== filters.category) return false
      if (filters.hasWebsiteOnly && !b?.website) return false
      if (filters.hasPainPointsOnly && !b?.painPoints?.hasPainPoints) return false
      if (filters.leadType !== 'all' && b?.painPoints?.leadType !== filters.leadType) return false
      if (filters.hotLeadsOnly && Number(b?.painPoints?.leadScore || 0) < 75) return false
      return true
    })
  }, [businesses, filters])

  const eligible = useMemo(
    () => businesses.filter((b) => !!b?.primaryEmail && (
      (b?.reviews || []).some((r) => Number(r?.rating || 5) <= 3) || !!b?.painPoints?.hasPainPoints
    )),
    [businesses],
  )

  const hotLeads = useMemo(
    () => businesses.filter((b) => Number(b?.painPoints?.leadScore || 0) >= 75 && !!b?.primaryEmail),
    [businesses],
  )

  const selected = useMemo(() => businesses.filter((b) => b?.selected), [businesses])

  const summary = useMemo(() => ({
    total: businesses.length,
    withWebsites: businesses.filter((b) => b?.website).length,
    withPainSignals: businesses.filter((b) => b?.painPoints?.hasPainPoints).length,
    withEmails: businesses.filter((b) => b?.primaryEmail).length,
    eligible: eligible.length,
    selected: selected.length,
    hotLeads: hotLeads.length,
  }), [businesses, eligible, selected, hotLeads])

  function handleBusinessUpdate(idOrBusiness, maybeUpdates) {
    if (typeof idOrBusiness === 'string') {
      setBusinesses((cur) => cur.map((b) =>
        b.id !== idOrBusiness ? b : enrichBusiness({ ...b, ...(maybeUpdates || {}) })
      ))
      return
    }
    const upd = idOrBusiness
    if (!upd?.id) return
    setBusinesses((cur) => cur.map((b) => b.id === upd.id ? enrichBusiness(upd) : b))
  }

  function toggleSelect(id) {
    setBusinesses((cur) => cur.map((b) => b.id === id ? { ...b, selected: !b.selected } : b))
  }

  function selectEligible() {
    const ids = new Set(eligible.map((b) => b.id))
    setBusinesses((cur) => cur.map((b) => ({ ...b, selected: ids.has(b.id) })))
  }

  function selectHot() {
    const ids = new Set(hotLeads.map((b) => b.id))
    setBusinesses((cur) => cur.map((b) => ({ ...b, selected: ids.has(b.id) })))
  }

  function clearSelected() {
    setBusinesses((cur) => cur.map((b) => ({ ...b, selected: false })))
  }

  async function handleBulkSend() {
    if (!selected.length) return
    setBulkSending(true); setBulkError(''); setBulkResult(null)
    try {
      const res = await sendBulkColdEmails({
        businesses: selected.map((b) => ({
          name: b?.name || '', primaryEmail: b?.primaryEmail || '',
          category: b?.category || 'business', city: b?.city || '',
          state: b?.state || '', painPointSummary: buildPainPointSummary(b),
        })),
        templateId: 'general_002',
        senderName: 'TariqLaw Team',
        senderPhone: '',
      })
      setBulkResult(res)
    } catch (e) {
      setBulkError(e?.response?.data?.error || e?.message || 'Bulk send failed')
    } finally {
      setBulkSending(false)
    }
  }
async function handleStopSearch() {
  if (!searchJob?.jobId) return

  try {
    await stopBusinessSearch(searchJob.jobId)
    setSearchJob((prev) => ({
      ...prev,
      status: 'stopping',
    }))
  } catch (e) {
    setError(e?.response?.data?.error || e?.message || 'Failed to stop search')
  }
}
  const handleExportCsv = () => { setExportOpen(false); downloadCsv(selected, requestedQuery) }
  const handleExportPdf = () => { setExportOpen(false); openPrintExport(selected, requestedQuery) }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

      {/* ── Sticky selection action bar ── */}
      {selected.length > 0 && (
        <section
          className="sticky top-14 z-30 mb-5 rounded-2xl px-4 py-3 animate-slide-down"
          style={{
            background: 'rgba(14,14,26,0.95)',
            border: '1px solid rgba(139,92,246,0.3)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.1)',
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: 'rgba(139,92,246,0.2)' }}
              >
                <Target className="h-4 w-4" style={{ color: '#a78bfa' }} />
              </div>
              <div>
                <span className="text-sm font-semibold text-white">
                  {selected.length} lead{selected.length > 1 ? 's' : ''} selected
                </span>
                <span className="ml-2 text-xs" style={{ color: '#6b6b8a' }}>
                  Export, clear, or launch bulk outreach
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2" ref={exportRef}>
              <ExportMenu
                open={exportOpen}
                onToggle={() => setExportOpen((p) => !p)}
                onCsv={handleExportCsv}
                onPdf={handleExportPdf}
                disabled={!selected.length}
              />
              <button
                type="button"
                onClick={handleBulkSend}
                disabled={!selected.length || bulkSending}
                className="btn-primary text-sm px-4 py-2.5"
              >
                <Mail className="h-4 w-4" />
                {bulkSending ? 'Sending…' : `Send Emails (${selected.length})`}
              </button>
              <button type="button" onClick={clearSelected} className="btn-ghost text-sm px-3 py-2.5">
                <X className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Search header ── */}
      <section
        className="rounded-2xl p-5 sm:p-6 animate-fade-up"
        style={{
          background: '#111120',
          border: '1px solid rgba(139,92,246,0.12)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
        }}
      >
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
          <div>
            <div
              className="text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ color: '#8b5cf6' }}
            >
              Search workspace
            </div>
            <h1
              className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl"
              style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}
            >
              {requestedQuery ? (
                <>Results for <span style={{ color: '#a78bfa' }}>"{requestedQuery}"</span></>
              ) : (
                'Run a search to begin'
              )}
            </h1>
            <p className="mt-1.5 text-sm" style={{ color: '#6b6b8a' }}>
              Filter, fetch reviews, grab contact emails, then send targeted outreach.
            </p>
          </div>
       <SearchBar
  initialValue={requestedQuery}
  loading={loading}
  progressCount={searchJob?.fetchedCount || 0}
  progressTotal={searchJob?.totalDiscovered || 0}
  onStop={handleStopSearch}
  onSearch={(q) => {
    const t = String(q || '').trim()
    if (!t) return
    navigate(`/results?q=${encodeURIComponent(t)}`)
  }}
/>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mt-4 rounded-xl px-4 py-3 text-sm animate-fade-in"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}
          >
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Businesses" value={summary.total} delay={0} />
          <StatCard label="With Website" value={summary.withWebsites} delay={50} />
          <StatCard label="Pain Signals" value={summary.withPainSignals} accent="#8b5cf6" delay={100} />
          <StatCard label="With Email" value={summary.withEmails} accent="#22c55e" delay={150} />
          <StatCard label="Hot Leads" value={summary.hotLeads} accent="#ef4444" delay={200} />
          <StatCard
            label="Eligible / Selected"
            value={`${summary.eligible}/${summary.selected}`}
            accent="#f59e0b"
            delay={250}
          />
        </div>

        {/* Quick action buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={selectHot}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
            style={{
              borderColor: 'rgba(239,68,68,0.25)',
              background: 'rgba(239,68,68,0.08)',
              color: '#fca5a5',
            }}
          >
            <Flame className="h-4 w-4" />
            Select Hot Leads
          </button>

          <button
            type="button"
            onClick={selectEligible}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
            style={{
              borderColor: 'rgba(139,92,246,0.25)',
              background: 'rgba(139,92,246,0.08)',
              color: '#c4b5fd',
            }}
          >
            <Sparkles className="h-4 w-4" />
            Select Eligible
          </button>

          <button type="button" onClick={clearSelected} className="btn-ghost text-sm px-4 py-2">
            <X className="h-4 w-4" />
            Clear
          </button>

          <div ref={exportRef} className="ml-auto">
            <ExportMenu
              open={exportOpen}
              onToggle={() => setExportOpen((p) => !p)}
              onCsv={handleExportCsv}
              onPdf={handleExportPdf}
              disabled={!selected.length}
            />
          </div>

          <button
            type="button"
            onClick={handleBulkSend}
            disabled={!selected.length || bulkSending}
            className="btn-primary text-sm px-4 py-2"
          >
            {bulkSending ? (
              <>
                <Zap className="h-4 w-4 animate-pulse" />
                Sending…
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Bulk Send ({selected.length})
              </>
            )}
          </button>
        </div>

        {/* Bulk results */}
        {bulkError && (
          <div
            className="mt-3 rounded-xl px-4 py-3 text-sm"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}
          >
            {bulkError}
          </div>
        )}
        {bulkResult && (
          <div
            className="mt-3 rounded-xl px-4 py-3 text-sm animate-fade-in"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#6ee7b7' }}
          >
            ✓ Sent: {bulkResult?.sent || 0} &nbsp;·&nbsp; Failed: {bulkResult?.failed || 0} &nbsp;·&nbsp; Skipped: {bulkResult?.skipped || 0}
          </div>
        )}
      </section>

      {/* ── Lead list + filters ── */}
      <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm" style={{ color: '#6b6b8a' }}>
              Showing{' '}
              <span className="font-semibold text-white">{filteredBusinesses.length}</span>
              {' '}of{' '}
              <span className="font-semibold text-white">{businesses.length}</span>
              {' '}businesses
            </div>
          </div>

          <BusinessList
            businesses={filteredBusinesses}
            onBusinessUpdate={handleBusinessUpdate}
            onToggleSelect={toggleSelect}
            loading={loading}
            query={requestedQuery}
          />
        </div>

        <FilterSidebar filters={filters} setFilters={setFilters} categories={categories} />
      </section>
    </main>
  )
}
