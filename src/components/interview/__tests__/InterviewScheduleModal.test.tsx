import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { InterviewScheduleModal } from '../InterviewScheduleModal'
import type { Application } from '../../../types/application'

const {
  updateApplicationInterviewMock,
  updateApplicationStatusMock,
  showToastMock,
  sendInterviewInvitationMock,
  openInterviewConversationMock,
  getJobByIdMock,
} = vi.hoisted(() => ({
  updateApplicationInterviewMock: vi.fn(),
  updateApplicationStatusMock: vi.fn(),
  showToastMock: vi.fn(),
  sendInterviewInvitationMock: vi.fn(),
  openInterviewConversationMock: vi.fn(),
  getJobByIdMock: vi.fn(),
}))

vi.mock('../../../context/ApplicationsContext', () => ({
  useApplications: () => ({
    updateApplicationInterview: updateApplicationInterviewMock,
    updateApplicationStatus: updateApplicationStatusMock,
  }),
}))

vi.mock('../../../context/AppContext', () => ({
  useApp: () => ({ user: { id: 'u-employer', name: 'Acme HR', role: 'employer' } }),
}))

vi.mock('../../ui/Toast', () => ({
  useToast: () => ({ showToast: showToastMock }),
}))

vi.mock('../../../api/emails', () => ({
  sendInterviewInvitation: sendInterviewInvitationMock,
}))

vi.mock('../../../api/messages', () => ({
  openInterviewConversation: openInterviewConversationMock,
}))

vi.mock('../../../api/jobs', () => ({
  getJobById: getJobByIdMock,
}))

const application: Application = {
  id: 'app-1',
  jobId: 'job-1',
  jobTitle: 'Frontend Engineer',
  company: 'Acme',
  companyLogo: '',
  applicantName: 'Jane Doe',
  applicantEmail: 'jane@example.com',
  coverLetter: '',
  status: 'screening',
  submittedAt: '2026-07-01T00:00:00.000Z',
}

const job = {
  id: 'job-1',
  screeningQuestions: [
    { id: 'q1', prompt: 'What is your React experience?', expectedKeywords: [], maxScore: 1, order: 1 },
    { id: 'q2', prompt: 'How do you handle state?', expectedKeywords: [], maxScore: 1, order: 2 },
  ],
}

function Harness() {
  const location = useLocation()
  return (
    <>
      <span data-testid="location">{location.pathname + location.search}</span>
      <InterviewScheduleModal application={application} open onOpenChange={vi.fn()} onSuccess={vi.fn()} />
    </>
  )
}

function renderModal() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/employer/dashboard']}>
        <Harness />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

async function fillRequiredFields() {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Date'), '2026-08-20')
  await user.type(screen.getByLabelText('Time'), '10:00')
  await user.type(screen.getByLabelText('Interviewer Name'), 'Jane Smith')
  await user.type(screen.getByLabelText('Interviewer Title'), 'Engineering Manager')
  return user
}

describe('InterviewScheduleModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    updateApplicationInterviewMock.mockResolvedValue({ success: true, data: application })
    updateApplicationStatusMock.mockResolvedValue({ success: true, data: application })
    sendInterviewInvitationMock.mockResolvedValue(undefined)
    openInterviewConversationMock.mockResolvedValue({ success: true, data: { conversation: { id: 'conv-9' } } })
    getJobByIdMock.mockResolvedValue({ success: true, data: job })
  })

  it('submits a website-chat interview with selected questions and navigates to the conversation', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.selectOptions(screen.getByRole('combobox'), 'website-chat')
    const prompt = await screen.findByText('What is your React experience?')
    expect(prompt).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: 'How do you handle state?' }))
    await fillRequiredFields()
    await user.click(screen.getByRole('button', { name: 'Schedule Interview' }))

    expect(updateApplicationInterviewMock).toHaveBeenCalledWith('app-1', expect.objectContaining({
      interviewType: 'website-chat',
      interviewDate: '2026-08-20',
      interviewTime: '10:00',
      questions: [{ id: 'q1', prompt: 'What is your React experience?' }],
    }))
    expect(updateApplicationInterviewMock).toHaveBeenCalledWith('app-1', expect.not.objectContaining({ meetingLink: expect.anything() }))
    expect(updateApplicationStatusMock).toHaveBeenCalledWith('app-1', 'interviewing')
    expect(openInterviewConversationMock).toHaveBeenCalledWith('app-1')
    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/employer/dashboard?tab=messages&conv=conv-9')
    })
  })

  it('does not navigate when the conversation endpoint fails', async () => {
    openInterviewConversationMock.mockRejectedValue(new Error('Not found'))
    const user = userEvent.setup()
    renderModal()

    await user.selectOptions(screen.getByRole('combobox'), 'website-chat')
    await screen.findByText('What is your React experience?')
    await fillRequiredFields()
    await user.click(screen.getByRole('button', { name: 'Schedule Interview' }))

    expect(updateApplicationInterviewMock).toHaveBeenCalled()
    await waitFor(() => {
      expect(openInterviewConversationMock).toHaveBeenCalled()
    })
    expect(showToastMock).toHaveBeenCalledWith('error', 'Failed to schedule interview. Please try again.')
    expect(screen.getByTestId('location')).toHaveTextContent('/employer/dashboard')
  })

  it('keeps the existing video flow unchanged', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.type(screen.getByLabelText('Meeting Link'), 'https://meet.google.com/abc-defg-hij')
    await fillRequiredFields()
    await user.click(screen.getByRole('button', { name: 'Schedule Interview' }))

    expect(updateApplicationStatusMock).toHaveBeenCalledWith('app-1', 'interviewing')
    expect(updateApplicationInterviewMock).toHaveBeenCalledWith('app-1', expect.objectContaining({
      interviewType: 'video',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
    }))
    expect(sendInterviewInvitationMock).toHaveBeenCalled()
    expect(openInterviewConversationMock).not.toHaveBeenCalled()
    expect(showToastMock).toHaveBeenCalledWith('success', 'Interview scheduled for Jane Doe')
  })
})
