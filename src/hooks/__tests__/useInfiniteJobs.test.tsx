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
      take: 12,
    })
  })

  it('forwards search params and the pagination cursor', async () => {
    vi.mocked(listJobs).mockResolvedValueOnce({
      data: [jobA],
      pagination: { total: 2, cursor: 'page-2' },
    })
    vi.mocked(listJobs).mockResolvedValueOnce({
      data: [jobB],
      pagination: { total: 2, cursor: null },
    })

    const { result } = renderHook(
      () => useInfiniteJobs({ search: 'react', location: 'austin', sort: 'salary_high' }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.data?.jobs).toHaveLength(1)
    })

    expect(listJobs).toHaveBeenCalledWith({
      search: 'react',
      location: 'austin',
      sort: 'salary_high',
      take: 12,
    })

    await act(async () => {
      await result.current.fetchNextPage()
    })

    await waitFor(() => {
      expect(result.current.data?.jobs).toEqual([jobA, jobB])
    })

    expect(result.current.hasNextPage).toBe(false)
    expect(listJobs).toHaveBeenLastCalledWith({
      search: 'react',
      location: 'austin',
      sort: 'salary_high',
      take: 12,
      cursor: 'page-2',
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
      take: 12,
      cursor: 'page-2',
    })
  })
})
