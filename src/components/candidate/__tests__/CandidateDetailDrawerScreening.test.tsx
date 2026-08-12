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
  status: 'screening',
  submittedAt: '2026-01-01T00:00:00.000Z',
  screeningResult: { score: 8, maxPossible: 10 },
  screeningAnswers: [
    {
      questionId: 'q1',
      answerText: 'Five years building React apps',
      score: 8,
      question: {
        prompt: 'Describe your React experience',
        expectedKeywords: ['react'],
        maxScore: 10,
      },
    },
  ],
  timeline: [
    {
      id: 't1',
      fromStatus: 'applied',
      toStatus: 'screening',
      actorRole: 'EMPLOYER',
      createdAt: '2026-07-02T12:00:00.000Z',
    },
    {
      id: 't2',
      fromStatus: null,
      toStatus: 'applied',
      actorRole: 'SEEKER',
      createdAt: '2026-07-01T12:00:00.000Z',
    },
  ],
}

const mockCandidate = {
  id: 'c1',
  name: 'Jane Doe',
  email: 'jane@example.com',
  skills: ['React'],
  bio: 'Builder',
  createdAt: '2026-01-01',
}

function renderDrawer() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <CandidateDetailDrawer
          application={mockApp}
          open
          onOpenChange={vi.fn()}
          onActionComplete={vi.fn()}
        />
      </ToastProvider>
    </QueryClientProvider>
  )
}

describe('CandidateDetailDrawer screening + timeline', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders screening score, per-answer rows, and status timeline', async () => {
    const { getCandidateProfile } = await import('../../../api/applications')
    ;(getCandidateProfile as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { candidate: mockCandidate, application: mockApp },
    })

    renderDrawer()
    expect(await screen.findByText('Jane Doe')).toBeInTheDocument()

    expect(screen.getByText('Screening')).toBeInTheDocument()
    expect(screen.getByText('8 / 10')).toBeInTheDocument()
    expect(screen.getByText('Describe your React experience')).toBeInTheDocument()
    expect(screen.getByText('Five years building React apps')).toBeInTheDocument()
    expect(screen.getByText('8 pts')).toBeInTheDocument()

    expect(screen.getByText('Timeline')).toBeInTheDocument()
    expect(screen.getByText('Submitted → Applied')).toBeInTheDocument()
    expect(screen.getByText('Applied → Screening')).toBeInTheDocument()
    expect(screen.getByText('Seeker')).toBeInTheDocument()
    expect(screen.getByText('Employer')).toBeInTheDocument()
    expect(screen.getByText('Jul 1, 2026')).toBeInTheDocument()
    expect(screen.getByText('Jul 2, 2026')).toBeInTheDocument()
  })
})
