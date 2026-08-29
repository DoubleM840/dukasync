/**
 * QuickSaleModal — overlay modal to log a sale in <3 s.
 *
 * Animations:
 * - Backdrop: fade in/out
 * - Modal card: spring scale (0.92→1) + fade, exits in reverse
 * - On success: canvas-confetti burst fires over the modal
 *
 * Opened by: FAB button in Shell OR Ctrl+K / Cmd+K keyboard shortcut.
 */
import { AnimatePresence, motion } from 'framer-motion'
import { X, ShoppingCart } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import confetti from 'canvas-confetti'
import toast from 'react-hot-toast'
import { createSale, listInventory } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import type { Product } from '../types/api'

interface QuickSaleModalProps {
  open: boolean
  onClose: () => void
}

function fireConfetti() {
  // Two bursts from opposite corners for a joyful feel
  void confetti({
    particleCount: 80,
    spread: 60,
    origin: { x: 0.35, y: 0.55 },
    colors: ['#4F46E5', '#10B981', '#F59E0B', '#F43F5E', '#0EA5E9'],
    zIndex: 9999,
  })
  void confetti({
    particleCount: 60,
    spread: 50,
    origin: { x: 0.65, y: 0.55 },
    colors: ['#4F46E5', '#10B981', '#F59E0B', '#F43F5E', '#0EA5E9'],
    zIndex: 9999,
  })
}

export default function QuickSaleModal({ open, onClose }: QuickSaleModalProps) {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)

  const product = products.find((item) => item.id === Number(productId))

  useEffect(() => {
    if (open && user?.shop_id) {
      void listInventory(user.shop_id)
        .then(({ data }) => setProducts(data))
        .catch(() => toast.error('Unable to load inventory'))
    }
    if (open) {
      setProductId('')
      setQuantity(1)
    }
  }, [open, user?.shop_id])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!user?.shop_id || !product || quantity > product.quantity_in_stock) return
    setLoading(true)
    try {
      await createSale({
        shop_id: user.shop_id,
        product_id: product.id,
        quantity_sold: quantity,
        sale_price: quantity * Number(product.unit_price),
      })
      // fire confetti BEFORE closing so it's visible
      fireConfetti()
      toast.success('Sale recorded! 🎉')
      // small delay so confetti has a moment on screen before modal closes
      setTimeout(onClose, 520)
    } catch {
      toast.error('Unable to record sale')
    } finally {
      setLoading(false)
    }
  }

  const exceedsStock = Boolean(product && quantity > product.quantity_in_stock)
  const total = product ? quantity * Number(product.unit_price) : 0

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-modal="true"
          aria-label="Quick sale"
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.form
            onSubmit={submit}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            {/* coloured header band */}
            <div className="flex items-center justify-between bg-board-green px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <ShoppingCart size={18} className="text-chalk" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-chalk">Quick sale</h2>
                  <p className="text-[11px] text-chalk/60">Ctrl+K · Esc to close</p>
                </div>
              </div>
              <motion.button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-chalk/60 hover:bg-white/10 hover:text-chalk"
                whileTap={{ scale: 0.9 }}
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* body */}
            <div className="space-y-4 p-6">
              {/* product select */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Product
                </label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={productId}
                  onChange={(e) => { setProductId(e.target.value); setQuantity(1) }}
                  required
                >
                  <option value="">Select product…</option>
                  {products.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {item.quantity_in_stock} in stock
                    </option>
                  ))}
                </select>
              </div>

              {/* quantity */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Quantity
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  type="number"
                  min="1"
                  max={product?.quantity_in_stock ?? undefined}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  required
                />
              </div>

              {/* total preview */}
              {product && (
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
                  <span className="text-sm text-emerald-700">Total</span>
                  <motion.span
                    key={total}
                    className="text-lg font-bold text-emerald-800"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    KES {total.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </motion.span>
                </div>
              )}

              {exceedsStock && (
                <p className="text-sm font-medium text-red-600" role="alert">
                  Quantity exceeds available stock ({product?.quantity_in_stock}).
                </p>
              )}

              {/* submit */}
              <motion.button
                className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading || !product || exceedsStock}
                type="submit"
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                {loading ? 'Recording…' : 'Record sale'}
              </motion.button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
