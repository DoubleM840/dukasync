import { useEffect, useState } from 'react'
import { listShopRestockOrders, receiveRestockOrder } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import type { RestockOrder } from '../types/api'
import toast from 'react-hot-toast'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'

const STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const

export default function RestockOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<RestockOrder[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    if (!user?.shop_id) return
    setLoading(true)
    try { setOrders((await listShopRestockOrders(user.shop_id, filter || undefined)).data); setError('') }
    catch { setError('Unable to load restock orders.'); toast.error('Unable to load restock orders') }
    finally { setLoading(false) }
  }
  useEffect(() => { void refresh() }, [user?.shop_id, filter])

  async function markReceived(orderId: number) {
    if (!user?.shop_id) return
    try { await receiveRestockOrder(user.shop_id, orderId); toast.success('Order marked as received'); await refresh() }
    catch { setError('Unable to mark order as received.'); toast.error('Unable to mark order as received') }
  }

  if (!user?.shop_id) return <p className="text-red-600">Your account is not linked to a shop.</p>
  return <section className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Replenishment</p><h2 className="mt-1 text-3xl font-bold text-gray-900">Restock orders</h2></div><label className="text-sm font-medium text-gray-700">Filter status<select className="ml-2 rounded-lg border border-gray-300 bg-white px-3 py-2" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="">All statuses</option>{STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></label></div>{error && <p className="rounded bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}<div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">{loading ? <LoadingSkeleton rows={6} /> : orders.length === 0 ? <EmptyState title="No restock orders" description="Orders will appear here when stock needs replenishing." /> : <table className="min-w-full text-left text-sm"><thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">Supplier</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Created</th><th className="px-4 py-3">Action</th></tr></thead><tbody className="divide-y divide-gray-100">{orders.map((order) => <tr key={order.id}><td className="px-4 py-3 font-medium text-gray-900">{order.product_name ?? `Product #${order.product_id}`}</td><td className="px-4 py-3 text-gray-600">{order.supplier_name ?? (order.supplier_id ? `Supplier #${order.supplier_id}` : 'Unassigned')}</td><td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : order.status === 'CANCELLED' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'}`}>{order.status}</span></td><td className="px-4 py-3 text-gray-600">{new Date(order.created_at ?? order.triggered_at).toLocaleDateString('en-KE')}</td><td className="px-4 py-3">{order.status === 'DELIVERED' ? <span className="text-xs text-green-700">Received</span> : <button className="rounded border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 active:scale-95 transition-transform" onClick={() => void markReceived(order.id)}>Mark as Received</button>}</td></tr>)}</tbody></table>}</div></section>
}
