import { useState, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HeroContent } from '../ui/HeroContent'
import { Section, Container, Reveal } from '../ui'
import { usePageMeta } from '../../utils/usePageMeta'
import { SearchBar } from './SearchBar'
import { FilterSidebar } from './FilterSidebar'
import { FilterDrawer } from './FilterDrawer'
import { ActiveFilterChips } from './ActiveFilterChips'
import { JobCardGrid } from './JobCardGrid'
import { Button } from '../ui/Button'
import { useInfiniteJobs } from '../../hooks/useJobs'
import { useJobFacets } from '../../hooks/useJobFacets'
import type { InfiniteJobsParams } from '../../hooks/useJobs'

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'relevance', label: 'Best Match' },
  { value: 'salary_high', label: 'Highest Salary' },
  { value: 'salary_low', label: 'Lowest Salary' },
  { value: 'remote_first', label: 'Remote First' },
] as const

const SORT_VALUES: readonly string[] = SORT_OPTIONS.map((option) => option.value)

type JobSort = NonNullable<InfiniteJobsParams['sort']>

function SortSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex items-center justify-end mb-4">
      <label className="flex items-center gap-2 text-sm text-ink-muted">
        <span>Sort by</span>
        <select
          aria-label="Sort jobs"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-md border border-hairline bg-surface-1 text-ink px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

export default function JobBoardPage() {
  const meta = usePageMeta({ title: 'Jobs | HireHub Community', description: 'Browse thousands of curated job listings from top companies.' })

  const [searchParams, setSearchParams] = useSearchParams()
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  const search = searchParams.get('search') ?? ''
  const location = searchParams.get('location') ?? ''
  const category = searchParams.get('category') ?? ''
  const seniority = searchParams.get('seniority') ?? ''
  const remote = searchParams.get('remote') ?? ''
  const sortParam = searchParams.get('sort') ?? 'recent'
  const sort: JobSort = SORT_VALUES.includes(sortParam)
    ? (sortParam as JobSort)
    : 'recent'

  const handleParamChange = useCallback(
    (key: string, value: string, replace = false) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value) next.set(key, value)
          else next.delete(key)
          return next
        },
        { replace },
      )
    },
    [setSearchParams],
  )

  const handleSearchChange = useCallback(
    (value: string) => handleParamChange('search', value, true),
    [handleParamChange],
  )
  const handleLocationChange = useCallback(
    (value: string) => handleParamChange('location', value, true),
    [handleParamChange],
  )
  const handleFilterChange = useCallback(
    (key: string, value: string) => handleParamChange(key, value),
    [handleParamChange],
  )
  const handleSortChange = useCallback(
    (value: string) => handleParamChange('sort', value),
    [handleParamChange],
  )

  const filters = { category, seniority, location, remote }

  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteJobs({ search, location, category, seniority, remote, sort })

  const { data: facets } = useJobFacets()

  const allJobs = useMemo(() => data?.jobs ?? [], [data])
  const total = data?.total ?? 0

  const activeFilterCount = [category, seniority, location, remote].filter(Boolean).length
  const hasMore = !!hasNextPage && allJobs.length < total

  return (
    <>
      {meta}
      <Section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]">
          <img src="/featured-jobs.png" alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <Container className="relative">
          <HeroContent variant="card" className="mb-8">
            <h1 className="text-[40px] leading-[1.15] tracking-[-0.8px] font-medium">Job Board</h1>
            <p className="text-lg text-ink-muted mt-2">Explore opportunities from top companies</p>
          </HeroContent>

          {/* Mobile: search + filter trigger */}
          <div className="lg:hidden flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1">
              <SearchBar
                value={search}
                onChange={handleSearchChange}
                locationValue={location}
                onLocationChange={handleLocationChange}
              />
            </div>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setFilterDrawerOpen(true)}
              className="shrink-0 self-start"
            >
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Button>
          </div>

          {/* Desktop: search bar */}
          <Reveal className="hidden lg:block max-w-xl mb-8">
            <SearchBar
              value={search}
              onChange={handleSearchChange}
              locationValue={location}
              onLocationChange={handleLocationChange}
            />
          </Reveal>

          {/* Mobile: active filter chips */}
          <div className="lg:hidden">
            <ActiveFilterChips filters={filters} onFilterChange={handleFilterChange} />
          </div>

          {/* Filter drawer for mobile */}
          <FilterDrawer
            open={filterDrawerOpen}
            onOpenChange={setFilterDrawerOpen}
            filters={filters}
            onFilterChange={handleFilterChange}
            activeCount={activeFilterCount}
            facets={facets}
          />

          {isLoading ? (
            <div className="text-center py-16">
              <p className="text-ink-muted">Loading jobs...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-16">
              <p className="text-error mb-4">{error instanceof Error ? error.message : 'Failed to load jobs'}</p>
              <Button variant="primary" size="sm" onClick={() => refetch()}>Try again</Button>
            </div>
          ) : (
            <>
              <div className="hidden lg:grid grid-cols-[280px_1fr] gap-8">
                <Reveal delay={0.05}><FilterSidebar filters={filters} onFilterChange={handleFilterChange} facets={facets} /></Reveal>
                <Reveal delay={0.1}>
                  <SortSelect value={sort} onChange={handleSortChange} />
                  <JobCardGrid jobs={allJobs} />
                  {hasMore && (
                    <div className="mt-8 text-center">
                      <Button variant="ghost" size="md" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                        {isFetchingNextPage ? 'Loading more...' : `Load more (${allJobs.length} of ${total})`}
                      </Button>
                    </div>
                  )}
                </Reveal>
              </div>

              {/* Mobile: jobs grid without sidebar */}
              <div className="lg:hidden">
                <SortSelect value={sort} onChange={handleSortChange} />
                <JobCardGrid jobs={allJobs} />
                {hasMore && (
                  <div className="mt-8 text-center">
                    <Button variant="ghost" size="md" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                      {isFetchingNextPage ? 'Loading more...' : `Load more (${allJobs.length} of ${total})`}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </Container>
      </Section>
    </>
  )
}
