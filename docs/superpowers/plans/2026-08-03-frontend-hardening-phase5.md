# TanStack Query Adoption (Frontend Hardening — Phase 5) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert every read-only data-fetching page/component in the HireHub frontend from manual `useEffect` + `apiX()` calls to the existing (and new) TanStack Query hooks, so server state is cached, deduplicated, and refetch-aware — completing Step 4 of Phase 5 in `docs/exec-plans/active/frontend-hardening.md`.

**Architecture:** The API modules (`src/api/*`) already return a `{ success, data, pagination? }` envelope. Query hooks expose the envelope's `data` payload to components via `select` (cache keeps the envelope so `prefetchQuery` in `JobCard`/`BlogCard` stays consistent). The cursor-paginated job board uses `useInfiniteQuery` (replacing the fragile ref-based `loadJobs` callback). Pages keep their exact rendered JSX; only data-fetching internals change.

**Tech Stack:** React 19, Vite 6, TypeScript strict, TanStack Query v5.101 (`@tanstack/react-query`), Vitest + Testing Library (jsdom), Bun. No new runtime dependencies.

## Global Constraints

- **No new runtime dependencies.** Dev-only tools via `npx` only.
- **Preserve all visible UI and copy.** These tasks replace data fetching only — headings, text, buttons, layout, and states stay byte-for-byte identical.
- **Unwrap envelopes with `select`** (`select: (data) => data.data`). Do NOT unwrap in `queryFn`: `JobCard.tsx` and `BlogCard.tsx` prefetch the raw envelope into the same cache keys (`['job', id]`, `['blogPost', slug]`), and the cache shape must stay the envelope.
- **Job board remote filter stays client-side.** Do not send `remote` to the API (the current page never did); keep the `filteredJobs` memo.
- **Tests:** Vitest + jsdom. Every converted component test must wrap the component in `QueryClientProvider` with `retry: false`. API mocks resolve the real envelope shape (`{ data, pagination? }`), never a bare array/object — except where the module under test is a hook whose API mock resolves envelopes too.
- **Validation after every task:** `bun run test:run` (must be fully green), `bun run lint`, `bun run build` (runs `tsc -b && vite build`).
- **Commit after every task.** Conventional-commit style, e.g. `refactor(jobs): ...`. Stay on branch `feat/onboarding-wizard`. Do not modify files outside the listed paths.
- Empty string params must not be sent to the API — the `src/api` modules already skip falsy values; keep passing `''`/`undefined` defaults.

## File Structure

Files to **create**:

- `src/hooks/__tests__/useBlogPosts.test.tsx`
- `src/hooks/__tests__/useBlogPost.test.tsx`
- `src/hooks/__tests__/useInfiniteJobs.test.tsx`
- `src/hooks/__tests__/useEmployerJobsQuery.test.tsx`
- `src/hooks/__tests__/useCandidateProfileQuery.test.tsx`
- `src/hooks/useEmployerJobsQuery.ts`
- `src/hooks/useCandidateProfileQuery.ts`
- `src/components/blog/__tests__/BlogPostPage.test.tsx`
- `src/components/dashboard/__tests__/ApplicationsTab.test.tsx`
- `src/components/dashboard/__tests__/SavedJobsTab.test.tsx`
- `src/components/home/__tests__/FeaturedJobs.test.tsx`
- `src/components/employer-dashboard/__tests__/JobListingsTab.test.tsx`
- `src/components/employer-dashboard/__tests__/ApplicantsTab.test.tsx`
- `src/components/candidate/__tests__/CandidateDetailDrawer.test.tsx`

Files to **modify**:

- `src/hooks/useJobs.ts` — add `select`, add `useInfiniteJobs`
- `src/hooks/useJob.ts` — add `select`
- `src/hooks/useBlogPosts.ts` — add `select`
- `src/hooks/useBlogPost.ts` — add `select`
- `src/hooks/__tests__/useJobs.test.tsx` — envelope mocks
- `src/hooks/__tests__/useJob.test.tsx` — envelope mocks
- `src/components/jobs/JobBoardPage.tsx` — rewrite fetch layer to `useInfiniteJobs`
- `src/components/jobs/__tests__/JobBoardPage.test.tsx` — add load-more test
- `src/components/jobs/JobDetailPage.tsx` — `useJob` + skeleton
- `src/components/jobs/__tests__/JobDetailPage.test.tsx` — `QueryClientProvider` wrapper + skeleton assertion
- `src/components/blog/BlogPage.tsx` — `useBlogPosts`
- `src/components/blog/__tests__/BlogPage.test.tsx` — `QueryClientProvider` wrapper
- `src/components/blog/BlogPostPage.tsx` — `useBlogPost`
- `src/components/dashboard/ApplicationsTab.tsx` — `useApplicationsQuery` + `setQueryData` optimistic update
- `src/components/dashboard/SavedJobsTab.tsx` — `useSavedJobsQuery` + invalidate-on-savedJobIds
- `src/components/home/FeaturedJobs.tsx` — `useJobs`
- `src/components/employer-dashboard/JobListingsTab.tsx` — `useEmployerJobsQuery`
- `src/components/employer-dashboard/ApplicantsTab.tsx` — `useEmployerJobsQuery`
- `src/components/candidate/CandidateDetailDrawer.tsx` — `useCandidateProfileQuery`
- `docs/exec-plans/active/frontend-hardening.md` — Phase 5 progress log
- `.superpowers/sdd/progress.md` — task list

Out of scope (not converted here): `MessagesTab` (conversation state lives in `AppContext` and needs dedicated treatment incl. `?conv=` deep-links), `AdminPage`, `PricingSection`, `NotificationBell`, and layout components (`Infobar`, `Navbar`, `Sidebar`) — they do one-off/mutation fetches outside the milestone's page-reads.

---

### Task 1: Unwrap server-state hooks and fix hook tests

**Files:**
- Modify: `src/hooks/useJobs.ts`
- Modify: `src/hooks/useJob.ts`
- Modify: `src/hooks/useBlogPosts.ts`
- Modify: `src/hooks/useBlogPost.ts`
- Modify: `src/hooks/__tests__/useJobs.test.tsx`
- Modify: `src/hooks/__tests__/useJob.test.tsx`
- Create: `src/hooks/__tests__/useBlogPosts.test.tsx`
- Create: `src/hooks/__tests__/useBlogPost.test.tsx`

**Interfaces:**
- Consumes: `listJobs(params: JobListParams) => Promise<ApiSuccess<Job[]>>`, `getJobById(id: string) => Promise<ApiSuccess<Job>>`, `listBlogPosts(params?: BlogListParams) => Promise<ApiSuccess<BlogPost[]>>`, `getBlogPostBySlug(slug: string) => Promise<ApiSuccess<BlogPost>>` from `src/api/*`.
- Produces:
  - `useJobs(params: JobListParams) => UseQueryResult<Job[]>` — observed `data` is `Job[]`
  - `useJob(id: string) => UseQueryResult<Job>` — `enabled: !!id`, observed `data` is `Job`
  - `useBlogPosts(params: BlogListParams) => UseQueryResult<BlogPost[]>` — observed `data` is `BlogPost[]`
  - `useBlogPost(slug: string) => UseQueryResult<BlogPost>` — `enabled: !!slug`, observed `data` is `BlogPost`

- [ ] **Step 1: Write the failing tests first**

Create `src/hooks/__tests__/useBlogPosts.test.tsx`:

```tsx
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useBlogPosts } from '../useBlogPosts'
import { listBlogPosts } from '../../api/blog'

vi.mock('../../api/blog', () => ({
  listBlogPosts: vi.fn(),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const mockPosts = [
  {
    slug: 'hello-world',
    title: 'Hello World',
    excerpt: 'A post about hello.',
    content: 'First paragraph.',
    image: 'https://example.com/hello.png',
    category: 'Career Advice',
    author: { name: 'Jane Doe', avatar: 'https://example.com/jane.png', role: 'Recruiter' },
    date: '2026-01-01',
    readTime: 3,
    featured: false,
  },
]

describe('useBlogPosts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns loading state initially', () => {
    vi.mocked(listBlogPosts).mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useBlogPosts({ take: 20 }), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('returns data after successful fetch', async () => {
    vi.mocked(listBlogPosts).mockResolvedValue({
      data: mockPosts,
      pagination: { total: 1, cursor: null },
    })

    const { result } = renderHook(() => useBlogPosts({ take: 20 }), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockPosts)
  })

  it('returns error state when API fails', async () => {
    vi.mocked(listBlogPosts).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useBlogPosts({ take: 20 }), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('Network error')
  })
})
```

Create `src/hooks/__tests__/useBlogPost.test.tsx`:

```tsx
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useBlogPost } from '../useBlogPost'
import { getBlogPostBySlug } from '../../api/blog'

vi.mock('../../api/blog', () => ({
  getBlogPostBySlug: vi.fn(),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const mockPost = {
  slug: 'hello-world',
  title: 'Hello World',
  excerpt: 'A post about hello.',
  content: 'First paragraph.',
  image: 'https://example.com/hello.png',
  category: 'Career Advice',
  author: { name: 'Jane Doe', avatar: 'https://example.com/jane.png', role: 'Recruiter' },
  date: '2026-01-01',
  readTime: 3,
  featured: false,
}

describe('useBlogPost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('is disabled when slug is empty', () => {
    const { result } = renderHook(() => useBlogPost(''), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
    expect(getBlogPostBySlug).not.toHaveBeenCalled()
  })

  it('returns data after successful fetch', async () => {
    vi.mocked(getBlogPostBySlug).mockResolvedValue({ data: mockPost })

    const { result } = renderHook(() => useBlogPost('hello-world'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockPost)
    expect(getBlogPostBySlug).toHaveBeenCalledWith('hello-world')
  })

  it('returns error state when API fails', async () => {
    vi.mocked(getBlogPostBySlug).mockRejectedValue(new Error('Not found'))

    const { result } = renderHook(() => useBlogPost('nope'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('Not found')
  })
})
```

- [ ] **Step 2: Run the new tests to verify they fail**

Run: `bun run test:run src/hooks/__tests__/useBlogPosts.test.tsx src/hooks/__tests__/useBlogPost.test.tsx`
Expected: FAIL — `data` is the full envelope `{ success, data, pagination }`, not the bare array/object.

- [ ] **Step 3: Implement `select` unwrapping in the four hooks**

Rewrite `src/hooks/useJobs.ts` to:

```ts
import { useQuery } from '@tanstack/react-query'
import { listJobs } from '../api/jobs'
import type { JobListParams } from '../api/types'

export function useJobs(params: JobListParams = {}) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => listJobs(params),
    select: (data) => data.data,
  })
}
```

Rewrite `src/hooks/useJob.ts` to:

```ts
import { useQuery } from '@tanstack/react-query'
import { getJobById } from '../api/jobs'

export function useJob(id: string) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => getJobById(id),
    select: (data) => data.data,
    enabled: !!id,
  })
}
```

Rewrite `src/hooks/useBlogPosts.ts` to:

```ts
import { useQuery } from '@tanstack/react-query'
import { listBlogPosts } from '../api/blog'
import type { BlogListParams } from '../api/types'

export function useBlogPosts(params: BlogListParams = {}) {
  return useQuery({
    queryKey: ['blogPosts', params],
    queryFn: () => listBlogPosts(params),
    select: (data) => data.data,
  })
}
```

Rewrite `src/hooks/useBlogPost.ts` to:

```ts
import { useQuery } from '@tanstack/react-query'
import { getBlogPostBySlug } from '../api/blog'

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blogPost', slug],
    queryFn: () => getBlogPostBySlug(slug),
    select: (data) => data.data,
    enabled: !!slug,
  })
}
```

- [ ] **Step 4: Fix the two existing hook tests to mock the real envelope**

In `src/hooks/__tests__/useJobs.test.tsx`, replace the success-test mock line:

```tsx
vi.mocked(listJobs).mockResolvedValue(mockJobs)
```

with:

```tsx
vi.mocked(listJobs).mockResolvedValue({
  data: mockJobs,
  pagination: { total: mockJobs.length, cursor: null },
})
```

In `src/hooks/__tests__/useJob.test.tsx`, replace the success-test mock line:

```tsx
vi.mocked(getJobById).mockResolvedValue(mockJob)
```

with:

```tsx
vi.mocked(getJobById).mockResolvedValue({ data: mockJob })
```

No other lines in those files change.

- [ ] **Step 5: Run all hook tests to verify they pass**

Run: `bun run test:run src/hooks/__tests__`
Expected: PASS — all 4 hook test files green (11 tests).

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useJobs.ts src/hooks/useJob.ts src/hooks/useBlogPosts.ts src/hooks/useBlogPost.ts src/hooks/__tests__/useJobs.test.tsx src/hooks/__tests__/useJob.test.tsx src/hooks/__tests__/useBlogPosts.test.tsx src/hooks/__tests__/useBlogPost.test.tsx
git commit -m "refactor(hooks): unwrap api envelopes via select in query hooks"
```

---

### Task 2: Job board cursor pagination → `useInfiniteJobs`

**Files:**
- Modify: `src/hooks/useJobs.ts`
- Modify: `src/components/jobs/JobBoardPage.tsx`
- Create: `src/hooks/__tests__/useInfiniteJobs.test.tsx`
- Modify: `src/components/jobs/__tests__/JobBoardPage.test.tsx`

**Interfaces:**
- Consumes: `listJobs(params?: JobListParams) => Promise<ApiSuccess<Job[]>>`; `useJobs` from Task 1.
- Produces:
  - `useInfiniteJobs(params: InfiniteJobsParams) => InfiniteQueryObserverResult<{ jobs: Job[]; total: number }>` where `InfiniteJobsParams = { search?: string; category?: string; seniority?: string }`. Available on the result: `data.jobs`, `data.total`, `isLoading`, `isError`, `error`, `hasNextPage`, `isFetchingNextPage`, `fetchNextPage()`, `refetch()`.

- [ ] **Step 1: Write the failing hook test**

Create `src/hooks/__tests__/useInfiniteJobs.test.tsx`:

```tsx
import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useInfiniteJobs } from '../useJobs'
import { listJobs } from '../../api/jobs'

vi.mock('../../api/jobs', () => ({
  listJobs: vi.fn(),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const jobA = {
  id: '1',
  title: 'Engineer One',
  company: 'Acme',
  companyLogo: '',
  location: 'Remote',
  remote: true,
  salaryMin: 100000,
  salaryMax: 150000,
  currency: 'USD',
  tags: ['React'],
  category: 'Engineering',
  seniority: 'senior',
  description: 'Build things',
  requirements: [],
  responsibilities: [],
  postedDate: '2026-01-01',
  featured: false,
}

const jobB = { ...jobA, id: '2', title: 'Engineer Two' }

describe('useInfiniteJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches the first page on mount and exposes flattened jobs', async () => {
    vi.mocked(listJobs).mockResolvedValue({
      data: [jobA],
      pagination: { total: 2, cursor: 'page-2' },
    })

    const { result } = renderHook(() => useInfiniteJobs({ search: 'react' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.jobs).toEqual([jobA])
    expect(result.current.data?.total).toBe(2)
    expect(result.current.hasNextPage).toBe(true)
    expect(listJobs).toHaveBeenCalledWith({
      search: 'react',
      category: '',
      seniority: '',
      take: 12,
    })
  })

  it('appends the next page when fetchNextPage is called', async () => {
    vi.mocked(listJobs).mockResolvedValueOnce({
      data: [jobA],
      pagination: { total: 2, cursor: 'page-2' },
    })
    vi.mocked(listJobs).mockResolvedValueOnce({
      data: [jobB],
      pagination: { total: 2, cursor: null },
    })

    const { result } = renderHook(() => useInfiniteJobs({}), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.data?.jobs).toHaveLength(1)
    })

    await act(async () => {
      await result.current.fetchNextPage()
    })

    await waitFor(() => {
      expect(result.current.data?.jobs).toEqual([jobA, jobB])
    })

    expect(result.current.hasNextPage).toBe(false)
    expect(listJobs).toHaveBeenLastCalledWith({
      search: '',
      category: '',
      seniority: '',
      take: 12,
      cursor: 'page-2',
    })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test:run src/hooks/__tests__/useInfiniteJobs.test.tsx`
Expected: FAIL — `useInfiniteJobs` is not exported from `../useJobs`.

- [ ] **Step 3: Implement `useInfiniteJobs`**

Rewrite `src/hooks/useJobs.ts` to:

```ts
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { listJobs } from '../api/jobs'
import type { JobListParams } from '../api/types'

const PAGE_SIZE = 12

export function useJobs(params: JobListParams = {}) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => listJobs(params),
    select: (data) => data.data,
  })
}

export interface InfiniteJobsParams {
  search?: string
  category?: string
  seniority?: string
}

export function useInfiniteJobs(params: InfiniteJobsParams) {
  const { search, category, seniority } = params
  return useInfiniteQuery({
    queryKey: ['jobs', 'infinite', { search, category, seniority }],
    queryFn: ({ pageParam }) =>
      listJobs({
        search,
        category,
        seniority,
        take: PAGE_SIZE,
        ...(pageParam ? { cursor: pageParam } : {}),
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination?.cursor ?? undefined,
    select: (data) => ({
      jobs: data.pages.flatMap((page) => page.data),
      total: data.pages[data.pages.length - 1]?.pagination?.total ?? 0,
    }),
  })
}
```

- [ ] **Step 4: Run the hook test to verify it passes**

Run: `bun run test:run src/hooks/__tests__/useInfiniteJobs.test.tsx`
Expected: PASS.

- [ ] **Step 5: Convert `JobBoardPage`**

Rewrite `src/components/jobs/JobBoardPage.tsx` to:

```tsx
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
```

- [ ] **Step 6: Add a load-more test to `JobBoardPage.test.tsx`**

In `src/components/jobs/__tests__/JobBoardPage.test.tsx`, add `userEvent` to the import at the top:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
```

Append this test inside the existing `describe('JobBoardPage', ...)` block (before the closing `})`):

```tsx
  it('loads more jobs when clicking load more', async () => {
    const { listJobs } = await import('../../../api/jobs')
    const pageOneJob = {
      id: '1',
      title: 'Engineer One',
      company: 'Acme',
      companyLogo: '',
      location: 'Remote',
      remote: true,
      salaryMin: 100000,
      salaryMax: 150000,
      currency: 'USD',
      tags: ['React'],
      category: 'Engineering',
      seniority: 'senior',
      description: 'Build things',
      requirements: [],
      responsibilities: [],
      postedDate: '2026-01-01',
      featured: false,
    }
    const pageTwoJob = { ...pageOneJob, id: '2', title: 'Engineer Two' }
    ;(listJobs as ReturnType<typeof vi.fn>).mockImplementation((params?: { cursor?: string }) =>
      params?.cursor
        ? Promise.resolve({ data: [pageTwoJob], pagination: { total: 2, cursor: null } })
        : Promise.resolve({ data: [pageOneJob], pagination: { total: 2, cursor: 'page-2' } })
    )

    renderJobBoardPage()
    const loadMore = await screen.findByRole('button', { name: /load more/i })
    await userEvent.click(loadMore)

    expect(await screen.findByText('Engineer Two')).toBeInTheDocument()
  })
```

- [ ] **Step 7: Run the job board tests to verify they pass**

Run: `bun run test:run src/components/jobs/__tests__/JobBoardPage.test.tsx src/hooks/__tests__/useInfiniteJobs.test.tsx`
Expected: PASS — all 7 JobBoardPage tests (existing 6 + new load-more) plus 2 hook tests.

- [ ] **Step 8: Commit**

```bash
git add src/hooks/useJobs.ts src/components/jobs/JobBoardPage.tsx src/hooks/__tests__/useInfiniteJobs.test.tsx src/components/jobs/__tests__/JobBoardPage.test.tsx
git commit -m "refactor(jobs): use useInfiniteJobs for the job board pagination"
```

---

### Task 3: Job detail page → `useJob` + skeleton

**Files:**
- Modify: `src/components/jobs/JobDetailPage.tsx`
- Modify: `src/components/jobs/__tests__/JobDetailPage.test.tsx`

**Interfaces:**
- Consumes: `useJob(id: string) => UseQueryResult<Job>` from `src/hooks/useJob` (Task 1); `SkeletonCard` from `../ui/SkeletonCard`.

- [ ] **Step 1: Write the failing test updates**

In `src/components/jobs/__tests__/JobDetailPage.test.tsx`, update the imports to add the query client, and change the `renderJobDetailPage` helper and the loading assertion:

Replace the import block at the top with:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProvider } from '../../../context/AppContext'
import { ToastProvider } from '../../ui/Toast'
import JobDetailPage from '../JobDetailPage'
```

Replace the `renderJobDetailPage` helper with:

```tsx
function renderJobDetailPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <MemoryRouter initialEntries={['/jobs/test-id']}>
          <ToastProvider>
            <JobDetailPage />
          </ToastProvider>
        </MemoryRouter>
      </AppProvider>
    </QueryClientProvider>
  )
}
```

Replace the loading test body:

```tsx
  it('renders loading state initially', async () => {
    const { getJobById } = await import('../../../api/jobs')
    ;(getJobById as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    )

    renderJobDetailPage()
    expect(screen.getByRole('status', { name: /loading job/i })).toBeInTheDocument()
  })
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test:run src/components/jobs/__tests__/JobDetailPage.test.tsx`
Expected: FAIL — `getByRole('status', { name: /loading job/i })` not found (the page still renders plain text "Loading...").

- [ ] **Step 3: Convert `JobDetailPage`**

Rewrite `src/components/jobs/JobDetailPage.tsx` to:

```tsx
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Section, Container } from '../ui'
import { HeroContent } from '../ui/HeroContent'
import { SkeletonCard } from '../ui/SkeletonCard'
import { usePageMeta } from '../../utils/usePageMeta'
import { useJob } from '../../hooks/useJob'
import { JobHeader } from './JobHeader'
import { JobBody } from './JobBody'
import { CompanySidebar } from './CompanySidebar'
import { SaveButton } from './SaveButton'

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: job, isLoading, isError } = useJob(id ?? '')
  const [now] = useState(() => Date.now())

  const meta = usePageMeta({
    title: job ? `${job.title} | HireHub Community` : 'Job | HireHub Community',
    description: job ? job.description.slice(0, 160).replace(/\s+\S*$/, '') : undefined,
    image: job?.companyLogo,
    url: job ? `/jobs/${job.id}` : undefined,
  })

  if (isLoading) {
    return (
      <>
        {meta}
        <Section>
          <Container>
            <div role="status" aria-label="Loading job..." className="max-w-3xl mx-auto">
              <SkeletonCard />
            </div>
          </Container>
        </Section>
      </>
    )
  }

  if (!job || isError) {
    return (
      <>
        {meta}
        <Section>
          <Container>
            <div className="text-center py-24">
              <HeroContent variant="accent" className="mb-6">
                <h1 className="text-[40px] leading-[1.15] tracking-[-0.8px] font-medium">Job not found</h1>
                <p className="text-ink-muted mt-2">The job you're looking for doesn't exist or has been removed.</p>
              </HeroContent>
              <Link to="/jobs" className="text-accent hover:underline text-sm font-medium">Back to all jobs</Link>
            </div>
          </Container>
        </Section>
      </>
    )
  }

  const expired = job.expiresAt ? new Date(job.expiresAt).getTime() < now : false

  return (
    <>
      {meta}
      <Section>
        <Container>
          <div className="flex items-center justify-between mb-8">
            <HeroContent variant="accent" className="mb-8">
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-ink-muted">
                <Link to="/jobs" className="hover:text-ink transition-colors">Jobs</Link>
                <span aria-hidden="true">→</span>
                <span aria-current="page" >{job.title}</span>
              </nav>
            </HeroContent>
            <SaveButton jobId={job.id} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
            <div>
              {expired && (
                <div className="mb-6 p-4 rounded-lg border border-accent/30 bg-accent/5 text-sm text-ink">
                  This job has expired. Applications are now closed.
                </div>
              )}
              <JobHeader job={job} />
              <JobBody job={job} />
            </div>
            <div>
              <CompanySidebar job={job} />
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bun run test:run src/components/jobs/__tests__/JobDetailPage.test.tsx`
Expected: PASS — all 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/jobs/JobDetailPage.tsx src/components/jobs/__tests__/JobDetailPage.test.tsx
git commit -m "refactor(jobs): use useJob hook and skeleton loading in job detail page"
```

---

### Task 4: Blog list page → `useBlogPosts`

**Files:**
- Modify: `src/components/blog/BlogPage.tsx`
- Modify: `src/components/blog/__tests__/BlogPage.test.tsx`

**Interfaces:**
- Consumes: `useBlogPosts(params: BlogListParams) => UseQueryResult<BlogPost[]>` from `src/hooks/useBlogPosts` (Task 1).

- [ ] **Step 1: Write the failing test updates**

In `src/components/blog/__tests__/BlogPage.test.tsx`, replace the imports and the render helper:

Replace the top import block with:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import BlogPage from '../BlogPage'
```

Replace the `renderBlogPage` helper with:

```tsx
function renderBlogPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/blog']}>
        <BlogPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun run test:run src/components/blog/__tests__/BlogPage.test.tsx`
Expected: FAIL — `React Query has no QueryClient set` (the page will start calling `useBlogPosts`, which requires the provider).

- [ ] **Step 3: Convert `BlogPage`**

Rewrite `src/components/blog/BlogPage.tsx` to:

```tsx
import { useState } from 'react'
import { HeroContent } from '../ui/HeroContent'
import { Section, Container, Reveal } from '../ui'
import { SkeletonGrid } from '../ui/SkeletonGrid'
import { usePageMeta } from '../../utils/usePageMeta'
import { FeaturedPost } from './FeaturedPost'
import { CategoryFilter } from './CategoryFilter'
import { BlogGrid } from './BlogGrid'
import { useBlogPosts } from '../../hooks/useBlogPosts'

const categories = ['All', 'Hiring Tips', 'Company Culture', 'Career Advice', 'Industry News']

export default function BlogPage() {
  const meta = usePageMeta({ title: 'Blog | HireHub Community', description: 'Insights and advice for your career journey.' })

  const [activeCategory, setActiveCategory] = useState('')
  const { data: posts = [], isLoading } = useBlogPosts({ take: 20 })

  const featured = posts.find((p) => p.featured)

  const filtered =
    activeCategory === '' || activeCategory === 'All'
      ? posts
      : posts.filter((p) => p.category === activeCategory)

  if (isLoading) {
    return (
      <>
        {meta}
        <Section>
          <Container><SkeletonGrid count={6} columns={3} /></Container>
        </Section>
      </>
    )
  }

  return (
    <>
      {meta}
      <Section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]">
          <img src="/blog-featured.png" alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <Container className="relative">
          <HeroContent variant="card" className="mb-8">
            <h1 className="text-[40px] leading-[1.15] font-medium">Blog</h1>
            <p className="text-lg text-ink-muted mt-2">Insights and advice for your career journey.</p>
          </HeroContent>
          {featured && <Reveal className="mb-10"><FeaturedPost post={featured} /></Reveal>}
          <Reveal className="mb-10" delay={0.05}>
            <CategoryFilter categories={categories} active={activeCategory} onChange={setActiveCategory} />
          </Reveal>
          <Reveal delay={0.1}><BlogGrid posts={filtered} /></Reveal>
        </Container>
      </Section>
    </>
  )
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bun run test:run src/components/blog/__tests__/BlogPage.test.tsx`
Expected: PASS — all 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/blog/BlogPage.tsx src/components/blog/__tests__/BlogPage.test.tsx
git commit -m "refactor(blog): use useBlogPosts hook in blog listing page"
```

---

### Task 5: Blog post page → `useBlogPost`

**Files:**
- Modify: `src/components/blog/BlogPostPage.tsx`
- Create: `src/components/blog/__tests__/BlogPostPage.test.tsx`

**Interfaces:**
- Consumes: `useBlogPost(slug: string) => UseQueryResult<BlogPost>` from `src/hooks/useBlogPost` (Task 1).

- [ ] **Step 1: Write the failing test**

Create `src/components/blog/__tests__/BlogPostPage.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import BlogPostPage from '../BlogPostPage'

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useParams: vi.fn(() => ({ slug: 'hello-world' })),
  }
})

vi.mock('../../../api/blog', () => ({
  getBlogPostBySlug: vi.fn(),
}))

vi.mock('../../../utils/usePageMeta', () => ({
  usePageMeta: vi.fn(),
}))

const mockPost = {
  slug: 'hello-world',
  title: 'Hello World',
  excerpt: 'A post about hello.',
  content: 'First paragraph.\n\nSecond paragraph.',
  image: 'https://example.com/hello.png',
  category: 'Career Advice',
  author: { name: 'Jane Doe', avatar: 'https://example.com/jane.png', role: 'Recruiter' },
  date: '2026-01-01',
  readTime: 3,
  featured: false,
}

function renderBlogPostPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/blog/hello-world']}>
        <BlogPostPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('BlogPostPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the skeleton while loading', async () => {
    const { getBlogPostBySlug } = await import('../../../api/blog')
    ;(getBlogPostBySlug as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}))

    renderBlogPostPage()
    expect(screen.queryByRole('heading', { name: 'Hello World' })).not.toBeInTheDocument()
  })

  it('renders the post after loading', async () => {
    const { getBlogPostBySlug } = await import('../../../api/blog')
    ;(getBlogPostBySlug as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockPost })

    renderBlogPostPage()
    expect(await screen.findByRole('heading', { name: 'Hello World' })).toBeInTheDocument()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('renders not-found state when the API errors', async () => {
    const { getBlogPostBySlug } = await import('../../../api/blog')
    ;(getBlogPostBySlug as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Not found'))

    renderBlogPostPage()
    expect(await screen.findByText('Post not found')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test:run src/components/blog/__tests__/BlogPostPage.test.tsx`
Expected: FAIL — `React Query has no QueryClient set` (the page still does a manual `getBlogPostBySlug` fetch and has no provider, so the post never renders).

- [ ] **Step 3: Convert `BlogPostPage`**

Rewrite `src/components/blog/BlogPostPage.tsx` to:

```tsx
import { useParams, Link } from 'react-router-dom'
import { Section, Container, Reveal } from '../ui'
import { HeroContent } from '../ui/HeroContent'
import { SkeletonCard } from '../ui/SkeletonCard'
import { usePageMeta } from '../../utils/usePageMeta'
import { Tag } from '../ui/Tag'
import { formatDate } from '../../utils/date'
import { useBlogPost } from '../../hooks/useBlogPost'

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: post, isLoading, isError } = useBlogPost(slug ?? '')

  const meta = usePageMeta({
    title: post ? `${post.title} | HireHub Community` : 'Post | HireHub Community',
    description: post?.excerpt,
    image: post?.image,
    url: post ? `/blog/${post.slug}` : undefined,
  })

  if (isLoading) {
    return (
      <>
        {meta}
        <Section>
          <Container><div className="max-w-3xl mx-auto"><SkeletonCard /></div></Container>
        </Section>
      </>
    )
  }

  if (!post || isError) {
    return (
      <>
        {meta}
        <Section>
          <Container>
            <div className="text-center py-16">
              <p className="text-ink-muted text-lg mb-4">Post not found</p>
              <Link to="/blog" className="text-accent hover:underline text-sm font-medium">Back to blog</Link>
            </div>
          </Container>
        </Section>
      </>
    )
  }

  const paragraphs = post.content ? post.content.split('\n\n') : []

  return (
    <>
      {meta}
      <Section>
        <Container>
          <HeroContent variant="accent" className="mb-8">
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <Link to="/blog" className="hover:text-ink transition-colors">Blog</Link>
              <span aria-hidden="true">→</span>
              <span className="text-ink truncate" aria-current="page">{post.title}</span>
            </div>
          </HeroContent>
          <Reveal><article className="max-w-3xl mx-auto">
            <img src={post.image} alt={post.title} className="w-full h-72 md:h-96 object-cover rounded-xl mb-8" />
            <Tag variant="category">{post.category}</Tag>
            <h1 className="text-[40px] leading-[1.15] font-medium mt-4 mb-4">{post.title}</h1>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-sm font-medium" aria-hidden="true">
                {post.author.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-ink">
                  {post.author.name}
                  <span className="text-ink-muted font-normal"> · {post.author.role}</span>
                </p>
                <p className="text-sm text-ink-muted">{formatDate(post.date)} · {post.readTime} min read</p>
              </div>
            </div>
            <div>
              {paragraphs.map((para, i) => (
                <p key={i} className="text-base leading-[1.8] text-ink-muted mb-4">{para}</p>
              ))}
            </div>
          </article></Reveal>
          <div className="mt-12 text-center">
            <Link to="/blog" className="text-accent hover:underline text-sm font-medium">← Back to blog</Link>
          </div>
        </Container>
      </Section>
    </>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test:run src/components/blog/__tests__/BlogPostPage.test.tsx`
Expected: PASS — all 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/blog/BlogPostPage.tsx src/components/blog/__tests__/BlogPostPage.test.tsx
git commit -m "refactor(blog): use useBlogPost hook in blog post page"
```

---

### Task 6: Applications tab → `useApplicationsQuery`

**Files:**
- Modify: `src/components/dashboard/ApplicationsTab.tsx`
- Create: `src/components/dashboard/__tests__/ApplicationsTab.test.tsx`

**Interfaces:**
- Consumes: `useApplicationsQuery() => UseQueryResult<ApiSuccess<Application[]>>` from `src/hooks/useApplicationsQuery` (queryFn is `listApplications`, so `data.data` is `Application[]`); `listApplications` from `src/api/applications` for the `setQueryData` updater type.

- [ ] **Step 1: Write the failing test**

Create `src/components/dashboard/__tests__/ApplicationsTab.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApplicationsTab } from '../ApplicationsTab'

vi.mock('../../../api/applications', () => ({
  listApplications: vi.fn(),
}))

vi.mock('../ApplicationCard', () => ({
  ApplicationCard: ({ application }: { application: { jobTitle: string; company: string } }) => (
    <div>
      <h3>{application.jobTitle}</h3>
      <p>{application.company}</p>
    </div>
  ),
}))

const mockApp = {
  id: 'a1',
  jobId: 'j1',
  jobTitle: 'Frontend Engineer',
  company: 'Acme',
  companyLogo: '',
  applicantName: 'Jane Doe',
  applicantEmail: 'jane@example.com',
  coverLetter: 'Hi there',
  status: 'applied',
  submittedAt: '2026-01-01T00:00:00.000Z',
}

function renderApplicationsTab() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <ApplicationsTab />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('ApplicationsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the skeleton while loading', async () => {
    const { listApplications } = await import('../../../api/applications')
    ;(listApplications as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}))

    renderApplicationsTab()
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
  })

  it('renders empty state when there are no applications', async () => {
    const { listApplications } = await import('../../../api/applications')
    ;(listApplications as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [] })

    renderApplicationsTab()
    expect(await screen.findByText('No applications yet')).toBeInTheDocument()
  })

  it('renders applications when loaded', async () => {
    const { listApplications } = await import('../../../api/applications')
    ;(listApplications as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [mockApp] })

    renderApplicationsTab()
    expect(await screen.findByRole('heading', { name: 'Frontend Engineer' })).toBeInTheDocument()
    expect(screen.getByText('Acme')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test:run src/components/dashboard/__tests__/ApplicationsTab.test.tsx`
Expected: FAIL — `React Query has no QueryClient set` (tab still calls `listApplications` imperatively and has no provider; actually it will throw the query error because there is no `QueryClient` context).

- [ ] **Step 3: Convert `ApplicationsTab`**

Rewrite `src/components/dashboard/ApplicationsTab.tsx` to:

```tsx
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useApplicationsQuery } from '../../hooks/useApplicationsQuery'
import { listApplications } from '../../api/applications'
import { SkeletonGrid } from '../ui/SkeletonGrid'
import { EmptyState } from '../ui/EmptyState'
import { ErrorState } from '../ui/ErrorState'
import type { Application, ApplicationStatus } from '../../types/application'
import { ApplicationCard } from './ApplicationCard'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

export function ApplicationsTab() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, isLoading, isError, refetch } = useApplicationsQuery()

  const apps = data?.data ?? []
  const error = isError ? 'Failed to load applications.' : null

  function handleRetry() {
    refetch()
  }

  function handleStatusUpdate(applicationId: string, status: ApplicationStatus) {
    queryClient.setQueryData<Awaited<ReturnType<typeof listApplications>>>(
      ['applications'],
      (old) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.map((app) => (app.id === applicationId ? { ...app, status } : app)),
        }
      }
    )
  }

  if (isLoading) {
    return (
      <SkeletonGrid count={3} columns={2} />
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={handleRetry} />
  }

  if (apps.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="w-12 h-12" />}
        title="No applications yet"
        description="Start applying to jobs to track your applications here."
        actionLabel="Browse jobs"
        onAction={() => navigate('/jobs')}
      />
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {apps.map((app) => (
        <motion.div key={app.id} variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
          <ApplicationCard application={app} onStatusUpdate={handleStatusUpdate} />
        </motion.div>
      ))}
    </motion.div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test:run src/components/dashboard/__tests__/ApplicationsTab.test.tsx`
Expected: PASS — all 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/ApplicationsTab.tsx src/components/dashboard/__tests__/ApplicationsTab.test.tsx
git commit -m "refactor(dashboard): use useApplicationsQuery in applications tab"
```

---

### Task 7: Saved jobs tab → `useSavedJobsQuery`

**Files:**
- Modify: `src/components/dashboard/SavedJobsTab.tsx`
- Create: `src/components/dashboard/__tests__/SavedJobsTab.test.tsx`

**Interfaces:**
- Consumes: `useSavedJobsQuery() => UseQueryResult<ApiSuccess<Job[]>>` from `src/hooks/useSavedJobsQuery` (queryFn is `listSavedJobs`, so `data.data` is `Job[]`); `useApp().savedJobIds: string[]` from `src/context/AppContext`.

- [ ] **Step 1: Write the failing test**

Create `src/components/dashboard/__tests__/SavedJobsTab.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useApp } from '../../../context/AppContext'
import { SavedJobsTab } from '../SavedJobsTab'

vi.mock('../../../context/AppContext', () => ({
  useApp: vi.fn(),
}))

vi.mock('../../../api/savedJobs', () => ({
  listSavedJobs: vi.fn(),
}))

vi.mock('../jobs/JobCard', () => ({
  JobCard: ({ job }: { job: { title: string } }) => <div>{job.title}</div>,
}))

const mockJob = {
  id: 'j1',
  title: 'Saved Engineer',
  company: 'Acme',
  companyLogo: '',
  location: 'Remote',
  remote: true,
  salaryMin: 100000,
  salaryMax: 150000,
  currency: 'USD',
  tags: ['React'],
  category: 'Engineering',
  seniority: 'senior',
  description: 'Build things',
  requirements: [],
  responsibilities: [],
  postedDate: '2026-01-01',
  featured: false,
}

function renderSavedJobsTab(queryClient: QueryClient) {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <SavedJobsTab />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

function createClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

describe('SavedJobsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useApp).mockReturnValue({ savedJobIds: [] } as ReturnType<typeof useApp>)
  })

  it('renders saved jobs when loaded', async () => {
    const { listSavedJobs } = await import('../../../api/savedJobs')
    ;(listSavedJobs as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [mockJob] })

    renderSavedJobsTab(createClient())
    expect(await screen.findByText('Saved Engineer')).toBeInTheDocument()
  })

  it('renders empty state when there are no saved jobs', async () => {
    const { listSavedJobs } = await import('../../../api/savedJobs')
    ;(listSavedJobs as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [] })

    renderSavedJobsTab(createClient())
    expect(await screen.findByText('No saved jobs yet')).toBeInTheDocument()
  })

  it('refetches saved jobs when the saved ids change', async () => {
    vi.mocked(useApp).mockReturnValue({ savedJobIds: [] } as ReturnType<typeof useApp>)
    const { listSavedJobs } = await import('../../../api/savedJobs')
    ;(listSavedJobs as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [] })

    const queryClient = createClient()
    const { rerender } = renderSavedJobsTab(queryClient)
    await screen.findByText('No saved jobs yet')
    expect(listSavedJobs).toHaveBeenCalledTimes(1)

    vi.mocked(useApp).mockReturnValue({ savedJobIds: ['j1'] } as ReturnType<typeof useApp>)
    rerender(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <SavedJobsTab />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => expect(listSavedJobs).toHaveBeenCalledTimes(2))
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test:run src/components/dashboard/__tests__/SavedJobsTab.test.tsx`
Expected: FAIL — `React Query has no QueryClient set`.

- [ ] **Step 3: Convert `SavedJobsTab`**

Rewrite `src/components/dashboard/SavedJobsTab.tsx` to:

```tsx
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bookmark } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useApp } from '../../context/AppContext'
import { useSavedJobsQuery } from '../../hooks/useSavedJobsQuery'
import { JobCard } from '../jobs/JobCard'
import { SkeletonGrid } from '../ui/SkeletonGrid'
import { EmptyState } from '../ui/EmptyState'
import { ErrorState } from '../ui/ErrorState'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

export function SavedJobsTab() {
  const { savedJobIds } = useApp()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const skipFirstInvalidate = useRef(true)
  const { data, isLoading, isError, refetch } = useSavedJobsQuery()

  useEffect(() => {
    if (skipFirstInvalidate.current) {
      skipFirstInvalidate.current = false
      return
    }
    queryClient.invalidateQueries({ queryKey: ['savedJobs'] })
  }, [savedJobIds, queryClient])

  const savedJobs = data?.data ?? []
  const error = isError ? 'Failed to load saved jobs.' : null

  function handleRetry() {
    refetch()
  }

  if (isLoading) {
    return <SkeletonGrid count={6} columns={3} />
  }

  if (error) {
    return <ErrorState message={error} onRetry={handleRetry} />
  }

  if (savedJobs.length === 0) {
    return (
      <EmptyState
        icon={<Bookmark className="w-12 h-12" />}
        title="No saved jobs yet"
        description="Save jobs you're interested in to come back to them later."
        actionLabel="Browse jobs"
        onAction={() => navigate('/jobs')}
      />
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {savedJobs.map((job) => (
        <motion.div key={job.id} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
          <JobCard job={job} />
        </motion.div>
      ))}
    </motion.div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test:run src/components/dashboard/__tests__/SavedJobsTab.test.tsx`
Expected: PASS — all 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/SavedJobsTab.tsx src/components/dashboard/__tests__/SavedJobsTab.test.tsx
git commit -m "refactor(dashboard): use useSavedJobsQuery in saved jobs tab"
```

---

### Task 8: Featured jobs section → `useJobs`

**Files:**
- Modify: `src/components/home/FeaturedJobs.tsx`
- Create: `src/components/home/__tests__/FeaturedJobs.test.tsx`

**Interfaces:**
- Consumes: `useJobs(params: JobListParams) => UseQueryResult<Job[]>` from `src/hooks/useJobs` (Task 1).

- [ ] **Step 1: Write the failing test**

Create `src/components/home/__tests__/FeaturedJobs.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FeaturedJobs } from '../FeaturedJobs'

vi.mock('../../../api/jobs', () => ({
  listJobs: vi.fn(),
}))

const makeJob = (id: string, title: string, featured: boolean) => ({
  id,
  title,
  company: 'Acme',
  companyLogo: '',
  location: 'Remote',
  remote: true,
  salaryMin: 100000,
  salaryMax: 150000,
  currency: 'USD',
  tags: ['React'],
  category: 'Engineering',
  seniority: 'senior',
  description: 'Build things',
  requirements: [],
  responsibilities: [],
  postedDate: '2026-01-01',
  featured,
})

function renderFeaturedJobs() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <FeaturedJobs />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('FeaturedJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the skeleton while loading', async () => {
    const { listJobs } = await import('../../../api/jobs')
    ;(listJobs as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}))

    renderFeaturedJobs()
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
  })

  it('renders only featured jobs', async () => {
    const { listJobs } = await import('../../../api/jobs')
    ;(listJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [
        makeJob('1', 'Featured One', true),
        makeJob('2', 'Featured Two', true),
        makeJob('3', 'Regular Three', false),
      ],
      pagination: { total: 3, cursor: null },
    })

    renderFeaturedJobs()
    expect(await screen.findByText('Featured One')).toBeInTheDocument()
    expect(screen.getByText('Featured Two')).toBeInTheDocument()
    expect(screen.queryByText('Regular Three')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test:run src/components/home/__tests__/FeaturedJobs.test.tsx`
Expected: FAIL — `React Query has no QueryClient set`.

- [ ] **Step 3: Convert `FeaturedJobs`**

Rewrite `src/components/home/FeaturedJobs.tsx` to:

```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { Section } from '../ui/Section'
import { Container } from '../ui/Container'
import { Card } from '../ui/Card'
import { SkeletonGrid } from '../ui/SkeletonGrid'
import { useJobs } from '../../hooks/useJobs'
import { formatSalary } from '../../utils/format'
import type { Job } from '../../data/jobs'

function CompanyLogo({ job, className }: { job: Job; className?: string }) {
  const [error, setError] = useState(false)
  if (error) {
    return (
      <div className={`${className} bg-accent/10 text-accent flex items-center justify-center text-xs font-semibold`}>
        {job.company.charAt(0)}
      </div>
    )
  }
  return (
    <img
      src={job.companyLogo}
      alt={job.company}
      className={className}
      onError={() => setError(true)}
    />
  )
}

export function FeaturedJobs() {
  const { data: jobs = [], isLoading } = useJobs({ take: 20 })
  const featured = jobs.filter((job: Job) => job.featured).slice(0, 3)
  const salary = (job: Job) => formatSalary(job.salaryMin, job.salaryMax, job.currency)

  return (
    <Section className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.07]">
        <img src="/featured-jobs.png" alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>
      <Container className="relative">
        <h2 className="text-[40px] leading-[1.15] tracking-[-0.8px] font-medium mb-8">
          Featured openings
        </h2>
        {isLoading ? (
          <SkeletonGrid count={3} columns={3} />
        ) : featured.length === 0 ? (
          <p className="text-ink-muted">No featured jobs right now. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((job) => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="hover:text-accent block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded-lg group">
                <Card variant="default" className="p-6 transition-transform duration-200 group-hover:scale-[1.02]">
                  <div className="flex items-center gap-2 mb-2">
                    <CompanyLogo job={job} className="w-6 h-6 rounded" />
                    <p className="text-sm font-medium text-ink-muted">{job.company}</p>
                  </div>
                  <h3 className="text-[22px] leading-[1.25] font-medium mb-2">{job.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-ink-muted mb-3">
                    <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                    {job.location}
                  </div>
                  {salary(job) && (
                    <p className="text-sm font-medium text-ink mb-3">
                      {salary(job)}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-surface-2 text-ink-muted">{tag}</span>
                    ))}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
        <Link to="/jobs" className="inline-block mt-8 text-accent font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded">
          View all jobs →
        </Link>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test:run src/components/home/__tests__/FeaturedJobs.test.tsx`
Expected: PASS — both tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/FeaturedJobs.tsx src/components/home/__tests__/FeaturedJobs.test.tsx
git commit -m "refactor(home): use useJobs hook in featured jobs section"
```

---

### Task 9: Employer read surfaces → `useEmployerJobsQuery` + `useCandidateProfileQuery`

**Files:**
- Create: `src/hooks/useEmployerJobsQuery.ts`
- Create: `src/hooks/__tests__/useEmployerJobsQuery.test.tsx`
- Create: `src/hooks/useCandidateProfileQuery.ts`
- Create: `src/hooks/__tests__/useCandidateProfileQuery.test.tsx`
- Modify: `src/components/employer-dashboard/JobListingsTab.tsx`
- Modify: `src/components/employer-dashboard/ApplicantsTab.tsx`
- Modify: `src/components/candidate/CandidateDetailDrawer.tsx`
- Create: `src/components/employer-dashboard/__tests__/JobListingsTab.test.tsx`
- Create: `src/components/employer-dashboard/__tests__/ApplicantsTab.test.tsx`
- Create: `src/components/candidate/__tests__/CandidateDetailDrawer.test.tsx`

**Interfaces:**
- Consumes: `listEmployerJobs() => Promise<ApiSuccess<Job[]>>` from `src/api/jobs`; `getCandidateProfile(applicationId: string) => Promise<ApiSuccess<{ application: Application; candidate: CandidateProfile }>>` from `src/api/applications`.
- Produces:
  - `useEmployerJobsQuery() => UseQueryResult<ApiSuccess<Job[]>>` — read `data.data` for `Job[]`
  - `useCandidateProfileQuery(applicationId: string, enabled: boolean) => UseQueryResult<ApiSuccess<{ application: Application; candidate: CandidateProfile }>>` — read `data.data.candidate`

- [ ] **Step 1: Write the failing hook tests**

Create `src/hooks/__tests__/useEmployerJobsQuery.test.tsx`:

```tsx
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useEmployerJobsQuery } from '../useEmployerJobsQuery'
import { listEmployerJobs } from '../../api/jobs'

vi.mock('../../api/jobs', () => ({
  listEmployerJobs: vi.fn(),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const mockJob = {
  id: 'j1',
  title: 'Engineer',
  company: 'Acme',
  companyLogo: '',
  location: 'Remote',
  remote: true,
  salaryMin: 100000,
  salaryMax: 150000,
  currency: 'USD',
  tags: ['React'],
  category: 'Engineering',
  seniority: 'senior',
  description: 'Build things',
  requirements: [],
  responsibilities: [],
  postedDate: '2026-01-01',
  featured: false,
}

describe('useEmployerJobsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns data after successful fetch', async () => {
    vi.mocked(listEmployerJobs).mockResolvedValue({
      data: [mockJob],
      pagination: { total: 1, cursor: null },
    })

    const { result } = renderHook(() => useEmployerJobsQuery(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.data).toEqual([mockJob])
  })

  it('returns error state when API fails', async () => {
    vi.mocked(listEmployerJobs).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useEmployerJobsQuery(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('Network error')
  })
})
```

Create `src/hooks/__tests__/useCandidateProfileQuery.test.tsx`:

```tsx
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useCandidateProfileQuery } from '../useCandidateProfileQuery'
import { getCandidateProfile } from '../../api/applications'

vi.mock('../../api/applications', () => ({
  getCandidateProfile: vi.fn(),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const mockApp = {
  id: 'a1',
  jobId: 'j1',
  jobTitle: 'Engineer',
  company: 'Acme',
  companyLogo: '',
  applicantName: 'Jane Doe',
  applicantEmail: 'jane@example.com',
  coverLetter: 'Hi',
  status: 'applied',
  submittedAt: '2026-01-01T00:00:00.000Z',
}

const mockCandidate = {
  id: 'c1',
  name: 'Jane Doe',
  email: 'jane@example.com',
  skills: ['React'],
  bio: 'Builder',
  createdAt: '2026-01-01',
}

describe('useCandidateProfileQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('is disabled when enabled is false', () => {
    const { result } = renderHook(() => useCandidateProfileQuery('a1', false), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(getCandidateProfile).not.toHaveBeenCalled()
  })

  it('returns the candidate after successful fetch', async () => {
    vi.mocked(getCandidateProfile).mockResolvedValue({
      data: { candidate: mockCandidate, application: mockApp },
    })

    const { result } = renderHook(() => useCandidateProfileQuery('a1', true), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.data.candidate).toEqual(mockCandidate)
    expect(getCandidateProfile).toHaveBeenCalledWith('a1')
  })
})
```

- [ ] **Step 2: Run the hook tests to verify they fail**

Run: `bun run test:run src/hooks/__tests__/useEmployerJobsQuery.test.tsx src/hooks/__tests__/useCandidateProfileQuery.test.tsx`
Expected: FAIL — `useEmployerJobsQuery` / `useCandidateProfileQuery` are not exported from their modules (modules don't exist yet).

- [ ] **Step 3: Implement the two hooks**

Create `src/hooks/useEmployerJobsQuery.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { listEmployerJobs } from '../api/jobs'

export function useEmployerJobsQuery() {
  return useQuery({
    queryKey: ['employerJobs'],
    queryFn: listEmployerJobs,
  })
}
```

Create `src/hooks/useCandidateProfileQuery.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { getCandidateProfile } from '../api/applications'

export function useCandidateProfileQuery(applicationId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['candidateProfile', applicationId],
    queryFn: () => getCandidateProfile(applicationId),
    enabled,
  })
}
```

- [ ] **Step 4: Run the hook tests to verify they pass**

Run: `bun run test:run src/hooks/__tests__/useEmployerJobsQuery.test.tsx src/hooks/__tests__/useCandidateProfileQuery.test.tsx`
Expected: PASS — 4 tests.

- [ ] **Step 5: Convert `JobListingsTab`**

Rewrite `src/components/employer-dashboard/JobListingsTab.tsx` to:

```tsx
import { motion } from 'framer-motion'
import { Briefcase, Eye, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, Tag } from '../ui'
import { SkeletonGrid } from '../ui/SkeletonGrid'
import { EmptyState } from '../ui/EmptyState'
import { ErrorState } from '../ui/ErrorState'
import { useEmployerJobsQuery } from '../../hooks/useEmployerJobsQuery'
import { useApp } from '../../context/AppContext'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

export function JobListingsTab() {
  const { applications } = useApp()
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useEmployerJobsQuery()

  const jobs = data?.data ?? []
  const error = isError ? 'Failed to load job listings.' : null

  function handleRetry() {
    refetch()
  }

  if (isLoading) {
    return <SkeletonGrid count={4} columns={2} />
  }

  if (error) {
    return <ErrorState message={error} onRetry={handleRetry} />
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={<Briefcase className="w-12 h-12" />}
        title="No job listings yet"
        description="Post your first job listing to start receiving applications."
        actionLabel="Post a job"
        onAction={() => navigate('/post-job')}
      />
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {jobs.map((job) => {
        const applicantCount = applications.filter((a) => a.jobId === job.id).length
        return (
          <motion.div key={job.id} variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
            <Card variant="default" className="p-5">
              <div className="flex items-start gap-4">
                <img src={job.companyLogo} alt={job.company} className="w-10 h-10 rounded-md bg-surface-2 object-contain flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link to={`/jobs/${job.id}`} className="text-base font-medium text-ink hover:text-accent transition-colors">{job.title}</Link>
                      <p className="text-sm text-ink-muted">{job.location} {job.remote ? '(Remote)' : ''}</p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <Link to="/employer/dashboard?tab=applicants" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors">
                        <Users className="w-4 h-4" aria-hidden="true" />
                        <span>{applicantCount} applicant{applicantCount !== 1 ? 's' : ''}</span>
                      </Link>
                      <Link to={`/jobs/${job.id}`} className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors">
                        <Eye className="w-4 h-4" aria-hidden="true" />
                        <span>View</span>
                      </Link>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Tag variant="category">{job.category}</Tag>
                    <Tag variant="seniority">{job.seniority}</Tag>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
```

- [ ] **Step 6: Convert `ApplicantsTab`**

Make these edits to `src/components/employer-dashboard/ApplicantsTab.tsx`:

Replace the top import block (lines 1-13) with:

```tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Users } from 'lucide-react'
import { Card } from '../ui'
import { SkeletonGrid } from '../ui/SkeletonGrid'
import { EmptyState } from '../ui/EmptyState'
import { ErrorState } from '../ui/ErrorState'
import { InterviewScheduleModal } from '../interview'
import { OfferLetterModal } from '../offer'
import { CandidateDetailDrawer } from '../candidate'
import { useEmployerJobsQuery } from '../../hooks/useEmployerJobsQuery'
import { useApplications } from '../../context/ApplicationsContext'
import type { Application, ApplicationStatus } from '../../types/application'
```

Replace the state/effect block (lines 28-49) with:

```tsx
export function ApplicantsTab() {
  const { applications: allApps, updateApplicationStatus: updateContextStatus } = useApplications()
  const { data, isLoading, isError, refetch } = useEmployerJobsQuery()
  const [interviewModalApp, setInterviewModalApp] = useState<Application | null>(null)
  const [offerModalApp, setOfferModalApp] = useState<Application | null>(null)
  const [viewApp, setViewApp] = useState<Application | null>(null)

  const employerJobIds = data?.data.map((job) => job.id) ?? []

  const apps = allApps.filter(app => employerJobIds.includes(app.jobId))

  async function handleStatusChange(id: string, status: ApplicationStatus) {
    updateContextStatus(id, status)
  }

  if (isLoading) {
    return (
      <SkeletonGrid count={4} columns={2} />
    )
  }

  if (isError) {
    return <ErrorState message="Failed to load jobs." onRetry={() => refetch()} />
  }
```

The rest of the file (from the `if (apps.length === 0)` empty-state block to the end) stays exactly as-is.

- [ ] **Step 7: Convert `CandidateDetailDrawer`**

Make these edits to `src/components/candidate/CandidateDetailDrawer.tsx`:

Replace the top import block (lines 1-11) with:

```tsx
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { X, FileText, Mail, Phone, Globe, MapPin, Calendar } from 'lucide-react'
import { Avatar, Button } from '../ui'
import { useToast } from '../ui/Toast'
import { resumeFileUrl, type CandidateProfile } from '../../api/applications'
import { useCandidateProfileQuery } from '../../hooks/useCandidateProfileQuery'
import { useApplications } from '../../context/ApplicationsContext'
import { InterviewScheduleModal, InterviewDetails } from '../interview'
import { OfferLetterModal } from '../offer'
import type { Application } from '../../types/application'
```

Replace the component state/effect block (lines 47-72) with:

```tsx
  const { data, isLoading, isError, refetch } = useCandidateProfileQuery(application.id, open)
  const [interviewOpen, setInterviewOpen] = useState(false)
  const [offerOpen, setOfferOpen] = useState(false)
  const { showToast } = useToast()
  const { updateApplicationStatus } = useApplications()

  const candidate = data?.data.candidate ?? null
  const error = isError ? 'Failed to load candidate profile.' : null
```

Replace the error retry button `onClick` (currently `onClick={() => window.location.reload()}` inside the `{error && ...}` block) with:

```tsx
                      <Button variant="accent" size="sm" className="mt-4" onClick={() => refetch()}>
                        Retry
                      </Button>
```

The rest of the component (render JSX from the `{candidate && !loading && (...)}` block down) stays as-is. Note `loading` is no longer a state variable — the JSX references `loading` in two places (`{loading && (...)}` and `{candidate && !loading && (...)}`). Rename them to `isLoading`:

Replace:

```tsx
                  {loading && (
                    <div className="flex items-center justify-center py-16 text-ink-muted text-sm">
                      Loading candidate profile…
                    </div>
                  )}
```

with:

```tsx
                  {isLoading && (
                    <div className="flex items-center justify-center py-16 text-ink-muted text-sm">
                      Loading candidate profile…
                    </div>
                  )}
```

and replace:

```tsx
                  {candidate && !loading && (
```

with:

```tsx
                  {candidate && !isLoading && (
```

Also replace the `useState, useEffect` import at the very top (`import { useState, useEffect } from 'react'`) with `import { useState } from 'react'`.

- [ ] **Step 8: Write the component tests**

Create `src/components/employer-dashboard/__tests__/JobListingsTab.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { JobListingsTab } from '../JobListingsTab'

vi.mock('../../../api/jobs', () => ({
  listEmployerJobs: vi.fn(),
}))

vi.mock('../../../context/AppContext', () => ({
  useApp: vi.fn(() => ({ applications: [] })),
}))

const mockJob = {
  id: 'j1',
  title: 'Engineer',
  company: 'Acme',
  companyLogo: '',
  location: 'Remote',
  remote: true,
  salaryMin: 100000,
  salaryMax: 150000,
  currency: 'USD',
  tags: ['React'],
  category: 'Engineering',
  seniority: 'senior',
  description: 'Build things',
  requirements: [],
  responsibilities: [],
  postedDate: '2026-01-01',
  featured: false,
}

function renderJobListingsTab() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <JobListingsTab />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('JobListingsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the skeleton while loading', async () => {
    const { listEmployerJobs } = await import('../../../api/jobs')
    ;(listEmployerJobs as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}))

    renderJobListingsTab()
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
  })

  it('renders empty state when there are no job listings', async () => {
    const { listEmployerJobs } = await import('../../../api/jobs')
    ;(listEmployerJobs as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [] })

    renderJobListingsTab()
    expect(await screen.findByText('No job listings yet')).toBeInTheDocument()
  })

  it('renders job listings when loaded', async () => {
    const { listEmployerJobs } = await import('../../../api/jobs')
    ;(listEmployerJobs as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [mockJob] })

    renderJobListingsTab()
    expect(await screen.findByText('Engineer')).toBeInTheDocument()
    expect(screen.getByText(/0 applicants?/i)).toBeInTheDocument()
  })
})
```

Create `src/components/employer-dashboard/__tests__/ApplicantsTab.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useApplications } from '../../../context/ApplicationsContext'
import { ApplicantsTab } from '../ApplicantsTab'

vi.mock('../../../api/jobs', () => ({
  listEmployerJobs: vi.fn(),
}))

vi.mock('../../../context/ApplicationsContext', () => ({
  useApplications: vi.fn(() => ({ applications: [], updateApplicationStatus: vi.fn() })),
}))

const mockJob = {
  id: 'j1',
  title: 'Engineer',
  company: 'Acme',
  companyLogo: '',
  location: 'Remote',
  remote: true,
  salaryMin: 100000,
  salaryMax: 150000,
  currency: 'USD',
  tags: ['React'],
  category: 'Engineering',
  seniority: 'senior',
  description: 'Build things',
  requirements: [],
  responsibilities: [],
  postedDate: '2026-01-01',
  featured: false,
}

const mockApp = {
  id: 'a1',
  jobId: 'j1',
  jobTitle: 'Engineer',
  company: 'Acme',
  companyLogo: '',
  applicantName: 'Jane Doe',
  applicantEmail: 'jane@example.com',
  coverLetter: 'Hi there',
  status: 'applied',
  submittedAt: '2026-01-01T00:00:00.000Z',
}

function renderApplicantsTab() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ApplicantsTab />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('ApplicantsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the skeleton while loading', async () => {
    const { listEmployerJobs } = await import('../../../api/jobs')
    ;(listEmployerJobs as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}))

    renderApplicantsTab()
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
  })

  it('renders applicants for employer jobs', async () => {
    const { listEmployerJobs } = await import('../../../api/jobs')
    ;(listEmployerJobs as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [mockJob] })
    vi.mocked(useApplications).mockReturnValue({
      applications: [mockApp],
      updateApplicationStatus: vi.fn(),
    })

    renderApplicantsTab()
    expect(await screen.findByText('Jane Doe')).toBeInTheDocument()
  })

  it('renders empty state when there are no matching applicants', async () => {
    const { listEmployerJobs } = await import('../../../api/jobs')
    ;(listEmployerJobs as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [mockJob] })
    vi.mocked(useApplications).mockReturnValue({
      applications: [],
      updateApplicationStatus: vi.fn(),
    })

    renderApplicantsTab()
    expect(await screen.findByText('No applicants yet')).toBeInTheDocument()
  })
})
```

Create `src/components/candidate/__tests__/CandidateDetailDrawer.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '../../../ui/Toast'
import { CandidateDetailDrawer } from '../CandidateDetailDrawer'

vi.mock('../../../api/applications', () => ({
  getCandidateProfile: vi.fn(),
  resumeFileUrl: vi.fn((path: string) => `https://example.com/${path}`),
}))

vi.mock('../../../context/ApplicationsContext', () => ({
  useApplications: vi.fn(() => ({ updateApplicationStatus: vi.fn() })),
}))

const mockApp = {
  id: 'a1',
  jobId: 'j1',
  jobTitle: 'Engineer',
  company: 'Acme',
  companyLogo: '',
  applicantName: 'Jane Doe',
  applicantEmail: 'jane@example.com',
  coverLetter: 'Hi there',
  status: 'applied',
  submittedAt: '2026-01-01T00:00:00.000Z',
}

const mockCandidate = {
  id: 'c1',
  name: 'Jane Doe',
  email: 'jane@example.com',
  skills: ['React'],
  bio: 'Builder',
  createdAt: '2026-01-01',
}

function renderDrawer(open = true) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <CandidateDetailDrawer
          application={mockApp}
          open={open}
          onOpenChange={vi.fn()}
          onActionComplete={vi.fn()}
        />
      </ToastProvider>
    </QueryClientProvider>
  )
}

describe('CandidateDetailDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not fetch while closed', async () => {
    const { getCandidateProfile } = await import('../../../api/applications')
    renderDrawer(false)
    expect(getCandidateProfile).not.toHaveBeenCalled()
  })

  it('renders candidate details after loading', async () => {
    const { getCandidateProfile } = await import('../../../api/applications')
    ;(getCandidateProfile as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { candidate: mockCandidate, application: mockApp },
    })

    renderDrawer()
    expect(await screen.findByText('Jane Doe')).toBeInTheDocument()
  })
})
```

- [ ] **Step 9: Run all new tests to verify they pass**

Run: `bun run test:run src/hooks/__tests__/useEmployerJobsQuery.test.tsx src/hooks/__tests__/useCandidateProfileQuery.test.tsx src/components/employer-dashboard/__tests__ src/components/candidate/__tests__`
Expected: PASS — 2 hook files (4 tests) + 6 component tests.

- [ ] **Step 10: Commit**

```bash
git add src/hooks/useEmployerJobsQuery.ts src/hooks/useCandidateProfileQuery.ts src/hooks/__tests__/useEmployerJobsQuery.test.tsx src/hooks/__tests__/useCandidateProfileQuery.test.tsx src/components/employer-dashboard/JobListingsTab.tsx src/components/employer-dashboard/ApplicantsTab.tsx src/components/candidate/CandidateDetailDrawer.tsx src/components/employer-dashboard/__tests__/JobListingsTab.test.tsx src/components/employer-dashboard/__tests__/ApplicantsTab.test.tsx src/components/candidate/__tests__/CandidateDetailDrawer.test.tsx
git commit -m "refactor(employers): use employer jobs and candidate profile query hooks"
```

---

### Task 10: Full verification, bundle check, and plan wrap-up

**Files:**
- Modify: `docs/exec-plans/active/frontend-hardening.md`
- Modify: `.superpowers/sdd/progress.md`

- [ ] **Step 1: Run the full test suite**

Run: `bun run test:run`
Expected: PASS — all suites green (baseline was 44 files / 181 tests; expect ~200+ now).

- [ ] **Step 2: Run the linter**

Run: `bun run lint`
Expected: No errors. (If the `react-hooks` or `@typescript-eslint` rules flag anything in the converted files, fix the exact line and re-run — do not add `eslint-disable` comments.)

- [ ] **Step 3: Run the production build**

Run: `bun run build`
Expected: `tsc -b && vite build` completes with no type errors and emits `dist/`.

- [ ] **Step 4: Record the bundle delta**

Run: `bun run build && npx vite-bundle-visualizer` (or open the generated `stats.html`/graph)
Expected: `JobBoardPage` chunk (baseline ~10.68 kB / 3.41 kB gz) should no longer grow — the infinite-query conversion removed the inline `loadJobs`/refs state. Note the biggest chunks and confirm no new per-page duplicate of Query logic appears. Record the sizes in the progress log.

- [ ] **Step 5: Update the Phase 5 progress log**

In `docs/exec-plans/active/frontend-hardening.md`, in the Phase 5 execution section (the numbered steps around lines 279-302), mark Step 4 (convert pages to hooks) and Step 6 (bundle analysis) done, and note the deferred surfaces (`MessagesTab`, `AdminPage`, `PricingSection`, `NotificationBell`, layout components).

In `.superpowers/sdd/progress.md`, add a `[x]` task row for each completed task 1-9 above with its commit range (e.g. `TanStack adoption tasks 1-9` + the commit hashes from `git log --oneline`), following the existing format of the file.

- [ ] **Step 6: Commit the docs**

```bash
git add docs/exec-plans/active/frontend-hardening.md .superpowers/sdd/progress.md
git commit -m "docs: mark Phase 5 TanStack query adoption complete"
```
