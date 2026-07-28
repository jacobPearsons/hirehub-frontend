import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from '../DashboardPage'

vi.mock('../../../context/AppContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../context/AppContext')>()
  return {
    ...actual,
    useApp: vi.fn(() => ({
      user: null,
      setUser: vi.fn(),
    })),
  }
})

vi.mock('../../../utils/usePageMeta', () => ({
  usePageMeta: vi.fn(),
}))

function renderDashboardPage() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <DashboardPage />
    </MemoryRouter>
  )
}

describe('DashboardPage', () => {
  it('renders Dashboard heading', () => {
    renderDashboardPage()
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
  })

  it('renders tab bar with Saved Jobs and My Applications tabs', () => {
    renderDashboardPage()
    expect(screen.getByRole('tab', { name: /saved jobs/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /my applications/i })).toBeInTheDocument()
  })

  it('defaults to Saved Jobs tab', () => {
    renderDashboardPage()
    expect(screen.getByRole('tab', { name: /saved jobs/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /my applications/i })).toHaveAttribute('aria-selected', 'false')
  })
})
