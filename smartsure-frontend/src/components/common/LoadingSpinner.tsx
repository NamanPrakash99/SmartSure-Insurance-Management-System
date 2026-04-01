export function LoadingSpinner({ center = true }) {
  const spinner = (
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-[3px] border-surface-200 dark:border-surface-700"></div>
      <div className="absolute inset-0 rounded-full border-[3px] border-primary-500 border-t-transparent animate-spin"></div>
    </div>
  )

  if (center) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 animate-fade-in">
        {spinner}
        <p className="text-xs font-semibold text-surface-400 uppercase tracking-widest">Loading...</p>
      </div>
    )
  }

  return spinner
}

/** Skeleton block for content loading */
export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />
}

/** Skeleton row for table loading */
export function SkeletonRow({ cols = 5 }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded-lg w-3/4" />
        </td>
      ))}
    </tr>
  )
}

/** Stats card skeleton */
export function StatsSkeleton() {
  return (
    <div className="card p-5 h-32 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-3 w-24 bg-surface-200 dark:bg-surface-700 rounded" />
          <div className="h-7 w-16 bg-surface-200 dark:bg-surface-700 rounded" />
        </div>
        <div className="w-10 h-10 bg-surface-200 dark:bg-surface-700 rounded-xl" />
      </div>
    </div>
  )
}
