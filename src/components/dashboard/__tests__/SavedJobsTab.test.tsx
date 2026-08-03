import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useApp } from '../../../context/AppContext'
import { SavedJobsTab } from '../SavedJobsTab'

vi.mock('../../../context/AppContext', () => ({
  useApp: vi.fn(),
}))

vi.mock('../../../api/savedJobs', () => ({
  listSavedJobs: vi.fn(),
}))

vi.mock('../../jobs/JobCard', () => ({
  JobCard: ({ job }: { job: { title: string } }) => <div>{job.title}</div>,
}))

const mockJob = {
  id: 'j1',
  title: 'Saved Engineer',
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

function renderSavedJobsTab(queryClient: QueryClient) {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <SavedJobsTab />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

function createClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

describe('SavedJobsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useApp).mockReturnValue({ savedJobIds: [] } as ReturnType<typeof useApp>)
  })

  it('renders saved jobs when loaded', async () => {
    const { listSavedJobs } = await import('../../../api/savedJobs')
    ;(listSavedJobs as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [mockJob] })

    renderSavedJobsTab(createClient())
    expect(await screen.findByText('Saved Engineer')).toBeInTheDocument()
  })

  it('renders empty state when there are no saved jobs', async () => {
    const { listSavedJobs } = await import('../../../api/savedJobs')
    ;(listSavedJobs as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [] })

    renderSavedJobsTab(createClient())
    expect(await screen.findByText('No saved jobs yet')).toBeInTheDocument()
  })

  it('refetches saved jobs when the saved ids change', async () => {
    vi.mocked(useApp).mockReturnValue({ savedJobIds: [] } as ReturnType<typeof useApp>)
    const { listSavedJobs } = await import('../../../api/savedJobs')
    ;(listSavedJobs as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [] })

    const queryClient = createClient()
    const { rerender } = renderSavedJobsTab(queryClient)
    await screen.findByText('No saved jobs yet')
    expect(listSavedJobs).toHaveBeenCalledTimes(1)

    vi.mocked(useApp).mockReturnValue({ savedJobIds: ['j1'] } as ReturnType<typeof useApp>)
    rerender(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <SavedJobsTab />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => expect(listSavedJobs).toHaveBeenCalledTimes(2))
  })
})
