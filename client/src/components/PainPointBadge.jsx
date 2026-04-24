import { AlertTriangle, CheckCircle2, Flame, Handshake, Sparkles } from 'lucide-react'
import { getLeadTone } from '../lib/painPoints.js'

const PALETTE = {
  red: {
    Icon: Flame,
    gradient: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(185,28,28,0.15))',
    border: 'rgba(239,68,68,0.35)',
    text: '#fca5a5',
    glow: '0 0 16px rgba(239,68,68,0.25)',
    label: 'Hot Lead',
  },
  orange: {
    Icon: AlertTriangle,
    gradient: 'linear-gradient(135deg, rgba(249,115,22,0.18), rgba(194,65,12,0.12))',
    border: 'rgba(249,115,22,0.3)',
    text: '#fb923c',
    glow: '0 0 16px rgba(249,115,22,0.2)',
    label: 'Outreach Lead',
  },
  yellow: {
    Icon: Sparkles,
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(180,83,9,0.1))',
    border: 'rgba(245,158,11,0.25)',
    text: '#fcd34d',
    glow: 'none',
    label: 'Low Priority',
  },
  blue: {
    Icon: Handshake,
    gradient: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(2,132,199,0.1))',
    border: 'rgba(56,189,248,0.25)',
    text: '#7dd3fc',
    glow: 'none',
    label: 'Partnership Lead',
  },
  gray: {
    Icon: CheckCircle2,
    gradient: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.08)',
    text: '#6b6b8a',
    glow: 'none',
    label: 'No Signals',
  },
}

export function PainPointBadge({ score = 0, leadType = '' }) {
  const key = getLeadTone(leadType, score)
  const cfg = PALETTE[key]
  const Icon = cfg.Icon

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all duration-200"
      style={{
        background: cfg.gradient,
        borderColor: cfg.border,
        color: cfg.text,
        boxShadow: cfg.glow,
      }}
    >
      <Icon className="h-3.5 w-3.5" />
      {leadType || cfg.label}
      <span
        className="rounded px-1 py-0.5 text-[10px] font-bold"
        style={{ background: 'rgba(0,0,0,0.25)', color: cfg.text }}
      >
        {score}
      </span>
    </span>
  )
}
