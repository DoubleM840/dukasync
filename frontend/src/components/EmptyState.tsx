/**
 * EmptyState — rich empty state with optional illustration slot.
 *
 * Usage:
 *   <EmptyState title="No products yet" description="Add your first product.">
 *     <EmptyInventoryIllustration />
 *   </EmptyState>
 *
 * Without children it falls back to a simple icon-free text block
 * (backward-compatible with existing call-sites).
 */
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  children?: ReactNode  // illustration slot
}

export default function EmptyState({ title, description, action, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      {children && (
        <div className="mb-5 opacity-90" aria-hidden="true">
          {children}
        </div>
      )}
      <p className="text-base font-semibold text-slate-800">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
