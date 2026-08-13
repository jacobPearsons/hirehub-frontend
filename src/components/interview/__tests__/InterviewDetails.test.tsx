import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { InterviewDetails } from '../InterviewDetails'
import type { InterviewDetails as InterviewDetailsType } from '../../../types/hiring-flow'

vi.mock('../../../context/AppContext', () => ({
  useApp: () => ({ user: { id: 'u-seeker', name: 'Alex Seeker', role: 'seeker' } }),
}))

function renderDetails(details: InterviewDetailsType) {
  return render(
    <MemoryRouter>
      <InterviewDetails details={details} />
    </MemoryRouter>
  )
}

const baseDetails: InterviewDetailsType = {
  interviewType: 'website-chat',
  interviewDate: '2026-08-20',
  interviewTime: '10:00',
  interviewerName: 'Jane Smith',
  interviewerTitle: 'Engineering Manager',
  scheduledAt: '2026-08-13T00:00:00.000Z',
}

describe('InterviewDetails', () => {
  it('renders the Website Chat badge and an open-chat CTA with the conversation id', () => {
    renderDetails({
      ...baseDetails,
      conversationId: 'conv-1',
      questions: [
        { id: 'q1', prompt: 'What is your React experience?' },
        { id: 'q2', prompt: 'How do you handle state?' },
      ],
    })

    expect(screen.getByText('Website Chat')).toBeInTheDocument()
    expect(screen.getByText(/What is your React experience\?/)).toBeInTheDocument()
    expect(screen.getByText(/How do you handle state\?/)).toBeInTheDocument()

    const cta = screen.getByRole('link', { name: 'Open interview chat' })
    expect(cta).toHaveAttribute('href', '/dashboard?tab=messages&conv=conv-1')
  })

  it('renders the meeting link for a video interview and no chat CTA', () => {
    renderDetails({
      ...baseDetails,
      interviewType: 'video',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
    })

    expect(screen.getByText('Video')).toBeInTheDocument()
    expect(screen.getByText('https://meet.google.com/abc-defg-hij')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Open interview chat' })).not.toBeInTheDocument()
  })
})
