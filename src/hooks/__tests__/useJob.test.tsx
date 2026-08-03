import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useJob } from '../useJob'
import { getJobById } from '../../api/jobs'

vi.mock('../../api/jobs', () => ({
  getJobById: vi.fn(),
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
}

describe('useJob', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('is disabled when id is empty', () => {
    const { result } = renderHook(() => useJob(''), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
    expect(getJobById).not.toHaveBeenCalled()
  })

  it('returns data after successful fetch', async () => {
    vi.mocked(getJobById).mockResolvedValue({ data: mockJob })

    const { result } = renderHook(() => useJob('1'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockJob)
    expect(getJobById).toHaveBeenCalledWith('1')
  })

  it('returns error state when API fails', async () => {
    vi.mocked(getJobById).mockRejectedValue(new Error('Not found'))

    const { result } = renderHook(() => useJob('999'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('Not found')
  })
})
