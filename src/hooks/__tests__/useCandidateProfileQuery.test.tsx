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
