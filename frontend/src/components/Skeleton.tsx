interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse rounded-lg bg-navy-700 ${className}`} />
  )
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`rounded-xl border border-navy-700 bg-navy-800 p-5 ${className}`}>
      <Skeleton className="h-3 w-1/3 mb-3" />
      <Skeleton className="h-6 w-1/2 mb-2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

export function SkeletonStat() {
  return (
    <div className="stat-card">
      <Skeleton className="h-4 w-4 rounded-full" />
      <Skeleton className="h-8 w-10 mt-1" />
      <Skeleton className="h-3 w-16 mt-1" />
    </div>
  )
}

export function SkeletonEntry() {
  return (
    <div className="rounded-xl border border-navy-700 bg-navy-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-navy-700/60">
        <Skeleton className="h-3 w-40" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-5" />
        </div>
      </div>
      <div className="px-4 py-3 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  )
}

export function SkeletonCheckinItem() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-navy-700 bg-navy-800">
      <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-2.5 w-24" />
      </div>
      <Skeleton className="h-3 w-10" />
    </div>
  )
}
