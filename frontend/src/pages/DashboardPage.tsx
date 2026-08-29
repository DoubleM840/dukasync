/**
 * DashboardPage — premium visual overhaul
 *
 * Changes vs previous version:
 * - WelcomeCard replaces the plain text header                 [task 6/8]
 * - AlertBanner carousel replaces the pill strip              [task 5/8]
 * - EmptyState components use SVG illustrations               [task 3/8]
 * - StatCard stagger entrance + SkeletonCard loading          [task 3/11]
 * - Sparkline inside Sales Today card                         [task 9]
 * - Category Donut PieChart                                   [task 10]
 */
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowRight } from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Cell,
  Line, LineChart,
  Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { Boxes, CircleDollarSign, PackageSearch } from 'lucide-react'
import AlertBanner from '../components/AlertBanner'
import EmptyState from '../components/EmptyState'
import LoadingSkeleton from '../components/LoadingSkeleton'
import SkeletonCard from '../components/SkeletonCard'
import StatCard from '../components/StatCard'
import WelcomeCard from '../components/WelcomeCard'
import {
  EmptyInventoryIllustration,
  EmptySalesIllustration,
} from '../components/illustrations/index'
import { useAuth } from '../hooks/useAuth'
import { getSales, listInventory } from '../services/api'
import type { Product, Sale } from '../types/api'

// ─── helpers ──────────────────────────────────────────────────────────────────

interface DailySales { date: string; label: string; total: number }

function getLastSevenDays(): DailySales[] {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setHours(0, 0, 0, 0)
    d.setDate(today.getDate() - (6 - i))
    return {
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-KE', { weekday: 'short' }),
      total: 0,
    }
  })
}

const cardContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
const cardItemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 340, damping: 26 } },
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data }: { data: DailySales[] }) {
  return (
    <div className="h-12 w-full" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line type="monotone" dataKey="total" stroke="#4F46E5" strokeWidth={2} dot={false} isAnimationActive />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Category Donut ───────────────────────────────────────────────────────────

interface CategoryEntry { name: string; value: number; color: string }
const DONUT_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#0EA5E9', '#F43F5E']

function DonutChart({ data }: { data: CategoryEntry[] }) {
  if (!data.some((e) => e.value > 0)) {
    return (
      <EmptyState title="No sales data yet" description="Revenue by product will appear here.">
        <EmptySalesIllustration
          className="h-32 w-32"
          aria-label="Illustration of empty sales chart"
        />
      </EmptyState>
    )
  }
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="h-52 w-52 flex-shrink-0" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius="58%" outerRadius="82%" dataKey="value" paddingAngle={3} isAnimationActive>
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={entry.color ?? DONUT_COLORS[i % DONUT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`KES ${Number(value).toLocaleString('en-KE', { minimumFractionDigits: 0 })}`, 'Revenue']}
              contentStyle={{ border: '1px solid #E2E8F0', borderRadius: 10, background: '#FFFFFF' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex flex-1 flex-col gap-2 text-sm">
        {data.map((entry) => (
          <li key={entry.name} className="flex items-center gap-2 truncate">
            <span className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: entry.color }} />
            <span className="flex-1 truncate text-slate-700">{entry.name}</span>
            <span className="font-semibold text-slate-900">KES {entry.value.toLocaleString('en-KE', { minimumFractionDigits: 0 })}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())

  async function refreshDashboard() {
    if (!user?.shop_id) return
    setLoading(true)
    try {
      const [inv, salesRes] = await Promise.all([listInventory(user.shop_id), getSales()])
      setProducts(inv.data)
      setSales(salesRes.data.filter((s) => s.shop_id === user.shop_id))
      setError('')
    } catch {
      setError('Connection issue. Tap to retry.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (user?.shop_id) void refreshDashboard() }, [user?.shop_id])

  // ── derived ──────────────────────────────────────────────────────────────────
  const lowStock = useMemo(
    () => products.filter((p) => p.is_low_stock)
      .sort((a, b) => (a.quantity_in_stock - a.reorder_threshold) - (b.quantity_in_stock - b.reorder_threshold)),
    [products],
  )

  const salesToday = sales
    .filter((s) => new Date(s.sold_at).toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + Number(s.sale_price), 0)

  const chartData = useMemo(() => {
    const days = getLastSevenDays()
    const byDate = new Map(days.map((d) => [d.date, d]))
    sales.forEach((s) => {
      const day = byDate.get(new Date(s.sold_at).toISOString().slice(0, 10))
      if (day) day.total += Number(s.sale_price)
    })
    return days
  }, [sales])

  const categoryData = useMemo<CategoryEntry[]>(
    () => products
      .map((p, i) => ({
        name: p.name,
        value: sales.filter((s) => s.product_id === p.id).reduce((sum, s) => sum + Number(s.sale_price), 0),
        color: DONUT_COLORS[i % DONUT_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5),
    [products, sales],
  )

  if (!user?.shop_id) return <p className="text-slate-600">Your account is not linked to a shop.</p>

  const visibleAlerts = lowStock.filter((p) => !dismissed.has(p.id))

  return (
    <motion.section
      className="space-y-8"
      aria-labelledby="dashboard-heading"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* ── Welcome card ── */}
      <WelcomeCard
        email={user.email}
        shopName={user.shop_name ?? (user.shop_id ? `Shop #${user.shop_id}` : undefined)}
        salesToday={salesToday}
        lowStockCount={lowStock.length}
        loading={loading}
      />

      {/* ── Error ── */}
      {!loading && error && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          <AlertCircle className="text-amber-500" size={18} />
          <span>{error}</span>
          <button className="ml-auto font-semibold text-indigo-600 hover:text-indigo-800 active:scale-95 transition-transform" onClick={() => void refreshDashboard()}>
            Try again
          </button>
        </div>
      )}

      {/* ── Low-stock carousel ── */}
      {visibleAlerts.length > 0 && (
        <AlertBanner
          products={visibleAlerts}
          onDismiss={(id) => setDismissed((curr) => new Set(curr).add(id))}
        />
      )}

      {/* ── Stat cards ── */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : (
        <motion.div className="grid gap-4 md:grid-cols-3" variants={cardContainerVariants} initial="hidden" animate="show">
          <motion.div variants={cardItemVariants}>
            <StatCard label="Total products" value={String(products.length)} detail="Items in your inventory" icon={Boxes} tone="indigo" />
          </motion.div>
          <motion.div variants={cardItemVariants}>
            <StatCard label="Sales today" value={`KES ${salesToday.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`} detail="Revenue recorded today" icon={CircleDollarSign} tone="emerald">
              <Sparkline data={chartData} />
            </StatCard>
          </motion.div>
          <motion.div variants={cardItemVariants}>
            <StatCard label="Low-stock items" value={String(lowStock.length)} detail="Need a closer look" icon={PackageSearch} tone="amber" />
          </motion.div>
        </motion.div>
      )}

      {/* ── Bottom panels ── */}
      <div className="grid items-stretch gap-6 xl:grid-cols-2">
        {/* Low-stock table */}
        <section className="flex min-h-[400px] flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950">Low Stock Alerts</h2>
            <a className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800" href="/inventory">
              View all <ArrowRight size={15} />
            </a>
          </div>
          {loading ? <LoadingSkeleton rows={5} /> : lowStock.length === 0 ? (
            <EmptyState title="Everything is stocked" description="No products need attention right now.">
              <EmptyInventoryIllustration
                className="h-36 w-36"
                aria-label="Illustration of a fully stocked shelf"
              />
            </EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-2 py-3">Item name</th>
                    <th className="px-2 py-3">SKU</th>
                    <th className="px-2 py-3">Stock level</th>
                    <th className="px-2 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStock.map((product) => {
                    const ratio = Math.min(product.quantity_in_stock / Math.max(product.reorder_threshold, 1), 1)
                    return (
                      <tr key={product.id}>
                        <td className="px-2 py-3 font-medium text-slate-900">{product.name}</td>
                        <td className="px-2 py-3 font-mono text-xs text-slate-500">{product.sku ?? '-'}</td>
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 min-w-16 flex-1 rounded-full bg-slate-100">
                              <div className={`h-1.5 rounded-full ${ratio < 0.5 ? 'bg-red-500' : 'bg-amber-400'}`} style={{ width: `${Math.max(ratio * 100, 5)}%` }} />
                            </div>
                            <span className="font-mono text-xs text-slate-600">{product.quantity_in_stock}</span>
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          <a className="text-xs font-semibold text-indigo-600 hover:text-indigo-800" href="/restock-orders">Restock</a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Right: bar chart + donut */}
        <div className="flex flex-col gap-6">
          <section className="flex min-h-[200px] flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-950">Sales, last 7 days</h2>
              <a className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800" href="/sales">
                View all <ArrowRight size={15} />
              </a>
            </div>
            {loading ? <LoadingSkeleton rows={4} /> : sales.length === 0 ? (
              <EmptyState title="No sales yet" description="Your weekly trend will appear here.">
                <EmptySalesIllustration
                  className="h-28 w-28"
                  aria-label="Illustration of empty sales chart"
                />
              </EmptyState>
            ) : (
              <div className="h-52 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                    <Tooltip formatter={(value) => [`KES ${Number(value).toLocaleString('en-KE')}`, 'Sales']} contentStyle={{ border: '1px solid #E2E8F0', borderRadius: 12, background: '#FFFFFF' }} />
                    <Bar dataKey="total" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="flex flex-1 flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-950">Top 5 by Revenue</h2>
            {loading ? <LoadingSkeleton rows={5} /> : <DonutChart data={categoryData} />}
          </section>
        </div>
      </div>
    </motion.section>
  )
}
