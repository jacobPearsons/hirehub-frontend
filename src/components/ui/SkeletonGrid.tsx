import { SkeletonCard } from './SkeletonCard'

interface SkeletonGridProps {
  count?: number
  columns?: 2 | 3
}

export function SkeletonGrid({ count = 6, columns = 3 }: SkeletonGridProps) {
  return (
    <div
      className={`grid gap-6 ${columns === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}
      aria-label="Loading..."
      role="status"
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
