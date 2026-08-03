import { render, screen } from '@testing-library/react'
import { ApplyJobForm } from '../ApplyJobForm'
import { ToastProvider } from '../../ui/Toast'
import { jobs } from '../../../data/jobs'
import type { AppUser } from '../../../context/AppContext'

const { mockUseApp } = vi.hoisted(() => ({ mockUseApp: vi.fn() }))

vi.mock('../../../context/AppContext', () => ({
  useApp: () => mockUseApp(),
}))

const seekerWithResume: AppUser = {
  id: 'u1',
  name: 'Jane',
  email: 'jane@x.com',
  role: 'seeker',
  resumePath: '/uploads/sarah-cv.pdf',
  resumeFileName: 'sarah-cv.pdf',
}

describe('ApplyJobForm with existing resume', () => {
  beforeEach(() => {
    mockUseApp.mockReturnValue({ user: seekerWithResume, addApplication: vi.fn() })
  })

  it('does not render a file input when user already uploaded a resume', () => {
    render(
      <ToastProvider>
        <ApplyJobForm job={jobs[0]} onSuccess={vi.fn()} />
      </ToastProvider>
    )
    expect(screen.queryByLabelText(/resume/i)).not.toBeInTheDocument()
  })

  describe('cover-letter-only mode', () => {
    it('hides name/email/resume fields when the user has a resume on file', () => {
      render(
        <ToastProvider>
          <ApplyJobForm job={jobs[0]} onSuccess={vi.fn()} />
        </ToastProvider>
      )
      expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/upload resume/i)).not.toBeInTheDocument()
      expect(screen.getByLabelText(/cover letter/i)).toBeInTheDocument()
    })

    it('shows the full form when unauthenticated', () => {
      mockUseApp.mockReturnValue({ user: null, addApplication: vi.fn() })
      render(
        <ToastProvider>
          <ApplyJobForm job={jobs[0]} onSuccess={vi.fn()} />
        </ToastProvider>
      )
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/cover letter/i)).toBeInTheDocument()
    })
  })
})
