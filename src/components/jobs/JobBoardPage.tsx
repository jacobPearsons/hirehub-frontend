import { useState, useMemo } from 'react'
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

export default function JobBoardPage() {
  const meta = usePageMeta({ title: 'Jobs | HireHub Community', description: 'Browse thousands of curated job listings from top companies.' })

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ category: '', seniority: '', remote: '' })
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteJobs({ search, category: filters.category, seniority: filters.seniority })

  const allJobs = data?.jobs ?? []
  const total = data?.total ?? 0

  const activeFilterCount = [filters.category, filters.seniority, filters.remote].filter(Boolean).length

  const filteredJobs = useMemo(() => {
    if (!filters.remote) return allJobs
    return allJobs.filter((job) => {
      if (filters.remote === 'Remote') return job.remote === true
      if (filters.remote === 'On-site') return job.remote === false
      if (filters.remote === 'Hybrid') return job.location?.toLowerCase().includes('hybrid')
      return true
    })
  }, [filters.remote, allJobs])

  const hasMore = !!hasNextPage && allJobs.length < total

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
  }

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
          <div className="lg:hidden flex gap-3 mb-4">
            <div className="flex-1">
              <SearchBar value={search} onChange={handleSearchChange} />
            </div>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setFilterDrawerOpen(true)}
              className="shrink-0"
            >
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Button>
          </div>

          {/* Desktop: search bar */}
          <Reveal className="hidden lg:block max-w-xl mb-8">
            <SearchBar value={search} onChange={handleSearchChange} />
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
                <Reveal delay={0.05}><FilterSidebar filters={filters} onFilterChange={handleFilterChange} /></Reveal>
                <Reveal delay={0.1}>
                  <JobCardGrid jobs={filteredJobs} />
                  {hasMore && (
                    <div className="mt-8 text-center">
                      <Button variant="ghost" size="md" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                        {isFetchingNextPage ? 'Loading more...' : `Load more (${filteredJobs.length} of ${total})`}
                      </Button>
                    </div>
                  )}
                </Reveal>
              </div>

              {/* Mobile: jobs grid without sidebar */}
              <div className="lg:hidden">
                <JobCardGrid jobs={filteredJobs} />
                {hasMore && (
                  <div className="mt-8 text-center">
                    <Button variant="ghost" size="md" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                      {isFetchingNextPage ? 'Loading more...' : `Load more (${filteredJobs.length} of ${total})`}
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
