import { Skeleton } from './Skeleton'

export function SkeletonCard() {
  return (
    <div className="bg-surface-1 rounded-lg border border-hairline p-6 space-y-4" aria-hidden="true">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width="44px" height="44px" />
        <div className="space-y-2 flex-1">
          <Skeleton width="60%" />
          <Skeleton width="40%" />
        </div>
      </div>
      <Skeleton width="80%" />
      <Skeleton />
      <div className="flex gap-2 pt-2">
        <Skeleton width="70px" height="24px" />
        <Skeleton width="80px" height="24px" />
      </div>
    </div>
  )
}
