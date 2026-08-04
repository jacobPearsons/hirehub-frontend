import { Skeleton } from '../ui/Skeleton'

export function BlogSkeletonGrid() {
  return (
    <div role="status" aria-label="Loading blog posts..." className="space-y-6">
      <div className="flex flex-col md:flex-row bg-surface-1 rounded-lg border border-hairline overflow-hidden">
        <div className="w-full md:w-1/2">
          <Skeleton variant="rectangular" className="w-full h-64 md:h-80" />
        </div>
        <div className="p-8 md:p-10 flex-1 space-y-4">
          <Skeleton width="72px" height="24px" />
          <Skeleton width="80%" height="28px" />
          <Skeleton width="55%" height="28px" />
          <Skeleton />
          <Skeleton width="80%" />
          <div className="flex items-center gap-2 pt-2">
            <Skeleton variant="circular" width="32px" height="32px" />
            <div className="space-y-2 flex-1">
              <Skeleton width="40%" />
              <Skeleton width="60%" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface-1 rounded-lg border border-hairline overflow-hidden">
            <Skeleton variant="rectangular" className="w-full h-48" />
            <div className="p-5 space-y-3">
              <Skeleton width="72px" height="24px" />
              <Skeleton width="90%" height="22px" />
              <Skeleton width="60%" height="22px" />
              <Skeleton />
              <Skeleton width="85%" />
              <div className="flex items-center gap-2 pt-1">
                <Skeleton variant="circular" width="32px" height="32px" />
                <div className="space-y-2 flex-1">
                  <Skeleton width="40%" />
                  <Skeleton width="60%" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function BlogPostSkeleton() {
  return (
    <div role="status" aria-label="Loading blog post..." className="max-w-3xl mx-auto space-y-6">
      <Skeleton variant="rectangular" className="w-full h-72 md:h-96" />
      <Skeleton width="80px" height="26px" />
      <Skeleton width="85%" height="40px" />
      <Skeleton width="55%" height="40px" />
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width="40px" height="40px" />
        <div className="space-y-2 flex-1">
          <Skeleton width="40%" />
          <Skeleton width="60%" />
        </div>
      </div>
      <div className="space-y-3 pt-2">
        <Skeleton />
        <Skeleton />
        <Skeleton width="90%" />
        <Skeleton width="95%" />
        <Skeleton width="70%" />
      </div>
    </div>
  )
}
