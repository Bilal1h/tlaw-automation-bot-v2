import { RotateCcw, SlidersHorizontal } from 'lucide-react'

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-all duration-200"
      style={{
        background: checked
          ? 'linear-gradient(135deg, #7c3aed, #5b21b6)'
          : 'rgba(255,255,255,0.08)',
        boxShadow: checked ? '0 0 10px rgba(124,58,237,0.4)' : 'none',
      }}
    >
      <span
        className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: checked ? 'translateX(19px)' : 'translateX(3px)' }}
      />
    </button>
  )
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <div
      className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-all duration-200"
      style={{
        borderColor: checked ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.08)',
        background: checked ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.02)',
      }}
      onClick={() => onChange(!checked)}
    >
      <span className="text-sm" style={{ color: checked ? '#c4b5fd' : '#9898b8' }}>
        {label}
      </span>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  )
}

function SectionHeader({ children }) {
  return (
    <div
      className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]"
      style={{ color: '#4a4a6a' }}
    >
      {children}
    </div>
  )
}

export function FilterSidebar({ filters, setFilters, categories = [] }) {
  function resetFilters() {
    setFilters({
      ratingRanges: { '1-2': false, '2-3': false, '3-4': false, '4-5': false },
      minReviews: 0,
      maxReviews: '',
      category: 'all',
      hasPainPointsOnly: false,
      hasWebsiteOnly: false,
      leadType: 'all',
      hotLeadsOnly: false,
    })
  }

  const ratingOptions = [
    { key: '1-2', label: '1–2 stars', color: '#ef4444' },
    { key: '2-3', label: '2–3 stars', color: '#f97316' },
    { key: '3-4', label: '3–4 stars', color: '#f59e0b' },
    { key: '4-5', label: '4–5 stars', color: '#22c55e' },
  ]

  const leadTypeOptions = ['Hot Lead', 'Outreach Lead', 'Partnership Lead', 'Low Priority']

  return (
    <aside
      className="sticky top-20 rounded-2xl"
      style={{
        background: '#111120',
        border: '1px solid rgba(139,92,246,0.12)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(139,92,246,0.1)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}
          >
            <SlidersHorizontal className="h-4 w-4" style={{ color: '#8b5cf6' }} />
          </div>
          <div>
            <div
              className="text-sm font-semibold text-white"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Filters
            </div>
            <div className="text-[11px]" style={{ color: '#4a4a6a' }}>
              Narrow your lead list
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200 hover:bg-white/5"
          style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#6b6b8a' }}
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      {/* Sections */}
      <div className="space-y-5 p-5">
        {/* Lead type */}
        <section>
          <SectionHeader>Lead type</SectionHeader>
          <select
            value={filters?.leadType || 'all'}
            onChange={(e) => setFilters((p) => ({ ...p, leadType: e.target.value }))}
            className="field field-select w-full text-sm"
          >
            <option value="all">All lead types</option>
            {leadTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </section>

        {/* Rating */}
        <section>
          <SectionHeader>Rating range</SectionHeader>
          <div className="space-y-2">
            {ratingOptions.map((opt) => {
              const checked = Boolean(filters?.ratingRanges?.[opt.key])
              return (
                <label
                  key={opt.key}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition-all duration-200"
                  style={{
                    borderColor: checked ? `${opt.color}40` : 'rgba(255,255,255,0.06)',
                    background: checked ? `${opt.color}0d` : 'transparent',
                    color: checked ? opt.color : '#9898b8',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setFilters((p) => ({
                      ...p,
                      ratingRanges: { ...p.ratingRanges, [opt.key]: e.target.checked },
                    }))}
                    className="h-3.5 w-3.5"
                  />
                  <span>{opt.label}</span>
                </label>
              )
            })}
          </div>
        </section>

        {/* Review count */}
        <section>
          <SectionHeader>Review count</SectionHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1.5 text-[11px]" style={{ color: '#4a4a6a' }}>Min</div>
              <input
                type="number"
                min="0"
                value={filters?.minReviews ?? 0}
                onChange={(e) => setFilters((p) => ({
                  ...p, minReviews: e.target.value === '' ? 0 : Number(e.target.value),
                }))}
                className="field text-sm"
              />
            </div>
            <div>
              <div className="mb-1.5 text-[11px]" style={{ color: '#4a4a6a' }}>Max</div>
              <input
                type="number"
                min="0"
                value={filters?.maxReviews ?? ''}
                onChange={(e) => setFilters((p) => ({
                  ...p, maxReviews: e.target.value === '' ? '' : Number(e.target.value),
                }))}
                placeholder="Any"
                className="field text-sm"
              />
            </div>
          </div>
        </section>

        {/* Category */}
        <section>
          <SectionHeader>Category</SectionHeader>
          <select
            value={filters?.category || 'all'}
            onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}
            className="field field-select w-full text-sm"
          >
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </section>

        {/* Quick toggles */}
        <section>
          <SectionHeader>Quick toggles</SectionHeader>
          <div className="space-y-2">
            <ToggleRow
              label="Hot leads only (score ≥75)"
              checked={!!filters?.hotLeadsOnly}
              onChange={(v) => setFilters((p) => ({ ...p, hotLeadsOnly: v }))}
            />
            <ToggleRow
              label="Has pain signals"
              checked={!!filters?.hasPainPointsOnly}
              onChange={(v) => setFilters((p) => ({ ...p, hasPainPointsOnly: v }))}
            />
            <ToggleRow
              label="Has website"
              checked={!!filters?.hasWebsiteOnly}
              onChange={(v) => setFilters((p) => ({ ...p, hasWebsiteOnly: v }))}
            />
          </div>
        </section>
      </div>
    </aside>
  )
}
