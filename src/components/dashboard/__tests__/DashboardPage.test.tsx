import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from '../DashboardPage'

vi.mock('../../../context/AppContext', () => ({
  useApp: () => ({ user: null }),
}))

vi.mock('../../../utils/usePageMeta', () => ({
  usePageMeta: vi.fn(),
}))

vi.mock('../OverviewTab', () => ({ OverviewTab: () => <div>OverviewTab</div> }))
vi.mock('../SavedJobsTab', () => ({ SavedJobsTab: () => <div>SavedJobsTab</div> }))
vi.mock('../ApplicationsTab', () => ({ ApplicationsTab: () => <div>ApplicationsTab</div> }))

function renderDashboardPage(initialEntry = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <DashboardPage />
    </MemoryRouter>,
  )
}

describe('DashboardPage header', () => {
  it('shows Overview heading by default', () => {
    renderDashboardPage()
    expect(screen.getByRole('heading', { name: /overview/i, level: 1 })).toBeInTheDocument()
  })

  it('shows Saved Jobs heading when tab=saved', () => {
    renderDashboardPage('/dashboard?tab=saved')
    expect(screen.getByRole('heading', { name: /saved jobs/i, level: 1 })).toBeInTheDocument()
  })

  it('shows My Applications heading when tab=applications', () => {
    renderDashboardPage('/dashboard?tab=applications')
    expect(screen.getByRole('heading', { name: /my applications/i, level: 1 })).toBeInTheDocument()
  })
})

describe('DashboardPage tabs', () => {
  it('renders tab bar with Saved Jobs and My Applications tabs', () => {
    renderDashboardPage()
    expect(screen.getByRole('tab', { name: /saved jobs/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /my applications/i })).toBeInTheDocument()
  })

  it('defaults to Overview tab', () => {
    renderDashboardPage()
    expect(screen.getByRole('tab', { name: /overview/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /saved jobs/i })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('tab', { name: /my applications/i })).toHaveAttribute('aria-selected', 'false')
  })
})
