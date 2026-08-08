import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useJobFacets } from '../useJobFacets'
import { useJobTags } from '../useJobTags'
import { getJobFacets, searchJobTags } from '../../api/jobs'

vi.mock('../../api/jobs', () => ({
  getJobFacets: vi.fn(),
  searchJobTags: vi.fn(),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useJobFacets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns loading state initially', () => {
    vi.mocked(getJobFacets).mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useJobFacets(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('returns facets data after successful fetch', async () => {
    const facets = {
      categories: [{ name: 'Engineering', count: 4 }],
      seniorities: [{ name: 'Senior', count: 3 }],
      locations: [{ name: 'Austin', count: 2 }],
      remote: { true: 5, false: 2 },
    }
    vi.mocked(getJobFacets).mockResolvedValue(facets)

    const { result } = renderHook(() => useJobFacets(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(facets)
    expect(getJobFacets).toHaveBeenCalledTimes(1)
  })
})

describe('useJobTags', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('is disabled when q is empty', () => {
    const { result } = renderHook(() => useJobTags(''), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
    expect(searchJobTags).not.toHaveBeenCalled()
  })

  it('returns tags for a query after successful fetch', async () => {
    const tags = [
      { name: 'React', count: 10 },
      { name: 'React Native', count: 4 },
    ]
    vi.mocked(searchJobTags).mockResolvedValue(tags)

    const { result } = renderHook(() => useJobTags('react'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(tags)
    expect(searchJobTags).toHaveBeenCalledWith('react')
  })
})
