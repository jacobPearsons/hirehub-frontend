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
