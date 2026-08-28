import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAuth } from '../hooks/useAuth'
import { getSales, listInventory } from '../services/api'
import type { Product, Sale } from '../types/api'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'

function useCountUp(value: number) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) { setDisplay(value); return }
    const started = performance.now()
    const frame = (now: number) => {
      const progress = Math.min((now - started) / 220, 1)
      setDisplay(Math.round(value * progress))
      if (progress < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }, [value])
  return display
}

interface DailySales {
  date: string
  label: string
  total: number
}

function getLastSevenDays(): DailySales[] {
  const today = new Date()
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setHours(0, 0, 0, 0)
    date.setDate(today.getDate() - (6 - index))
    return {
      date: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString('en-KE', { weekday: 'short' }),
      total: 0,
    }
  })
}

function isToday(timestamp: string) {
  const saleDate = new Date(timestamp)
  const today = new Date()
  return saleDate.toDateString() === today.toDateString()
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.shop_id) return
    setLoading(true)
    Promise.all([listInventory(user.shop_id), getSales()])
      .then(([inventoryResponse, salesResponse]) => {
        setProducts(inventoryResponse.data)
        setSales(salesResponse.data.filter((sale) => sale.shop_id === user.shop_id))
      })
      .catch(() => setError('Unable to load dashboard data.'))
      .finally(() => setLoading(false))
  }, [user?.shop_id])

  const lowStockProducts = useMemo(
    () => products
      .filter((product) => product.is_low_stock)
      .sort((left, right) => (left.quantity_in_stock - left.reorder_threshold) - (right.quantity_in_stock - right.reorder_threshold)),
    [products],
  )

  const salesToday = sales
    .filter((sale) => isToday(sale.sold_at))
    .reduce((total, sale) => total + Number(sale.sale_price), 0)
  const productCount = useCountUp(loading ? 0 : products.length)
  const salesCount = useCountUp(loading ? 0 : Math.round(salesToday))
  const lowStockCount = useCountUp(loading ? 0 : lowStockProducts.length)

  const chartData = useMemo(() => {
    const days = getLastSevenDays()
    const byDate = new Map(days.map((day) => [day.date, day]))
    sales.forEach((sale) => {
      const day = byDate.get(new Date(sale.sold_at).toISOString().slice(0, 10))
      if (day) day.total += Number(sale.sale_price)
    })
    return days
  }, [sales])

  if (!user?.shop_id) return <p className="text-red-600">Your account is not linked to a shop.</p>

  return (
    <section className="space-y-8" aria-labelledby="dashboard-heading">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Overview</p>
        <h2 id="dashboard-heading" className="mt-1 text-3xl font-bold text-gray-900">Good morning, {user.email?.split('@')[0] ?? 'there'}</h2>
        <p className="mt-2 text-gray-600">A clear view of today&apos;s shop activity.</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}</div>}

      <div className="relative overflow-hidden rounded-md bg-board-green p-5 shadow-lg before:pointer-events-none before:absolute before:inset-0 before:bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2240%22%20height=%2240%22%3E%3Cfilter%20id=%22n%22%3E%3CfeTurbulence%20baseFrequency=%22.8%22%20numOctaves=%222%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23n)%22%20opacity=%22.08%22/%3E%3C/svg%3E')] before:opacity-30"><p className="relative font-mono text-xs uppercase tracking-[0.2em] text-chalk/60">Stock board</p><div className="relative mt-4 grid gap-5 sm:grid-cols-3"><article><p className="font-display text-4xl text-chalk">{productCount}</p><p className="mt-1 text-sm text-chalk/70">Total products</p></article><article><p className="font-display text-4xl text-chalk">KES {salesCount.toLocaleString('en-KE')}</p><p className="mt-1 text-sm text-chalk/70">Sales today</p></article><article><p className="font-display text-4xl text-chalk">{lowStockCount}</p><p className="mt-1 text-sm text-chalk/70">Low-stock items</p></article></div>{lowStockProducts.length > 0 && <div className="relative mt-6 space-y-2">{lowStockProducts.map((product) => <p key={product.id} className={`animate-[fade-in_400ms_ease-out] border-b border-dashed pb-2 font-mono text-sm ${product.quantity_in_stock <= product.reorder_threshold * 0.25 ? 'text-duka-red' : 'text-signal-amber'}`}>{product.name}: {product.quantity_in_stock} left <button className="ml-2 text-chalk/70 hover:text-chalk" aria-label={`Dismiss ${product.name}`}>x</button></p>)}</div>}</div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm" aria-labelledby="low-stock-heading">
          <div className="mb-4 flex items-center justify-between"><h3 id="low-stock-heading" className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3><span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">{lowStockProducts.length} items</span></div>
          {loading ? <LoadingSkeleton rows={5} /> : lowStockProducts.length === 0 ? <EmptyState title="No products need attention" description="Low-stock alerts will appear here." /> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-3 py-3">Product</th><th className="px-3 py-3">SKU</th><th className="px-3 py-3 text-right">Stock</th><th className="px-3 py-3 text-right">Threshold</th><th className="px-3 py-3">Status</th></tr></thead><tbody className="divide-y divide-gray-100">{lowStockProducts.map((product) => { const critical = product.quantity_in_stock < product.reorder_threshold / 2; return <tr key={product.id}><td className="px-3 py-3 font-medium text-gray-900">{product.name}</td><td className="px-3 py-3 font-mono text-gray-500">{product.sku ?? '-'}</td><td className="px-3 py-3 text-right font-semibold text-red-600">{product.quantity_in_stock}</td><td className="px-3 py-3 text-right text-gray-600">{product.reorder_threshold}</td><td className="px-3 py-3"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${critical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{critical ? 'Critical' : 'Low'}</span></td></tr> })}</tbody></table></div>}
        </section>

        <section className="rounded-md border border-board-green/15 bg-chalk p-5 shadow-sm" aria-labelledby="sales-chart-heading"><h3 id="sales-chart-heading" className="mb-4 font-display text-lg text-board-green">Sales, last 7 days</h3><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F3D2E" strokeOpacity={0.18} /><XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#14171F' }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: '#14171F' }} /><Tooltip formatter={(value) => [`KES ${Number(value).toLocaleString('en-KE')}`, 'Sales']} contentStyle={{ border: '1px solid #1F3D2E', borderRadius: 0, background: '#F6F3EA' }} /><Bar dataKey="total" fill="#1F3D2E" /></BarChart></ResponsiveContainer></div></section>
      </div>
    </section>
  )
}
