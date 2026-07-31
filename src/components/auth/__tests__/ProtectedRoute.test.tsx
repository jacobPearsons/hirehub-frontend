import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useApp } from '../../../context/AppContext'
import { ProtectedRoute } from '../ProtectedRoute'

vi.mock('../../../context/AppContext', () => ({
  useApp: vi.fn(),
}))

const mockedUseApp = useApp as ReturnType<typeof vi.fn>

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Dashboard content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login page</div>} />
        <Route path="/onboarding" element={<div>Onboarding page</div>} />
        <Route path="/" element={<div>Home page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockedUseApp.mockReturnValue({ user: null, loading: false })
  })

  it('shows a loading spinner while the app is loading', () => {
    mockedUseApp.mockReturnValue({ user: null, loading: true })
    renderAt('/dashboard')
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('redirects to /login when there is no user', () => {
    renderAt('/dashboard')
    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard content')).not.toBeInTheDocument()
  })

  it('redirects to /onboarding when the user has not completed onboarding', () => {
    mockedUseApp.mockReturnValue({
      user: { id: 'u1', name: 'Seeker', email: 's@test.com', role: 'seeker' },
      loading: false,
    })
    renderAt('/dashboard')
    expect(screen.getByText('Onboarding page')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard content')).not.toBeInTheDocument()
  })

  it('renders children when the user has completed onboarding', () => {
    mockedUseApp.mockReturnValue({
      user: { id: 'u1', name: 'Seeker', email: 's@test.com', role: 'seeker', onboardingCompleted: true },
      loading: false,
    })
    renderAt('/dashboard')
    expect(screen.getByText('Dashboard content')).toBeInTheDocument()
  })

  it('redirects to / when the role is not allowed', () => {
    mockedUseApp.mockReturnValue({
      user: { id: 'u1', name: 'Seeker', email: 's@test.com', role: 'seeker', onboardingCompleted: true },
      loading: false,
    })
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <div>Dashboard content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<div>Home page</div>} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('Home page')).toBeInTheDocument()
  })
})
