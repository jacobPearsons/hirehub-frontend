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
