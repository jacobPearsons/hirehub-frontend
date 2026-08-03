import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ToastProvider } from '../../ui/Toast'
import LoginPage from '../LoginPage'

const { setUserMock } = vi.hoisted(() => ({ setUserMock: vi.fn() }))

vi.mock('../../../api/auth', () => ({
  login: vi.fn(),
}))

vi.mock('../../../api/client', () => ({
  setAccessToken: vi.fn(),
}))

vi.mock('../../../context/AppContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../context/AppContext')>()
  return {
    ...actual,
    useApp: vi.fn(() => ({
      user: null,
      setUser: setUserMock,
    })),
  }
})

vi.mock('../../../utils/usePageMeta', () => ({
  usePageMeta: vi.fn(),
}))

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <ToastProvider>
        <LoginPage />
      </ToastProvider>
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  it('renders email and password inputs', () => {
    renderLoginPage()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('renders login button', () => {
    renderLoginPage()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders forgot password link', () => {
    renderLoginPage()
    expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument()
  })

  it('renders signup link', () => {
    renderLoginPage()
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument()
  })

  it('shows loading state on submit', async () => {
    const { login } = await import('../../../api/auth')
    ;(login as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}) // never resolves
    )

    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })

  it('calls setUser with onboardingCompleted from the login response', async () => {
    const { login } = await import('../../../api/auth')
    ;(login as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        user: {
          id: 'u1',
          name: 'Jane Doe',
          email: 'jane@test.com',
          role: 'SEEKER',
          onboardingCompleted: true,
        },
        accessToken: 'token',
      },
    })

    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText('Email'), 'jane@test.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(setUserMock).toHaveBeenCalledWith(
      expect.objectContaining({ onboardingCompleted: true })
    )
    expect(setUserMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Jane Doe' })
    )
  })
})
