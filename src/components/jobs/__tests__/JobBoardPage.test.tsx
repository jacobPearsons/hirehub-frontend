import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '../../ui/Toast'
import JobBoardPage from '../JobBoardPage'

vi.mock('../../../api/jobs', () => ({
  listJobs: vi.fn(),
}))

vi.mock('../../../context/AppContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../context/AppContext')>()
  return {
    ...actual,
    useApp: vi.fn(() => ({
      isSaved: vi.fn(() => false),
      toggleSaveJob: vi.fn(),
    })),
  }
})

vi.mock('../../../utils/usePageMeta', () => ({
  usePageMeta: vi.fn(),
}))

function renderJobBoardPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/jobs']}>
        <ToastProvider>
          <JobBoardPage />
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
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
    expect(screen.getAllByPlaceholderText('Search jobs...').length).toBeGreaterThanOrEqual(1)
  })

  it('renders filter options for category, seniority, and remote', async () => {
    const { listJobs } = await import('../../../api/jobs')
    ;(listJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      pagination: { total: 0, cursor: null },
    })

    renderJobBoardPage()
    expect(await screen.findByText('Category')).toBeInTheDocument()
    expect(await screen.findByText('Seniority')).toBeInTheDocument()
    expect(await screen.findByText('Location')).toBeInTheDocument()
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
    expect((await screen.findAllByText(/no jobs match/i)).length).toBeGreaterThanOrEqual(1)
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
    expect((await screen.findAllByText('Frontend Engineer')).length).toBeGreaterThanOrEqual(1)
  })

  it('loads more jobs when clicking load more', async () => {
    const { listJobs } = await import('../../../api/jobs')
    const pageOneJob = {
      id: '1',
      title: 'Engineer One',
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
    const pageTwoJob = { ...pageOneJob, id: '2', title: 'Engineer Two' }
    ;(listJobs as ReturnType<typeof vi.fn>).mockImplementation((params?: { cursor?: string }) =>
      params?.cursor
        ? Promise.resolve({ data: [pageTwoJob], pagination: { total: 2, cursor: null } })
        : Promise.resolve({ data: [pageOneJob], pagination: { total: 2, cursor: 'page-2' } })
    )

    renderJobBoardPage()
    const [loadMore] = await screen.findAllByRole('button', { name: /load more/i })
    await userEvent.click(loadMore)

    expect((await screen.findAllByText('Engineer Two')).length).toBeGreaterThanOrEqual(1)
  })
})
