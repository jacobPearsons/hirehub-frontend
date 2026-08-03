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
