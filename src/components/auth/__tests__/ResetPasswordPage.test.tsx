import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ToastProvider } from '../../ui/Toast'
import ResetPasswordPage from '../ResetPasswordPage'

vi.mock('../../../api/auth', () => ({
  resetPassword: vi.fn(),
}))

vi.mock('../../../utils/usePageMeta', () => ({
  usePageMeta: vi.fn(),
}))

function renderResetPasswordPage(token = 'valid-token-123') {
  return render(
    <MemoryRouter initialEntries={[`/reset-password?token=${token}`]}>
      <ToastProvider>
        <ResetPasswordPage />
      </ToastProvider>
    </MemoryRouter>
  )
}

describe('ResetPasswordPage', () => {
  it('renders new password input', () => {
    renderResetPasswordPage()
    expect(screen.getByLabelText('New password')).toBeInTheDocument()
  })

  it('renders confirm password input', () => {
    renderResetPasswordPage()
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument()
  })

  it('renders reset password button', () => {
    renderResetPasswordPage()
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument()
  })

  it('renders back to sign in link', () => {
    renderResetPasswordPage()
    expect(screen.getByRole('link', { name: /back to sign in/i })).toBeInTheDocument()
  })

  it('shows invalid reset link state when no token is provided', () => {
    renderResetPasswordPage('')
    expect(screen.getByText('This password reset link is invalid or has expired.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /request a new reset link/i })).toBeInTheDocument()
  })
})
