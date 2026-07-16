import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { HeroContent } from '../ui/HeroContent'
import { Section, Container, Reveal } from '../ui'
import { usePageMeta } from '../../utils/usePageMeta'
import { SearchBar } from './SearchBar'
import { FilterSidebar } from './FilterSidebar'
import { JobCardGrid } from './JobCardGrid'
import { Button } from '../ui/Button'
import { listJobs } from '../../api/jobs'
import type { Job } from '../../data/jobs'

const PAGE_SIZE = 12

export default function JobBoardPage() {
  const meta = usePageMeta({ title: 'Jobs | HireHub Community', description: 'Browse thousands of curated job listings from top companies.' })

  const [allJobs, setAllJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [cursor, setCursor] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ category: '', seniority: '', remote: '' })

  const searchRef = useRef(search)
  const filtersRef = useRef(filters)
  const cursorRef = useRef(cursor)

  useEffect(() => { searchRef.current = search }, [search])
  useEffect(() => { filtersRef.current = filters }, [filters])
  useEffect(() => { cursorRef.current = cursor }, [cursor])

  const loadJobs = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true)
      setError('')
    } else {
      setLoadingMore(true)
    }

    try {
      const params: Record<string, string | number> = { take: PAGE_SIZE }
      if (!reset && cursorRef.current) params.cursor = cursorRef.current
      if (searchRef.current) params.search = searchRef.current
      if (filtersRef.current.category) params.category = filtersRef.current.category
      if (filtersRef.current.seniority) params.seniority = filtersRef.current.seniority

      const res = await listJobs(params as any)
      setAllJobs(prev => reset ? res.data : [...prev, ...res.data])
      setCursor(res.pagination?.cursor ?? null)
      setTotal(res.pagination?.total ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    loadJobs(true)
  }, [search, filters, loadJobs])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
  }

  const filteredJobs = useMemo(() => {
    if (!filters.remote) return allJobs
    return allJobs.filter((job) => {
      if (filters.remote === 'Remote') return job.remote === true
      if (filters.remote === 'On-site') return job.remote === false
      if (filters.remote === 'Hybrid') return job.location?.toLowerCase().includes('hybrid')
      return true
    })
  }, [filters.remote, allJobs])

  const hasMore = cursor !== null && allJobs.length < total

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

          <Reveal className="max-w-xl mb-8">
            <SearchBar value={search} onChange={handleSearchChange} />
          </Reveal>

          {loading ? (
            <div className="text-center py-16">
              <p className="text-ink-muted">Loading jobs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-error mb-4">{error}</p>
              <Button variant="primary" size="sm" onClick={() => loadJobs(true)}>Try again</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
              <Reveal delay={0.05}><FilterSidebar filters={filters} onFilterChange={handleFilterChange} /></Reveal>
              <Reveal delay={0.1}>
                <JobCardGrid jobs={filteredJobs} />
                {hasMore && (
                  <div className="mt-8 text-center">
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => loadJobs(false)}
                      disabled={loadingMore}
                    >
                      {loadingMore ? 'Loading more...' : `Load more (${filteredJobs.length} of ${total})`}
                    </Button>
                  </div>
                )}
              </Reveal>
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
