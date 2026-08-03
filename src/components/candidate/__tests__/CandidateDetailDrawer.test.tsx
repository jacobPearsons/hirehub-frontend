import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '../../ui/Toast'
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
