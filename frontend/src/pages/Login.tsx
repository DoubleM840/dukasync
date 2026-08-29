/**
 * Login page — branded split-panel layout.
 *
 * Left panel (hidden on mobile): deep green brand panel with:
 *   - DukaSync wordmark + tagline
 *   - LoginIllustration SVG
 *   - Feature highlights with Lucide icons
 *
 * Right panel: clean white card with the sign-in form.
 *
 * Mobile: only the right (form) panel is shown; the left panel is hidden.
 */
import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, Package, ShieldCheck, Wifi } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { LoginIllustration } from '../components/illustrations/index'
import toast from 'react-hot-toast'

const features = [
  { icon: Package,    text: 'Real-time inventory tracking' },
  { icon: BarChart3,  text: 'Daily sales analytics' },
  { icon: Wifi,       text: 'Works offline — syncs on reconnect' },
  { icon: ShieldCheck, text: 'Secure, shop-scoped access' },
]

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      toast.success('Signed in successfully')
      navigate('/dashboard')
    } catch {
      toast.error('Unable to sign in')
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left brand panel ─────────────────────────────────────────────── */}
      <div
        className="relative hidden flex-1 flex-col items-center justify-center overflow-hidden bg-board-green px-12 py-16 lg:flex"
        aria-hidden="true"
      >
        {/* mesh glow */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #4B7F52 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-72 w-72 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #4F46E5 0%, transparent 70%)' }} />

        {/* wordmark */}
        <motion.div
          className="mb-10 text-left"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-display text-4xl font-black tracking-tight text-chalk">DukaSync</p>
          <p className="mt-2 text-chalk/60">Inventory & sales management for Kenyan retailers</p>
        </motion.div>

        {/* illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 24 }}
        >
          <LoginIllustration
            className="h-64 w-64 drop-shadow-2xl"
            aria-label="Shop owner managing DukaSync dashboard illustration"
          />
        </motion.div>

        {/* feature list */}
        <motion.ul
          className="mt-10 space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {features.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-chalk/75">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Icon size={14} className="text-chalk" />
              </span>
              {text}
            </li>
          ))}
        </motion.ul>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-paper px-6 py-12 sm:px-12">
        {/* mobile wordmark */}
        <div className="mb-8 lg:hidden">
          <p className="font-display text-3xl font-black tracking-tight text-board-green">DukaSync</p>
          <p className="mt-1 text-sm text-slate-500">Inventory & sales for Kenyan retailers</p>
        </div>

        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        >
          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
            <h1 className="text-2xl font-bold text-slate-950">Sign in</h1>
            <p className="mt-1 text-sm text-slate-500">Welcome back. Enter your credentials below.</p>

            <form className="mt-7 space-y-4" onSubmit={submit}>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="login-email">
                  Email
                </label>
                <input
                  id="login-email"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="login-password">
                  Password
                </label>
                <input
                  id="login-password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <motion.p
                  className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                className="mt-2 w-full rounded-xl bg-board-green py-3 font-semibold text-chalk shadow-sm transition hover:bg-sokoni-green disabled:opacity-60"
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </motion.button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            DukaSync · Built for Kenyan small businesses
          </p>
        </motion.div>
      </div>
    </div>
  )
}
