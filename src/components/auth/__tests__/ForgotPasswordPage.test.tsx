import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ToastProvider } from '../../ui/Toast'
import ForgotPasswordPage from '../ForgotPasswordPage'

vi.mock('../../../api/auth', () => ({
  forgotPassword: vi.fn(),
}))

vi.mock('../../../utils/usePageMeta', () => ({
  usePageMeta: vi.fn(),
}))

function renderForgotPasswordPage() {
  return render(
    <MemoryRouter initialEntries={['/forgot-password']}>
      <ToastProvider>
        <ForgotPasswordPage />
      </ToastProvider>
    </MemoryRouter>
  )
}

describe('ForgotPasswordPage', () => {
  it('renders email input', () => {
    renderForgotPasswordPage()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('renders send reset link button', () => {
    renderForgotPasswordPage()
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
  })

  it('renders back to sign in link', () => {
    renderForgotPasswordPage()
    expect(screen.getByRole('link', { name: /back to sign in/i })).toBeInTheDocument()
  })

  it('shows success state after submission', async () => {
    const { forgotPassword } = await import('../../../api/auth')
    ;(forgotPassword as ReturnType<typeof vi.fn>).mockResolvedValue({})

    const user = userEvent.setup()
    renderForgotPasswordPage()

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /send reset link/i }))

    expect(screen.getByText('Check your email')).toBeInTheDocument()
    expect(screen.getByText(/we've sent a password reset link/i)).toBeInTheDocument()
  })
})
