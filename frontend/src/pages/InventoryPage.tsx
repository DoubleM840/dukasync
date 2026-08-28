import { useEffect, useState, type FormEvent } from 'react'
import { adjustStock, createProduct, listInventory, updateProduct } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import type { Product } from '../types/api'
import toast from 'react-hot-toast'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'

interface ProductModalProps { onClose: () => void; onSaved: () => Promise<void> }
interface StockModalProps { product: Product; onClose: () => void; onSaved: () => Promise<void> }

function ProductModal({ onClose, onSaved }: ProductModalProps) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [stock, setStock] = useState('0')
  const [threshold, setThreshold] = useState('10')
  const [price, setPrice] = useState('0')
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!user?.shop_id) return
    try {
      await createProduct({ shop_id: user.shop_id, name, sku: sku || undefined, quantity_in_stock: Number(stock), reorder_threshold: Number(threshold), unit_price: Number(price) })
      await onSaved(); toast.success('Product added')
      onClose()
    } catch { setError('Unable to add product. Check the SKU and try again.'); toast.error('Unable to add product') }
  }

  return <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true"><form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl"><div className="flex items-center justify-between"><h3 className="text-xl font-semibold">Add product</h3><button type="button" onClick={onClose} aria-label="Close">X</button></div><input className="w-full rounded border p-2" placeholder="Product name" value={name} onChange={(event) => setName(event.target.value)} required /><input className="w-full rounded border p-2" placeholder="SKU" value={sku} onChange={(event) => setSku(event.target.value)} /><div className="grid grid-cols-3 gap-2"><input className="rounded border p-2" type="number" min="0" placeholder="Stock" value={stock} onChange={(event) => setStock(event.target.value)} /><input className="rounded border p-2" type="number" min="0" placeholder="Threshold" value={threshold} onChange={(event) => setThreshold(event.target.value)} /><input className="rounded border p-2" type="number" min="0" step="0.01" placeholder="Price" value={price} onChange={(event) => setPrice(event.target.value)} /></div>{error && <p className="text-sm text-red-600">{error}</p>}<div className="flex justify-end gap-2"><button type="button" className="rounded border px-4 py-2" onClick={onClose}>Cancel</button><button className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white" type="submit">Add product</button></div></form></div>
}

function StockModal({ product, onClose, onSaved }: StockModalProps) {
  const [change, setChange] = useState('0')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    const amount = Number(change)
    if (product.quantity_in_stock + amount < 0) { setError('Adjustment cannot make stock negative.'); return }
    try { await adjustStock(product.id, { quantity_change: amount, reason }); await onSaved(); toast.success('Stock adjusted'); onClose() } catch { setError('Unable to adjust stock.'); toast.error('Unable to adjust stock') }
  }

  return <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true"><form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl"><div className="flex items-center justify-between"><h3 className="text-xl font-semibold">Adjust stock</h3><button type="button" onClick={onClose} aria-label="Close">X</button></div><p className="text-sm text-gray-600">{product.name} currently has {product.quantity_in_stock} in stock.</p><input className="w-full rounded border p-2" type="number" placeholder="Change (+/-)" value={change} onChange={(event) => setChange(event.target.value)} required /><textarea className="w-full rounded border p-2" placeholder="Reason for adjustment" value={reason} onChange={(event) => setReason(event.target.value)} required />{error && <p className="text-sm text-red-600">{error}</p>}<div className="flex justify-end gap-2"><button type="button" className="rounded border px-4 py-2" onClick={onClose}>Cancel</button><button className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white" type="submit">Save adjustment</button></div></form></div>
}

export default function InventoryPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState<'product' | 'stock' | null>(null)
  const [selected, setSelected] = useState<Product | null>(null)

  async function refresh() {
    if (!user?.shop_id) return
    setLoading(true)
    try { setProducts((await listInventory(user.shop_id)).data); setError('') } catch { setError('Unable to load inventory.'); toast.error('Unable to load inventory') } finally { setLoading(false) }
  }
  useEffect(() => { void refresh() }, [user?.shop_id])

  async function saveThreshold(product: Product, value: string) {
    const threshold = Number(value)
    if (!Number.isFinite(threshold) || threshold < 0) return
    try { await updateProduct(product.id, { reorder_threshold: threshold }); await refresh(); toast.success('Reorder threshold updated') } catch { setError('Unable to update reorder threshold.'); toast.error('Unable to update threshold') }
  }

  if (!user?.shop_id) return <p className="text-red-600">Your account is not linked to a shop.</p>
  return <section className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Stock control</p><h2 className="mt-1 text-3xl font-bold text-gray-900">Inventory</h2><p className="mt-2 text-gray-600">Monitor stock and keep reorder thresholds current.</p></div><button className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700" onClick={() => setModal('product')}>Add product</button></div>{error && <p className="rounded bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}<div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">{loading ? <p className="p-6 text-sm text-gray-500">Loading inventory...</p> : <table className="min-w-full text-left text-sm"><thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">SKU</th><th className="px-4 py-3 text-right">In stock</th><th className="px-4 py-3">Reorder threshold</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{products.map((product) => <tr key={product.id}><td className="px-4 py-3 font-medium text-gray-900">{product.name}</td><td className="px-4 py-3 font-mono text-gray-500">{product.sku ?? '-'}</td><td className="px-4 py-3 text-right font-semibold">{product.quantity_in_stock}</td><td className="px-4 py-3"><input className="w-24 rounded border px-2 py-1" type="number" min="0" defaultValue={product.reorder_threshold} onBlur={(event) => void saveThreshold(product, event.target.value)} aria-label={`Reorder threshold for ${product.name}`} /></td><td className="px-4 py-3"><button className="rounded border px-3 py-1 text-xs font-semibold hover:bg-gray-50" onClick={() => { setSelected(product); setModal('stock') }}>Adjust Stock</button></td></tr>)}</tbody></table>}</div>{modal === 'product' && <ProductModal onClose={() => setModal(null)} onSaved={refresh} />}{modal === 'stock' && selected && <StockModal product={selected} onClose={() => { setModal(null); setSelected(null) }} onSaved={refresh} />}</section>
}
