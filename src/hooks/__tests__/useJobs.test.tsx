import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useJobs } from '../useJobs'
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

const mockJobs = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'Acme',
    location: 'Remote',
    remote: true,
    currency: 'USD',
    category: 'Engineering',
    seniority: 'Mid',
    tags: ['React', 'TypeScript'],
    description: 'Build UI',
    requirements: ['3 years exp'],
    responsibilities: ['Develop features'],
  },
]

describe('useJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns loading state initially', () => {
    vi.mocked(listJobs).mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('returns data after successful fetch', async () => {
    vi.mocked(listJobs).mockResolvedValue(mockJobs)

    const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockJobs)
  })

  it('returns error state when API fails', async () => {
    vi.mocked(listJobs).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('Network error')
  })
})
