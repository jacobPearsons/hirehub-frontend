import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import EmployerDashboardPage from '../EmployerDashboardPage'

vi.mock('../../../context/AppContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../context/AppContext')>()
  return {
    ...actual,
    useApp: vi.fn(() => ({
      user: { id: '1', name: 'Employer User', role: 'employer' },
      setUser: vi.fn(),
    })),
  }
})

vi.mock('../../../utils/usePageMeta', () => ({
  usePageMeta: vi.fn(),
}))

vi.mock('../../../api/jobs', () => ({
  listJobs: vi.fn(),
  listEmployerJobs: vi.fn().mockResolvedValue({ data: [] }),
}))

vi.mock('../../../api/applications', () => ({
  listApplications: vi.fn(),
}))

function renderEmployerDashboardPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/employer-dashboard']}>
        <EmployerDashboardPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('EmployerDashboardPage', () => {
  it('renders Employer Dashboard heading', () => {
    renderEmployerDashboardPage()
    expect(screen.getByRole('heading', { name: /employer dashboard/i })).toBeInTheDocument()
  })

  it('renders tab bar with Job Listings and Applicants tabs', () => {
    renderEmployerDashboardPage()
    expect(screen.getByRole('tab', { name: /job listings/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /applicants/i })).toBeInTheDocument()
  })

  it('renders a Messages tab for chatting with the HireHub team', () => {
    renderEmployerDashboardPage()
    expect(screen.getByRole('tab', { name: /messages/i })).toBeInTheDocument()
  })

  it('defaults to Job Listings tab', () => {
    renderEmployerDashboardPage()
    expect(screen.getByRole('tab', { name: /job listings/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /applicants/i })).toHaveAttribute('aria-selected', 'false')
  })
})
