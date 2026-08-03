import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FeaturedJobs } from '../FeaturedJobs'

vi.mock('../../../api/jobs', () => ({
  listJobs: vi.fn(),
}))

const makeJob = (id: string, title: string, featured: boolean) => ({
  id,
  title,
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
  featured,
})

function renderFeaturedJobs() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <FeaturedJobs />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('FeaturedJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the skeleton while loading', async () => {
    const { listJobs } = await import('../../../api/jobs')
    ;(listJobs as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}))

    renderFeaturedJobs()
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
  })

  it('renders only featured jobs', async () => {
    const { listJobs } = await import('../../../api/jobs')
    ;(listJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [
        makeJob('1', 'Featured One', true),
        makeJob('2', 'Featured Two', true),
        makeJob('3', 'Regular Three', false),
      ],
      pagination: { total: 3, cursor: null },
    })

    renderFeaturedJobs()
    expect(await screen.findByText('Featured One')).toBeInTheDocument()
    expect(screen.getByText('Featured Two')).toBeInTheDocument()
    expect(screen.queryByText('Regular Three')).not.toBeInTheDocument()
  })
})
