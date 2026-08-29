/**
 * SkeletonCard — animated placeholder for StatCard during data loading.
 * Uses a shimmer pulse to signal activity without blank white space.
 */
export default function SkeletonCard() {
  return (
    <div
      className="animate-pulse rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
      role="status"
      aria-label="Loading"
    >
      {/* icon + trend row */}
      <div className="flex items-start justify-between">
        <div className="h-9 w-9 rounded-xl bg-slate-200" />
        <div className="h-5 w-20 rounded-full bg-slate-200" />
      </div>
      {/* label */}
      <div className="mt-5 h-2.5 w-24 rounded-full bg-slate-200" />
      {/* value */}
      <div className="mt-3 h-9 w-36 rounded-full bg-slate-200" />
      {/* detail */}
      <div className="mt-4 h-2.5 w-28 rounded-full bg-slate-200" />
    </div>
  )
}
