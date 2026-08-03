import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApplicationsTab } from '../ApplicationsTab'

vi.mock('../../../api/applications', () => ({
  listApplications: vi.fn(),
}))

vi.mock('../ApplicationCard', () => ({
  ApplicationCard: ({ application }: { application: { jobTitle: string; company: string } }) => (
    <div>
      <h3>{application.jobTitle}</h3>
      <p>{application.company}</p>
    </div>
  ),
}))

const mockApp = {
  id: 'a1',
  jobId: 'j1',
  jobTitle: 'Frontend Engineer',
  company: 'Acme',
  companyLogo: '',
  applicantName: 'Jane Doe',
  applicantEmail: 'jane@example.com',
  coverLetter: 'Hi there',
  status: 'applied',
  submittedAt: '2026-01-01T00:00:00.000Z',
}

function renderApplicationsTab() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <ApplicationsTab />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('ApplicationsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the skeleton while loading', async () => {
    const { listApplications } = await import('../../../api/applications')
    ;(listApplications as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}))

    renderApplicationsTab()
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
  })

  it('renders empty state when there are no applications', async () => {
    const { listApplications } = await import('../../../api/applications')
    ;(listApplications as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [] })

    renderApplicationsTab()
    expect(await screen.findByText('No applications yet')).toBeInTheDocument()
  })

  it('renders applications when loaded', async () => {
    const { listApplications } = await import('../../../api/applications')
    ;(listApplications as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [mockApp] })

    renderApplicationsTab()
    expect(await screen.findByRole('heading', { name: 'Frontend Engineer' })).toBeInTheDocument()
    expect(screen.getByText('Acme')).toBeInTheDocument()
  })
})
