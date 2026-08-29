/**
 * WelcomeCard — personalised dashboard hero card.
 *
 * Features:
 * - User avatar: coloured circle with initials derived from email
 * - Time-of-day greeting (morning / afternoon / evening)
 * - Contextual SVG illustration swaps based on hour
 * - Key metric slot: "KES X,XXX sales today" in large bold font
 * - Subtle animated entrance
 * - Illustration hidden on mobile (<sm), replaced with icon row
 */
import { motion } from 'framer-motion'
import { Sun, Sunset, Moon, TrendingUp } from 'lucide-react'
import {
  WelcomeMorningIllustration,
  WelcomeAfternoonIllustration,
  WelcomeEveningIllustration,
} from './illustrations/index'

interface WelcomeCardProps {
  email?: string
  shopName?: string
  salesToday: number
  lowStockCount: number
  loading?: boolean
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function getGreeting(tod: 'morning' | 'afternoon' | 'evening'): string {
  return tod === 'morning' ? 'Good morning' : tod === 'afternoon' ? 'Good afternoon' : 'Good evening'
}

function getInitials(email?: string): string {
  if (!email) return 'DS'
  const name = email.split('@')[0]
  const parts = name.split(/[._-]/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

/** Deterministic hue from email string so the same user always gets the same colour */
function avatarHue(email?: string): number {
  if (!email) return 220
  let hash = 0
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}

const todGradient = {
  morning: 'from-amber-50 via-orange-50/60 to-white',
  afternoon: 'from-sky-50 via-indigo-50/40 to-white',
  evening: 'from-indigo-950/10 via-slate-100/60 to-white',
}

const todBorder = {
  morning: 'border-amber-200/60',
  afternoon: 'border-sky-200/60',
  evening: 'border-indigo-200/60',
}

const TimeIcon = {
  morning: Sun,
  afternoon: Sunset,
  evening: Moon,
}

const Illustrations = {
  morning: WelcomeMorningIllustration,
  afternoon: WelcomeAfternoonIllustration,
  evening: WelcomeEveningIllustration,
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WelcomeCard({
  email,
  shopName,
  salesToday,
  lowStockCount,
  loading = false,
}: WelcomeCardProps) {
  const tod = getTimeOfDay()
  const greeting = getGreeting(tod)
  const initials = getInitials(email)
  const hue = avatarHue(email)
  const name = email?.split('@')[0] ?? 'there'
  const TodIcon = TimeIcon[tod]
  const Illustration = Illustrations[tod]

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl border ${todBorder[tod]} bg-gradient-to-br ${todGradient[tod]} p-6 shadow-sm`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.05 }}
    >
      {/* radial glow */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-20"
        style={{ background: `radial-gradient(circle, hsl(${hue},70%,65%) 0%, transparent 70%)` }}
        aria-hidden="true"
      />

      <div className="relative flex flex-wrap items-center justify-between gap-6">
        {/* left: avatar + text */}
        <div className="flex items-center gap-4">
          {/* avatar */}
          <div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-md"
            style={{
              background: `linear-gradient(135deg, hsl(${hue},65%,48%), hsl(${(hue + 30) % 360},65%,40%))`,
            }}
            aria-hidden="true"
          >
            {initials}
          </div>

          {/* greeting + shop */}
          <div>
            <div className="flex items-center gap-2">
              <TodIcon size={15} className="text-slate-400" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                {greeting}
              </span>
            </div>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {name}
            </h1>
            {shopName && (
              <p className="mt-0.5 text-sm text-slate-500">{shopName}</p>
            )}
          </div>
        </div>

        {/* centre: key metric */}
        <div className="flex flex-col items-start sm:items-center">
          {loading ? (
            <div className="h-9 w-40 animate-pulse rounded-lg bg-slate-200" />
          ) : (
            <motion.div
              key={salesToday}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 24 }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600">
                Sales today
              </p>
              <p className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                KES {salesToday.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <TrendingUp size={12} className="text-emerald-500" />
                {lowStockCount > 0
                  ? `${lowStockCount} item${lowStockCount !== 1 ? 's' : ''} need restocking`
                  : 'Shelves fully stocked'}
              </div>
            </motion.div>
          )}
        </div>

        {/* right: illustration — hidden on xs */}
        <div className="hidden sm:block flex-shrink-0" aria-hidden="true">
          <Illustration className="h-32 w-32 opacity-90 drop-shadow-sm" />
        </div>
      </div>
    </motion.div>
  )
}
