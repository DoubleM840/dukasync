/**
 * LowStockAlert.jsx
 * Polls the low-stock endpoint and renders a dismissible alert banner
 * for each product at or below its reorder threshold.
 */
import { useEffect, useState } from 'react'
import { getLowStockProducts } from '../api/client'
import toast from 'react-hot-toast'

export default function LowStockAlert() {
  const [alerts, setAlerts] = useState([])
  const [dismissed, setDismissed] = useState(new Set())

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data } = await getLowStockProducts()
        setAlerts(data)
      } catch (err) {
        console.error('Failed to fetch low-stock alerts', err)
        toast.error('Unable to load low-stock alerts')
      }
    }

    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30_000) // poll every 30s
    return () => clearInterval(interval)
  }, [])

  const visible = alerts.filter((a) => !dismissed.has(a.product_id))

  if (visible.length === 0) return null

  return (
    <div className="space-y-2 mb-6" role="alert" aria-live="polite">
      {visible.map((alert) => (
        <div
          key={alert.product_id}
          className="flex items-start justify-between gap-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          <div>
            <span className="font-semibold">Low Stock: </span>
            <span>
              {alert.product_name}
              {alert.sku ? ` (${alert.sku})` : ''} — {alert.quantity_in_stock}{' '}
              remaining (threshold: {alert.reorder_threshold})
            </span>
          </div>
          <button
            onClick={() => setDismissed((prev) => new Set(prev).add(alert.product_id))}
            className="shrink-0 text-amber-600 hover:text-amber-900 font-bold"
            aria-label={`Dismiss alert for ${alert.product_name}`}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
