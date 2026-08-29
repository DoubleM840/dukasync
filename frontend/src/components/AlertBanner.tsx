/**
 * AlertBanner — horizontal scrollable carousel of low-stock product cards.
 *
 * Each card shows:
 *   • Product thumbnail (placehold.co placeholder with SKU/initials)
 *   • Product name + SKU
 *   • Colour-coded stock bar (red <5, amber 5-10, green >10)
 *   • Dismiss × and Restock → buttons
 *
 * Mobile: same horizontal scroll, cards shrink gracefully.
 * Screen-reader: role="list" with descriptive aria-labels per card.
 */
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, ArrowRight, X } from 'lucide-react'
import type { Product } from '../types/api'

interface AlertBannerProps {
  products: Product[]
  onDismiss: (productId: number) => void
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function stockTone(qty: number): 'red' | 'amber' | 'green' {
  if (qty < 5) return 'red'
  if (qty <= 10) return 'amber'
  return 'green'
}

const barColor = { red: 'bg-red-500', amber: 'bg-amber-400', green: 'bg-emerald-500' }
const textColor = { red: 'text-red-600', amber: 'text-amber-600', green: 'text-emerald-600' }
const badgeBg = {
  red: 'bg-red-50 text-red-700 border-red-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

/** Generate a placehold.co URL sized 48×48 with the product's initials */
function thumbnailUrl(product: Product): string {
  const text = encodeURIComponent(
    product.sku
      ? product.sku.slice(0, 4).toUpperCase()
      : product.name.slice(0, 2).toUpperCase(),
  )
  return `https://placehold.co/48x48/e2e8f0/64748b?text=${text}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AlertBanner({ products, onDismiss }: AlertBannerProps) {
  if (products.length === 0) return null

  return (
    <div
      className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 shadow-sm backdrop-blur"
      role="region"
      aria-label="Low stock alerts"
    >
      {/* header row */}
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-900">
          Stock watch · {products.length} item{products.length !== 1 ? 's' : ''} need attention
        </span>
      </div>

      {/* scrollable cards row */}
      <div
        className="flex gap-3 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]"
        role="list"
        aria-label="Low stock product list"
        style={{ scrollbarWidth: 'none' }}
      >
        <AnimatePresence initial={false}>
          {products.map((product) => {
            const tone = stockTone(product.quantity_in_stock)
            const maxForBar = Math.max(product.reorder_threshold * 2, 20)
            const barPct = Math.min(
              (product.quantity_in_stock / maxForBar) * 100,
              100,
            )

            return (
              <motion.div
                key={product.id}
                role="listitem"
                aria-label={`${product.name}: ${product.quantity_in_stock} units remaining`}
                className="flex min-w-[220px] max-w-[240px] flex-shrink-0 items-center gap-3 rounded-xl border border-amber-200/60 bg-white/90 p-3 shadow-sm"
                initial={{ opacity: 0, scale: 0.9, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.85, x: -10 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                layout
              >
                {/* thumbnail */}
                <img
                  src={thumbnailUrl(product)}
                  alt={`Product thumbnail for ${product.name}`}
                  width={48}
                  height={48}
                  loading="lazy"
                  className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                />

                {/* info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-900">{product.name}</p>
                  {product.sku && (
                    <p className="font-mono text-[10px] text-slate-400">{product.sku}</p>
                  )}
                  {/* stock bar */}
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-1.5 rounded-full transition-all ${barColor[tone]}`}
                        style={{ width: `${Math.max(barPct, 4)}%` }}
                        role="progressbar"
                        aria-valuenow={product.quantity_in_stock}
                        aria-valuemin={0}
                        aria-valuemax={maxForBar}
                        aria-label={`Stock level: ${product.quantity_in_stock}`}
                      />
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${textColor[tone]}`}>
                      {product.quantity_in_stock}
                    </span>
                  </div>
                  {/* badge */}
                  <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase ${badgeBg[tone]}`}>
                    {tone === 'red' ? 'Critical' : tone === 'amber' ? 'Low' : 'Watch'}
                  </span>
                </div>

                {/* actions */}
                <div className="flex flex-shrink-0 flex-col items-center gap-1.5">
                  <a
                    href="/restock-orders"
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm transition-transform hover:-translate-y-0.5 active:scale-95"
                    aria-label={`Restock ${product.name}`}
                    title="Restock"
                  >
                    <ArrowRight size={13} />
                  </a>
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:scale-95"
                    onClick={() => onDismiss(product.id)}
                    aria-label={`Dismiss alert for ${product.name}`}
                    title="Dismiss"
                  >
                    <X size={13} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
