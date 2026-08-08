import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '../../ui/Toast'
import JobBoardPage from '../JobBoardPage'
import { listJobs, getJobFacets } from '../../../api/jobs'

vi.mock('../../../api/jobs', () => ({
  listJobs: vi.fn(),
  getJobFacets: vi.fn(),
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

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="current-location">{location.pathname}{location.search}</div>
}

const emptyFacets = {
  categories: [],
  seniorities: [],
  locations: [],
  remote: { true: 0, false: 0 },
}

function renderJobBoardPage(initialUrl = '/jobs') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  ;(listJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
    data: [],
    pagination: { total: 0, cursor: null },
  })
  ;(getJobFacets as ReturnType<typeof vi.fn>).mockResolvedValue(emptyFacets)
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialUrl]}>
        <ToastProvider>
          <JobBoardPage />
          <LocationProbe />
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('JobBoardPage URL sync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reads filters from the URL on initial load', async () => {
    renderJobBoardPage(
      '/jobs?search=react&location=austin&category=Engineering&seniority=senior&remote=true&sort=salary_high',
    )

    await waitFor(() => {
      expect(listJobs).toHaveBeenCalled()
    })

    const params = (listJobs as ReturnType<typeof vi.fn>).mock.calls.at(-1)?.[0] as Record<string, unknown>
    expect(params).toMatchObject({
      search: 'react',
      location: 'austin',
      category: 'Engineering',
      seniority: 'senior',
      remote: 'true',
      sort: 'salary_high',
    })
  })

  it('defaults sort to recent when absent from the URL', async () => {
    renderJobBoardPage('/jobs')

    await waitFor(() => {
      expect(listJobs).toHaveBeenCalled()
    })

    const params = (listJobs as ReturnType<typeof vi.fn>).mock.calls.at(-1)?.[0] as Record<string, unknown>
    expect(params).toMatchObject({ sort: 'recent' })
  })

  it('updates the URL when the keyword changes', async () => {
    renderJobBoardPage('/jobs')

    const searchInputs = screen.getAllByPlaceholderText('Search jobs...')
    await userEvent.type(searchInputs[0], 'react')

    await waitFor(() => {
      expect(screen.getByTestId('current-location')).toHaveTextContent('search=react')
    })
  })

  it('removing an active filter chip clears the matching URL param', async () => {
    renderJobBoardPage('/jobs?category=Engineering&seniority=senior&location=Austin&remote=true')

    const chip = await screen.findByRole('button', { name: 'Remove Engineering filter' })
    await userEvent.click(chip)

    await waitFor(() => {
      const probe = screen.getByTestId('current-location')
      expect(probe).not.toHaveTextContent('category=Engineering')
      expect(probe).toHaveTextContent('seniority=senior')
    })
  })
})
