import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Layout from '../Layout'
import { AppProvider } from '../../../context/AppContext'
import { NotificationsProvider } from '../../../context/NotificationsContext'
import { ThemeProvider } from '../../../context/ThemeContext'
import { ToastProvider } from '../../ui/Toast'

function renderAt(pathname: string) {
  return render(
    <AppProvider>
      <ToastProvider>
        <ThemeProvider>
          <NotificationsProvider>
            <MemoryRouter initialEntries={[pathname]}>
              <Layout>
                <div>page body</div>
              </Layout>
            </MemoryRouter>
          </NotificationsProvider>
        </ThemeProvider>
      </ToastProvider>
    </AppProvider>,
  )
}

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })
})

describe('Layout chrome', () => {
  it('renders Navbar and Footer on public pages', () => {
    renderAt('/jobs')
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('hides Navbar and Footer on /login', () => {
    renderAt('/login')
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
  })

  it('hides Navbar and Footer on /signup', () => {
    renderAt('/signup')
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
  })

  it('hides Navbar and Footer on /forgot-password', () => {
    renderAt('/forgot-password')
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
  })

  it('hides Navbar and Footer on /reset-password', () => {
    renderAt('/reset-password')
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
  })

  it('hides Navbar and Footer on /onboarding', () => {
    renderAt('/onboarding')
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
  })
})
