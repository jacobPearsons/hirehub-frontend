import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../../../context/ThemeContext'
import { OverviewTab } from '../OverviewTab'

const mockState = {
  applications: [
    { id: 'a1', status: 'applied' },
    { id: 'a2', status: 'interviewing' },
    { id: 'a3', status: 'offer' },
  ],
}

vi.mock('../../../context/ApplicationsContext', () => ({
  useApplications: () => ({ applications: mockState.applications }),
}))

vi.mock('../../../context/AppContext', () => ({
  useApp: () => ({ user: null, savedJobIds: ['j1', 'j2'] }),
}))

function renderOverviewTab() {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <OverviewTab />
      </ThemeProvider>
    </MemoryRouter>,
  )
}

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

describe('OverviewTab counts', () => {
  it('renders applications, saved jobs, and interviews counts', () => {
    renderOverviewTab()
    expect(screen.getByText('3')).toBeInTheDocument() // applications
    expect(screen.getByText('2')).toBeInTheDocument() // saved jobs
    expect(screen.getByText('1')).toBeInTheDocument() // interviewing
  })

  it('renders stat card links with correct destinations', () => {
    renderOverviewTab()
    const savedLink = screen.getByRole('link', { name: /Saved Jobs/i })
    expect(savedLink).toHaveAttribute('href', '/dashboard?tab=saved')
    const interviewsLink = screen.getByRole('link', { name: /Interviews/i })
    expect(interviewsLink).toHaveAttribute('href', '/dashboard?tab=applications')
    const applicationsLink = screen.getByRole('link', { name: /Applications/i })
    expect(applicationsLink).toHaveAttribute('href', '/dashboard?tab=applications')
  })

  it('renders counts safely when applications is undefined', () => {
    mockState.applications = undefined
    renderOverviewTab()
    expect(screen.getAllByText('0')).toHaveLength(2) // applications + interviewing fallback
    expect(screen.getByText('2')).toBeInTheDocument() // saved jobs
  })

  it('renders the decorative grid background image', () => {
    renderOverviewTab()
    const bg = screen.getByAltText('')
    expect(bg).toHaveAttribute('src', '/overview-grid-bg.svg')
    expect(bg).toHaveAttribute('aria-hidden', 'true')
  })
})
