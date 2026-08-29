/**
 * LoadingSkeleton — stacked pulsing bars for table / list loading states.
 * Variable widths give a natural, content-like feel.
 */
interface LoadingSkeletonProps {
  rows?: number
  className?: string
}

const BAR_WIDTHS = ['w-full', 'w-11/12', 'w-full', 'w-10/12', 'w-full', 'w-11/12', 'w-9/12']

export default function LoadingSkeleton({ rows = 4, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 p-4 ${className}`} role="status" aria-label="Loading">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className={`h-10 animate-pulse rounded-lg bg-board-green/10 ${BAR_WIDTHS[index % BAR_WIDTHS.length]}`}
        />
      ))}
    </div>
  )
}
