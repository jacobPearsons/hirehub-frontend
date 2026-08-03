import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SeekerResumeStep } from '../SeekerResumeStep'

vi.mock('../../../context/AppContext', () => ({
  useApp: () => ({
    user: { resumeFileName: 'sarah-cv.pdf', resumePath: '/uploads/sarah-cv.pdf' },
    setUser: vi.fn(),
  }),
}))

vi.mock('../../../api/auth', () => ({ updateProfile: vi.fn() }))
vi.mock('../../../api/client', () => ({ apiUpload: vi.fn() }))

describe('SeekerResumeStep', () => {
  it('shows the existing resume file name', () => {
    render(<SeekerResumeStep onSaved={vi.fn()} />)
    expect(screen.getByText('sarah-cv.pdf')).toBeInTheDocument()
  })

  it('offers a Replace control next to an existing resume', () => {
    render(<SeekerResumeStep onSaved={vi.fn()} />)
    expect(screen.getByRole('button', { name: /replace/i })).toBeInTheDocument()
    expect(screen.getByText(/choose a new file to replace it/i)).toBeInTheDocument()
  })

  it('lets a returning user pick a new file to replace the existing resume', async () => {
    const user = userEvent.setup()
    render(<SeekerResumeStep onSaved={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /replace/i }))

    const input = document.querySelector('input[type="file"]')
    expect(input).not.toBeNull()

    const file = new File(['resume'], 'new-cv.pdf', { type: 'application/pdf' })
    fireEvent.change(input!, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText('new-cv.pdf')).toBeInTheDocument()
    })
  })
})
