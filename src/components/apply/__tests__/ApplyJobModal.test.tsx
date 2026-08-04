import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApplyJobModal } from '../ApplyJobModal'
import { jobs } from '../../../data/jobs'

const { mockUseApp } = vi.hoisted(() => ({ mockUseApp: vi.fn() }))

vi.mock('../../../context/AppContext', () => ({
  useApp: () => mockUseApp(),
}))

vi.mock('../ApplyJobForm', () => ({
  ApplyJobForm: ({ resumeFile, resumeFileName, onResumeChange, onSuccess }: {
    resumeFile: File | null
    resumeFileName: string | null
    onResumeChange: (file: File | null, name: string | null) => void
    onSuccess: (name?: string) => void
  }) => (
    <div data-testid="apply-form" data-file={resumeFile?.name ?? ''} data-name={resumeFileName ?? ''}>
      <button type="button" onClick={() => onResumeChange(new File(['x'], 'cv.pdf'), 'cv.pdf')}>select-file</button>
      <button type="button" onClick={() => onSuccess('cv.pdf')}>submit</button>
    </div>
  ),
}))

vi.mock('../ApplyLanding', () => ({
  ApplyLanding: ({ resumeFileName }: { resumeFileName?: string }) => (
    <div data-testid="landing" data-name={resumeFileName ?? ''}>landing</div>
  ),
}))

describe('ApplyJobModal', () => {
  beforeEach(() => {
    mockUseApp.mockReturnValue({ user: { id: 'u1', name: 'Jane', email: 'j@x.com', role: 'seeker' } })
  })

  it('keeps a selected resume file across close and reopen', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<ApplyJobModal job={jobs[0]} open onOpenChange={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'select-file' }))
    expect(screen.getByTestId('apply-form')).toHaveAttribute('data-file', 'cv.pdf')

    rerender(<ApplyJobModal job={jobs[0]} open={false} onOpenChange={() => {}} />)
    rerender(<ApplyJobModal job={jobs[0]} open onOpenChange={() => {}} />)

    expect(screen.getByTestId('apply-form')).toHaveAttribute('data-file', 'cv.pdf')
  })

  it('clears the selected resume after a successful submit', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<ApplyJobModal job={jobs[0]} open onOpenChange={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'select-file' }))
    await user.click(screen.getByRole('button', { name: 'submit' }))
    expect(screen.getByTestId('landing')).toHaveAttribute('data-name', 'cv.pdf')

    rerender(<ApplyJobModal job={jobs[0]} open={false} onOpenChange={() => {}} />)
    rerender(<ApplyJobModal job={jobs[0]} open onOpenChange={() => {}} />)

    expect(screen.getByTestId('apply-form')).toHaveAttribute('data-file', '')
  })
})
