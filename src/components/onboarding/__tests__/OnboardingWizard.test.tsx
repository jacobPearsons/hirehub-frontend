import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ToastProvider } from '../../ui/Toast'
import OnboardingWizard from '../OnboardingWizard'
import { updateProfile } from '../../../api/auth'
import { upsertCompany, inviteTeam } from '../../../api/company'
import { useApp } from '../../../context/AppContext'

vi.mock('../../../api/auth', () => ({
  updateProfile: vi.fn(),
}))

vi.mock('../../../api/client', () => ({
  apiUpload: vi.fn(),
}))

vi.mock('../../../api/company', () => ({
  upsertCompany: vi.fn(),
  uploadCompanyLogo: vi.fn(),
  inviteTeam: vi.fn(),
}))

vi.mock('../../../context/AppContext', () => ({
  useApp: vi.fn(),
}))

vi.mock('../../../utils/usePageMeta', () => ({
  usePageMeta: vi.fn(),
}))

const mockedUpdateProfile = updateProfile as ReturnType<typeof vi.fn>
const mockedUpsertCompany = upsertCompany as ReturnType<typeof vi.fn>
const mockedInviteTeam = inviteTeam as ReturnType<typeof vi.fn>
const mockedUseApp = useApp as ReturnType<typeof vi.fn>

const seekerUser = { id: 'u1', name: 'Seeker', email: 'seeker@test.com', role: 'seeker' }
const employerUser = { id: 'u2', name: 'Employer', email: 'employer@test.com', role: 'employer', companyName: 'Acme' }

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
    mockedUseApp.mockReturnValue({ user: seekerUser, setUser: vi.fn() })
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

describe('OnboardingWizard (employer)', () => {
  beforeEach(() => {
    mockedUseApp.mockReturnValue({ user: employerUser, setUser: vi.fn() })
    mockedUpdateProfile.mockResolvedValue({ data: {} })
    mockedUpsertCompany.mockResolvedValue({ data: {} })
    mockedInviteTeam.mockResolvedValue({ data: { invites: [] } })
  })

  it('renders progress "Step 1 of 4" for an employer user', () => {
    renderWizard()
    expect(screen.getByText(/step 1 of 4/i)).toBeInTheDocument()
    expect(screen.queryByText(/step 2 of 4/i)).not.toBeInTheDocument()
  })

  it('entering a company name and continuing calls upsertCompany and advances', async () => {
    const user = userEvent.setup()
    renderWizard()

    await user.clear(screen.getByLabelText('Company name'))
    await user.type(screen.getByLabelText('Company name'), 'Acme Inc')
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(mockedUpsertCompany).toHaveBeenCalled())
    expect(mockedUpsertCompany).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Acme Inc' }),
    )
    expect(await screen.findByText(/step 2 of 4/i)).toBeInTheDocument()
  })

  it('shows an inline error for an invalid invite email and submits valid ones', async () => {
    const user = userEvent.setup()
    renderWizard()

    await user.clear(screen.getByLabelText('Company name'))
    await user.type(screen.getByLabelText('Company name'), 'Acme Inc')
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByText(/step 2 of 4/i)

    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByText(/step 3 of 4/i)

    await user.type(screen.getByLabelText('Team emails'), 'not-an-email')
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(await screen.findByText(/not a valid email: not-an-email/i)).toBeInTheDocument()
    expect(screen.getByText(/step 3 of 4/i)).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Team emails'))
    await user.type(screen.getByLabelText('Team emails'), 'alice@acme.com, bob@acme.com')
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(mockedInviteTeam).toHaveBeenCalled())
    expect(mockedInviteTeam).toHaveBeenCalledWith(['alice@acme.com', 'bob@acme.com'])
    expect(await screen.findByText(/step 4 of 4/i)).toBeInTheDocument()
  })

  it('completing the flow calls updateProfile with onboardingCompleted', async () => {
    const user = userEvent.setup()
    renderWizard()

    await user.clear(screen.getByLabelText('Company name'))
    await user.type(screen.getByLabelText('Company name'), 'Acme Inc')
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByText(/step 2 of 4/i)

    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByText(/step 3 of 4/i)

    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByText(/step 4 of 4/i)

    await user.click(screen.getByRole('button', { name: /post your first job/i }))

    await waitFor(() =>
      expect(mockedUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ onboardingCompleted: true }),
      ),
    )
  })
})
