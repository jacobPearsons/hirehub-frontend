import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ToastProvider } from '../../ui/Toast'
import JobBoardPage from '../JobBoardPage'

vi.mock('../../../api/jobs', () => ({
  listJobs: vi.fn(),
}))

vi.mock('../../../utils/usePageMeta', () => ({
  usePageMeta: vi.fn(),
}))

function renderJobBoardPage() {
  return render(
    <MemoryRouter initialEntries={['/jobs']}>
      <ToastProvider>
        <JobBoardPage />
      </ToastProvider>
    </MemoryRouter>
  )
}

describe('JobBoardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the heading "Job Board"', async () => {
    const { listJobs } = await import('../../../api/jobs')
    ;(listJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      pagination: { total: 0, cursor: null },
    })

    renderJobBoardPage()
    expect(screen.getByRole('heading', { name: /job board/i })).toBeInTheDocument()
  })

  it('renders a search bar', async () => {
    const { listJobs } = await import('../../../api/jobs')
    ;(listJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      pagination: { total: 0, cursor: null },
    })

    renderJobBoardPage()
    expect(screen.getByPlaceholderText('Search jobs...')).toBeInTheDocument()
  })

  it('renders filter options for category, seniority, and remote', async () => {
    const { listJobs } = await import('../../../api/jobs')
    ;(listJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      pagination: { total: 0, cursor: null },
    })

    renderJobBoardPage()
    expect(screen.getByText('Category')).toBeInTheDocument()
    expect(screen.getByText('Seniority')).toBeInTheDocument()
    expect(screen.getByText('Location')).toBeInTheDocument()
  })

  it('shows loading state initially', async () => {
    const { listJobs } = await import('../../../api/jobs')
    ;(listJobs as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    )

    renderJobBoardPage()
    expect(screen.getByText('Loading jobs...')).toBeInTheDocument()
  })

  it('renders empty state when no jobs are returned', async () => {
    const { listJobs } = await import('../../../api/jobs')
    ;(listJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      pagination: { total: 0, cursor: null },
    })

    renderJobBoardPage()
    expect(await screen.findByText(/no jobs match/i)).toBeInTheDocument()
  })

  it('renders job cards when jobs are returned', async () => {
    const { listJobs } = await import('../../../api/jobs')
    ;(listJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [
        {
          id: '1',
          title: 'Frontend Engineer',
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
        },
      ],
      pagination: { total: 1, cursor: null },
    })

    renderJobBoardPage()
    expect(await screen.findByText('Frontend Engineer')).toBeInTheDocument()
  })
})
