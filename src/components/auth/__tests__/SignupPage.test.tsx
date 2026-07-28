import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ToastProvider } from '../../ui/Toast'
import SignupPage from '../SignupPage'

vi.mock('../../../api/auth', () => ({
  register: vi.fn(),
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
      setUser: vi.fn(),
    })),
  }
})

vi.mock('../../../utils/usePageMeta', () => ({
  usePageMeta: vi.fn(),
}))

function renderSignupPage() {
  return render(
    <MemoryRouter initialEntries={['/signup']}>
      <ToastProvider>
        <SignupPage />
      </ToastProvider>
    </MemoryRouter>
  )
}

describe('SignupPage', () => {
  it('renders all inputs', () => {
    renderSignupPage()
    expect(screen.getByLabelText('Full name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument()
  })

  it('renders role selection radios', () => {
    renderSignupPage()
    expect(screen.getByRole('radio', { name: /job seeker/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /employer/i })).toBeInTheDocument()
  })

  it('renders create account button', () => {
    renderSignupPage()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('renders sign in link', () => {
    renderSignupPage()
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows loading state on submit', async () => {
    const { register } = await import('../../../api/auth')
    ;(register as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}) // never resolves
    )

    const user = userEvent.setup()
    renderSignupPage()

    await user.type(screen.getByLabelText('Full name'), 'John Doe')
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm password'), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled()
  })

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup()
    renderSignupPage()

    await user.type(screen.getByLabelText('Full name'), 'John Doe')
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm password'), 'differentpassword')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
  })
})
