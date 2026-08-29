/**
 * InventoryPage
 *
 * What changed:
 * - Debounced search bar filters products as the user types           [task 8]
 * - Stock column replaced with colour-coded dot + mini progress bar   [task 7]
 *   Green >10 · Amber 5–10 · Red <5
 * - LoadingSkeleton shown while fetching (was plain <p>)
 * - active:scale-95 on all primary/action buttons                     [task 12]
 */
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { adjustStock, createProduct, listInventory, updateProduct } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import type { Product } from '../types/api'
import toast from 'react-hot-toast'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'

// ─── Stock indicator helpers ────────────────────────────────────────────────

function stockTone(qty: number): 'green' | 'amber' | 'red' {
  if (qty > 10) return 'green'
  if (qty >= 5) return 'amber'
  return 'red'
}

const dotClass = {
  green: 'bg-emerald-500',
  amber: 'bg-amber-400',
  red: 'bg-red-500',
}

const barClass = {
  green: 'bg-emerald-400',
  amber: 'bg-amber-400',
  red: 'bg-red-500',
}

interface StockIndicatorProps {
  quantity: number
  max?: number
}

function StockIndicator({ quantity, max = 50 }: StockIndicatorProps) {
  const tone = stockTone(quantity)
  const pct = Math.min((quantity / Math.max(max, 1)) * 100, 100)
  return (
    <div className="flex items-center gap-2">
      {/* colour dot */}
      <span
        className={`inline-block h-2 w-2 flex-shrink-0 rounded-full ${dotClass[tone]}`}
        aria-hidden="true"
      />
      {/* mini progress bar */}
      <div className="h-1.5 w-16 flex-shrink-0 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${barClass[tone]}`}
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>
      {/* numeric label */}
      <span
        className={`min-w-[2.5ch] text-right font-mono text-xs font-semibold ${
          tone === 'red'
            ? 'text-red-600'
            : tone === 'amber'
              ? 'text-amber-600'
              : 'text-emerald-700'
        }`}
      >
        {quantity}
      </span>
    </div>
  )
}

// ─── useDebounce hook ────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay = 280): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

// ─── Modals ──────────────────────────────────────────────────────────────────

interface ProductModalProps {
  onClose: () => void
  onSaved: () => Promise<void>
}

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
      await createProduct({
        shop_id: user.shop_id,
        name,
        sku: sku || undefined,
        quantity_in_stock: Number(stock),
        reorder_threshold: Number(threshold),
        unit_price: Number(price),
      })
      await onSaved()
      toast.success('Product added')
      onClose()
    } catch {
      setError('Unable to add product. Check the SKU and try again.')
      toast.error('Unable to add product')
    }
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={submit}
        className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Add product</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>
        <input
          className="w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="SKU (optional)"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
        />
        <div className="grid grid-cols-3 gap-2">
          <input
            className="rounded border p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="number"
            min="0"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
          <input
            className="rounded border p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="number"
            min="0"
            placeholder="Threshold"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          />
          <input
            className="rounded border p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="number"
            min="0"
            step="0.01"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded border px-4 py-2 hover:bg-slate-50 active:scale-95 transition-transform"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 active:scale-95 transition-transform"
            type="submit"
          >
            Add product
          </button>
        </div>
      </form>
    </div>
  )
}

interface StockModalProps {
  product: Product
  onClose: () => void
  onSaved: () => Promise<void>
}

function StockModal({ product, onClose, onSaved }: StockModalProps) {
  const [change, setChange] = useState('0')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    const amount = Number(change)
    if (product.quantity_in_stock + amount < 0) {
      setError('Adjustment cannot make stock negative.')
      return
    }
    try {
      await adjustStock(product.id, { quantity_change: amount, reason })
      await onSaved()
      toast.success('Stock adjusted')
      onClose()
    } catch {
      setError('Unable to adjust stock.')
      toast.error('Unable to adjust stock')
    }
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={submit}
        className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Adjust stock</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>
        <p className="text-sm text-gray-600">
          <span className="font-medium">{product.name}</span> currently has{' '}
          <span className="font-semibold">{product.quantity_in_stock}</span> in stock.
        </p>
        <input
          className="w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          type="number"
          placeholder="Change amount (+/-)"
          value={change}
          onChange={(e) => setChange(e.target.value)}
          required
        />
        <textarea
          className="w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Reason for adjustment"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded border px-4 py-2 hover:bg-slate-50 active:scale-95 transition-transform"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 active:scale-95 transition-transform"
            type="submit"
          >
            Save adjustment
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState<'product' | 'stock' | null>(null)
  const [selected, setSelected] = useState<Product | null>(null)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const searchRef = useRef<HTMLInputElement>(null)

  async function refresh() {
    if (!user?.shop_id) return
    setLoading(true)
    try {
      setProducts((await listInventory(user.shop_id)).data)
      setError('')
    } catch {
      setError('Unable to load inventory.')
      toast.error('Unable to load inventory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void refresh() }, [user?.shop_id])

  async function saveThreshold(product: Product, value: string) {
    const threshold = Number(value)
    if (!Number.isFinite(threshold) || threshold < 0) return
    try {
      await updateProduct(product.id, { reorder_threshold: threshold })
      await refresh()
      toast.success('Reorder threshold updated')
    } catch {
      setError('Unable to update reorder threshold.')
      toast.error('Unable to update threshold')
    }
  }

  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase()
    if (!term) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.sku ?? '').toLowerCase().includes(term),
    )
  }, [products, debouncedSearch])

  // Derive max stock for progress bar scaling (capped at 50 min)
  const maxStock = useMemo(
    () => Math.max(...products.map((p) => p.quantity_in_stock), 50),
    [products],
  )

  if (!user?.shop_id)
    return <p className="text-red-600">Your account is not linked to a shop.</p>

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
            Stock control
          </p>
          <h2 className="mt-1 text-3xl font-bold text-gray-900">Inventory</h2>
          <p className="mt-2 text-gray-600">
            Monitor stock and keep reorder thresholds current.
          </p>
        </div>
        <button
          className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 active:scale-95 transition-transform"
          onClick={() => setModal('product')}
        >
          Add product
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {/* Search bar */}
      <div className="relative">
        <label className="sr-only" htmlFor="inventory-search">
          Search inventory
        </label>
        <input
          id="inventory-search"
          ref={searchRef}
          type="search"
          className="w-full rounded-lg border border-slate-300 py-2.5 pl-4 pr-10 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Search by product name or SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            onClick={() => { setSearch(''); searchRef.current?.focus() }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          Healthy (&gt;10)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
          Low (5–10)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
          Critical (&lt;5)
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <LoadingSkeleton rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={search ? 'No matching products' : 'No products yet'}
            description={
              search
                ? 'Try a different name or SKU.'
                : 'Add your first product to get started.'
            }
          />
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">In stock</th>
                <th className="px-4 py-3">Reorder threshold</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                  <td className="px-4 py-3 font-mono text-gray-500">
                    {product.sku ?? '-'}
                  </td>
                  <td className="px-4 py-3">
                    <StockIndicator quantity={product.quantity_in_stock} max={maxStock} />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className="w-24 rounded border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      type="number"
                      min="0"
                      defaultValue={product.reorder_threshold}
                      onBlur={(e) => void saveThreshold(product, e.target.value)}
                      aria-label={`Reorder threshold for ${product.name}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="rounded border px-3 py-1 text-xs font-semibold hover:bg-gray-50 active:scale-95 transition-transform"
                      onClick={() => { setSelected(product); setModal('stock') }}
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Result count */}
      {!loading && search && (
        <p className="text-xs text-slate-400">
          {filtered.length} of {products.length} products
        </p>
      )}

      {/* Modals */}
      {modal === 'product' && (
        <ProductModal onClose={() => setModal(null)} onSaved={refresh} />
      )}
      {modal === 'stock' && selected && (
        <StockModal
          product={selected}
          onClose={() => { setModal(null); setSelected(null) }}
          onSaved={refresh}
        />
      )}
    </section>
  )
}
