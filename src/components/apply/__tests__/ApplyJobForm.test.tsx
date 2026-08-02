import { render, screen } from '@testing-library/react'
import { ApplyJobForm } from '../ApplyJobForm'
import { ToastProvider } from '../../ui/Toast'
import { jobs } from '../../../data/jobs'

vi.mock('../../../context/AppContext', () => ({
  useApp: () => ({
    user: { resumePath: '/uploads/sarah-cv.pdf', resumeFileName: 'sarah-cv.pdf' },
    addApplication: vi.fn(),
  }),
}))

describe('ApplyJobForm with existing resume', () => {
  it('does not render a file input when user already uploaded a resume', () => {
    render(
      <ToastProvider>
        <ApplyJobForm job={jobs[0]} onSuccess={vi.fn()} />
      </ToastProvider>
    )
    expect(screen.queryByLabelText(/resume/i)).not.toBeInTheDocument()
    expect(screen.getByText(/sarah-cv\.pdf/i)).toBeInTheDocument()
  })
})
