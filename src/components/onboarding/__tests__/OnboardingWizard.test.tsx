import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ToastProvider } from '../../ui/Toast'
import OnboardingWizard from '../OnboardingWizard'
import { updateProfile } from '../../../api/auth'

vi.mock('../../../api/auth', () => ({
  updateProfile: vi.fn(),
}))

vi.mock('../../../api/client', () => ({
  apiUpload: vi.fn(),
}))

vi.mock('../../../context/AppContext', () => ({
  useApp: vi.fn(() => ({
    user: { id: 'u1', name: 'Seeker', email: 'seeker@test.com', role: 'seeker' },
    setUser: vi.fn(),
  })),
}))

vi.mock('../../../utils/usePageMeta', () => ({
  usePageMeta: vi.fn(),
}))

const mockedUpdateProfile = updateProfile as ReturnType<typeof vi.fn>

function renderWizard() {
  return render(
    <MemoryRouter initialEntries={['/onboarding']}>
      <ToastProvider>
        <OnboardingWizard />
      </ToastProvider>
    </MemoryRouter>
  )
}

describe('OnboardingWizard (seeker)', () => {
  beforeEach(() => {
    mockedUpdateProfile.mockResolvedValue({ data: {} })
  })

  it('renders progress "Step 1 of 5"', () => {
    renderWizard()
    expect(screen.getByText(/step 1 of 5/i)).toBeInTheDocument()
    expect(screen.getByText(/let's get your profile ready/i)).toBeInTheDocument()
  })

  it('entering a headline and continuing calls updateProfile and advances', async () => {
    const user = userEvent.setup()
    renderWizard()

    await user.type(screen.getByLabelText('Headline'), 'Senior React Engineer')
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(mockedUpdateProfile).toHaveBeenCalled())
    expect(await screen.findByText(/step 2 of 5/i)).toBeInTheDocument()
  })

  it('blocks the Skills step below 3 skills with an inline error', async () => {
    const user = userEvent.setup()
    renderWizard()

    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByText(/step 2 of 5/i)

    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByText(/step 3 of 5/i)

    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(await screen.findByText(/add at least 3 skills/i)).toBeInTheDocument()
    expect(screen.getByText(/step 3 of 5/i)).toBeInTheDocument()
  })

  it('completing the flow calls updateProfile with onboardingCompleted', async () => {
    const user = userEvent.setup()
    renderWizard()

    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByText(/step 2 of 5/i)

    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByText(/step 3 of 5/i)

    await user.type(screen.getByLabelText('Skills'), 'React{enter}')
    await user.type(screen.getByLabelText('Skills'), 'TypeScript{enter}')
    await user.type(screen.getByLabelText('Skills'), 'Node.js{enter}')

    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByText(/step 4 of 5/i)

    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByText(/step 5 of 5/i)

    await user.click(screen.getByRole('button', { name: /go to job board/i }))

    await waitFor(() =>
      expect(mockedUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ onboardingCompleted: true }),
      ),
    )
  })
})
