/**
 * StatCard — premium metric tile.
 *
 * Visual upgrades:
 * - Tone-specific subtle SVG background pattern (grid / currency / dots)
 * - Glassmorphism: backdrop-blur + semi-transparent surface
 * - Gradient border using a wrapping technique
 * - whileHover y:-2 lift + shadow deepens
 * - whileTap scale:0.97 tactile feedback
 * - children slot for sparkline / mini chart
 */
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  detail: string
  icon: LucideIcon
  tone: 'indigo' | 'emerald' | 'amber'
  trend?: string
  children?: React.ReactNode
}

// ─── Tone config ──────────────────────────────────────────────────────────────

const toneConfig = {
  indigo: {
    iconBg: 'bg-indigo-100 text-indigo-600',
    gradientFrom: 'from-indigo-50/60',
    gradientTo: 'to-white',
    borderGlow: 'shadow-indigo-100',
    trendBg: 'bg-indigo-50 text-indigo-700',
    patternColor: '#6366F1',
  },
  emerald: {
    iconBg: 'bg-emerald-100 text-emerald-600',
    gradientFrom: 'from-emerald-50/60',
    gradientTo: 'to-white',
    borderGlow: 'shadow-emerald-100',
    trendBg: 'bg-emerald-50 text-emerald-700',
    patternColor: '#10B981',
  },
  amber: {
    iconBg: 'bg-amber-100 text-amber-600',
    gradientFrom: 'from-amber-50/60',
    gradientTo: 'to-white',
    borderGlow: 'shadow-amber-100',
    trendBg: 'bg-amber-50 text-amber-700',
    patternColor: '#F59E0B',
  },
}

// ─── Background pattern SVGs (data URIs) ─────────────────────────────────────

function gridPattern(color: string) {
  const encoded = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${color}" stroke-width="0.4" opacity="0.35"/>
    </svg>`,
  )
  return `url("data:image/svg+xml,${encoded}")`
}

function dotsPattern(color: string) {
  const encoded = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <circle cx="2" cy="2" r="1.2" fill="${color}" opacity="0.3"/>
    </svg>`,
  )
  return `url("data:image/svg+xml,${encoded}")`
}

function currencyPattern(color: string) {
  const encoded = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28">
      <text x="2" y="20" font-size="14" fill="${color}" opacity="0.12" font-family="sans-serif" font-weight="700">₭</text>
    </svg>`,
  )
  return `url("data:image/svg+xml,${encoded}")`
}

const patterns = {
  indigo: gridPattern,
  emerald: currencyPattern,
  amber: dotsPattern,
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  trend = '0% vs yesterday',
  children,
}: StatCardProps) {
  const cfg = toneConfig[tone]
  const patternFn = patterns[tone]

  return (
    <motion.article
      className={`relative overflow-hidden rounded-2xl border border-slate-100/80 bg-gradient-to-br ${cfg.gradientFrom} ${cfg.gradientTo} p-5 shadow-sm ${cfg.borderGlow} cursor-default`}
      style={{
        backgroundImage: patternFn(cfg.patternColor),
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      whileHover={{ y: -2, boxShadow: '0 10px 30px rgba(0,0,0,0.10)' }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      {/* subtle radial glow top-right */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20"
        style={{
          background: `radial-gradient(circle, ${cfg.patternColor} 0%, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* icon + trend row */}
      <div className="relative flex items-start justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${cfg.iconBg} shadow-sm`}>
          <Icon size={20} strokeWidth={2.1} />
        </span>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${cfg.trendBg}`}>
          ↑ {trend}
        </span>
      </div>

      {/* content */}
      <p className="relative mt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="relative mt-1 text-4xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="relative mt-2 text-xs text-slate-400">{detail}</p>

      {children && <div className="relative mt-3">{children}</div>}
    </motion.article>
  )
}
