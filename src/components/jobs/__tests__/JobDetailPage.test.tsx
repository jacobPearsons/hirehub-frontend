import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ToastProvider } from '../../ui/Toast'
import JobDetailPage from '../JobDetailPage'

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useParams: vi.fn(() => ({ id: 'test-id' })),
  }
})

vi.mock('../../../api/jobs', () => ({
  getJobById: vi.fn(),
}))

vi.mock('../../../utils/usePageMeta', () => ({
  usePageMeta: vi.fn(),
}))

vi.mock('../JobHeader', () => ({
  JobHeader: ({ job }: { job: { title: string; company: string } }) => (
    <div data-testid="job-header">
      <h2>{job.title}</h2>
      <p>{job.company}</p>
    </div>
  ),
}))

vi.mock('../JobBody', () => ({
  JobBody: ({ job }: { job: { description: string } }) => (
    <div data-testid="job-body">{job.description}</div>
  ),
}))

vi.mock('../SaveButton', () => ({
  SaveButton: () => <button>Save</button>,
}))

const mockJob = {
  id: 'test-id',
  title: 'Senior Engineer',
  company: 'Acme Corp',
  companyLogo: '',
  location: 'Remote',
  remote: true,
  salaryMin: 120000,
  salaryMax: 180000,
  currency: 'USD',
  tags: ['React', 'TypeScript'],
  category: 'Engineering',
  seniority: 'senior',
  description: 'Build amazing products',
  requirements: [],
  responsibilities: [],
  postedDate: '2026-01-01',
  featured: false,
}

function renderJobDetailPage() {
  return render(
    <MemoryRouter initialEntries={['/jobs/test-id']}>
      <ToastProvider>
        <JobDetailPage />
      </ToastProvider>
    </MemoryRouter>
  )
}

describe('JobDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', async () => {
    const { getJobById } = await import('../../../api/jobs')
    ;(getJobById as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    )

    renderJobDetailPage()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders job details when loaded', async () => {
    const { getJobById } = await import('../../../api/jobs')
    ;(getJobById as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockJob })

    renderJobDetailPage()
    expect(await screen.findByRole('heading', { name: 'Senior Engineer' })).toBeInTheDocument()
    expect(screen.getAllByText('Acme Corp').length).toBeGreaterThan(0)
    expect(screen.getByText('Build amazing products')).toBeInTheDocument()
  })

  it('renders Apply Now button', async () => {
    const { getJobById } = await import('../../../api/jobs')
    ;(getJobById as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockJob })

    renderJobDetailPage()
    expect(await screen.findByRole('button', { name: /apply now/i })).toBeInTheDocument()
  })

  it('shows an expired banner when the job is past expiry', async () => {
    const { getJobById } = await import('../../../api/jobs')
    ;(getJobById as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { ...mockJob, expiresAt: '2020-01-01T00:00:00.000Z' },
    })

    renderJobDetailPage()
    expect(await screen.findByText(/this job has expired/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /apply now/i })).not.toBeInTheDocument()
  })

  it('renders "Job not found" state when API returns error', async () => {
    const { getJobById } = await import('../../../api/jobs')
    ;(getJobById as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Not found')
    )

    renderJobDetailPage()
    expect(await screen.findByRole('heading', { name: /job not found/i })).toBeInTheDocument()
    expect(screen.getByText(/doesn't exist or has been removed/i)).toBeInTheDocument()
  })
})
