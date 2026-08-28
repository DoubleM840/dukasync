interface LoadingSkeletonProps {
  rows?: number
  className?: string
}

export default function LoadingSkeleton({ rows = 4, className = '' }: LoadingSkeletonProps) {
  return <div className={`space-y-3 p-4 ${className}`} role="status" aria-label="Loading"><span className="sr-only">Loading</span>{Array.from({ length: rows }, (_, index) => <div key={index} className="h-10 animate-pulse rounded bg-board-green/10" />)}</div>
}
