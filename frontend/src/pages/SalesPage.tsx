import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { createSale, listInventory } from '../services/api'
import type { Product } from '../types/api'
import toast from 'react-hot-toast'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'

export default function SalesPage() {
  const { user } = useAuth()
  const shopId = user?.shop_id
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function refreshInventory() {
    if (!shopId) return
    setLoading(true)
    try {
      const { data } = await listInventory(shopId)
      setProducts(data)
      setSelectedProduct((current) => current ? data.find((product) => product.id === current.id) ?? null : null)
    } catch {
      setError('Unable to load inventory.')
      toast.error('Unable to load inventory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void refreshInventory() }, [shopId])

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return products
    return products.filter((product) =>
      product.name.toLowerCase().includes(term) || (product.sku ?? '').toLowerCase().includes(term),
    )
  }, [products, search])

  const exceedsStock = Boolean(selectedProduct && quantity > selectedProduct.quantity_in_stock)
  const total = selectedProduct ? quantity * Number(selectedProduct.unit_price) : 0

  function selectProduct(product: Product) {
    setSelectedProduct(product)
    setQuantity(1)
    setError('')
    setSuccess('')
  }

  async function submitSale(event: FormEvent) {
    event.preventDefault()
    if (!shopId || !selectedProduct || exceedsStock || quantity < 1) return
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await createSale({
        shop_id: shopId,
        product_id: selectedProduct.id,
        quantity_sold: quantity,
        sale_price: total,
      })
      setSuccess(`${selectedProduct.name} sale recorded successfully.`)
      toast.success('Sale recorded')
      setSelectedProduct(null)
      setQuantity(1)
      await refreshInventory()
    } catch {
      setError('Unable to record sale. Please try again.')
      toast.error('Unable to record sale')
    } finally {
      setSubmitting(false)
    }
  }

  if (!shopId) return <p className="text-red-600">Your account is not linked to a shop.</p>

  return (
    <section aria-labelledby="sales-heading" className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Point of sale</p>
        <h2 id="sales-heading" className="mt-1 text-3xl font-bold text-gray-900">Log a sale</h2>
        <p className="mt-2 text-gray-600">Choose a product, enter the quantity, and confirm the total.</p>
      </div>

      {success && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">{success}</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-4">
            <label className="sr-only" htmlFor="product-search">Search products</label>
            <input id="product-search" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2" placeholder="Search by name or SKU" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          {loading ? <LoadingSkeleton rows={5} /> : filteredProducts.length === 0 ? <EmptyState title="No matching products" description="Try another search or add inventory first." /> : <ul className="divide-y divide-gray-100" aria-label="Shop products">
            {filteredProducts.map((product) => <li key={product.id}>
              <button type="button" onClick={() => selectProduct(product)} className={`flex w-full items-center justify-between px-4 py-4 text-left hover:bg-indigo-50 ${selectedProduct?.id === product.id ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-500' : ''}`}>
                <span><span className="block font-semibold text-gray-900">{product.name}</span><span className="mt-1 block text-xs text-gray-500">SKU: {product.sku ?? 'Not assigned'}</span></span>
                <span className={`text-right ${product.quantity_in_stock <= product.reorder_threshold ? 'text-red-600' : 'text-gray-700'}`}><span className="block text-lg font-bold">{product.quantity_in_stock}</span><span className="block text-xs">in stock</span></span>
              </button>
            </li>)}
          </ul>}
        </div>

        <form onSubmit={submitSale} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Sale details</h3>
          {!selectedProduct ? <p className="mt-6 text-sm text-gray-500">Select a product to begin.</p> : <div className="mt-5 space-y-5">
            <div><p className="font-semibold text-gray-900">{selectedProduct.name}</p><p className="text-sm text-gray-500">KES {Number(selectedProduct.unit_price).toLocaleString('en-KE', { minimumFractionDigits: 2 })} each</p></div>
            <div><label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="sale-quantity">Quantity</label><input id="sale-quantity" className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none ring-indigo-500 focus:ring-2" type="number" min="1" max={selectedProduct.quantity_in_stock} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} /></div>
            <p className="text-sm text-gray-500">Available: {selectedProduct.quantity_in_stock}</p>
            {exceedsStock && <p className="text-sm font-medium text-red-600" role="alert">Quantity exceeds available stock.</p>}
            <div className="border-t border-gray-200 pt-4"><div className="flex items-center justify-between text-lg font-bold text-gray-900"><span>Total</span><span>KES {total.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span></div><button className="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 active:scale-95 transition-transform disabled:cursor-not-allowed disabled:opacity-50" disabled={submitting || exceedsStock || quantity < 1} type="submit">{submitting ? 'Recording...' : 'Record sale'}</button></div>
          </div>}
        </form>
      </div>
    </section>
  )
}
