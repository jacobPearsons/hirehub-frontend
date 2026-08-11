import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApplyJobForm } from '../ApplyJobForm'
import { ToastProvider } from '../../ui/Toast'
import { jobs } from '../../../data/jobs'
import type { AppUser } from '../../../context/AppContext'

const { mockUseApp } = vi.hoisted(() => ({ mockUseApp: vi.fn() }))
const { mockCreateApplication } = vi.hoisted(() => ({ mockCreateApplication: vi.fn() }))

vi.mock('../../../context/AppContext', () => ({
  useApp: () => mockUseApp(),
}))

vi.mock('../../../api/applications', () => ({
  createApplication: (...args: unknown[]) => mockCreateApplication(...args),
}))

const seekerWithResume: AppUser = {
  id: 'u1',
  name: 'Jane',
  email: 'jane@x.com',
  role: 'seeker',
  resumePath: '/uploads/sarah-cv.pdf',
  resumeFileName: 'sarah-cv.pdf',
}

const job = {
  ...jobs[0],
  screeningQuestions: [
    { id: 'q1', prompt: 'Years of Python?', expectedKeywords: ['python'], maxScore: 10, order: 1 },
  ],
}

describe('ApplyJobForm screening questions', () => {
  beforeEach(() => {
    mockUseApp.mockReturnValue({ user: seekerWithResume, addApplication: vi.fn() })
    mockCreateApplication.mockResolvedValue({ data: { id: 'app-1' } })
  })

  it('renders one answer field per screening question and submits answers', async () => {
    const onSuccess = vi.fn()
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <ApplyJobForm job={job} onSuccess={onSuccess} resumeFile={null} resumeFileName={null} onResumeChange={vi.fn()} />
      </ToastProvider>
    )
    await user.type(screen.getByLabelText('Years of Python?'), 'Five years')
    await user.type(screen.getByLabelText(/cover letter/i), 'I am a passionate engineer with five years of experience building products.')
    await user.click(screen.getByRole('button', { name: /submit application/i }))
    expect(mockCreateApplication).toHaveBeenCalledWith(expect.objectContaining({
      screeningAnswers: [{ questionId: 'q1', answerText: 'Five years' }],
    }))
    expect(onSuccess).toHaveBeenCalled()
  })
})
