import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getCandidateProfile: vi.fn(),
  updateApplicationStatus: vi.fn(),
  showToast: vi.fn(),
}))

vi.mock('../../../api/applications', () => ({
  getCandidateProfile: mocks.getCandidateProfile,
  resumeFileUrl: (p: string) => `http://localhost:4000/uploads/resumes/${p}`,
}))

vi.mock('../../../context/ApplicationsContext', () => ({
  useApplications: () => ({ updateApplicationStatus: mocks.updateApplicationStatus }),
}))

vi.mock('../../ui/Toast', () => ({
  useToast: () => ({ showToast: mocks.showToast }),
}))

vi.mock('../../interview', () => ({
  InterviewScheduleModal: () => <div data-testid="interview-modal" />,
  InterviewDetails: () => <div data-testid="interview-details" />,
}))

vi.mock('../../offer', () => ({
  OfferLetterModal: () => <div data-testid="offer-modal" />,
}))

import { CandidateDetailDrawer } from '../CandidateDetailDrawer'
import type { Application } from '../../../types/application'

const application: Application = {
  id: 'app-1',
  jobId: 'job-1',
  jobTitle: 'Senior Engineer',
  company: 'Acme',
  companyLogo: '',
  applicantName: 'Jane Doe',
  applicantEmail: 'jane@example.com',
  coverLetter: 'I am a great fit for this role.',
  status: 'applied',
  submittedAt: '2026-07-01T00:00:00.000Z',
}

const candidateResponse = {
  data: {
    application: {},
    candidate: {
      id: 'u1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1 555 0100',
      headline: 'Senior Engineer',
      location: 'Lisbon',
      skills: ['Python', 'React'],
      bio: 'Full-stack engineer with 6 years of experience.',
      resumePath: 'resume.pdf',
      resumeFileName: 'jane-resume.pdf',
      salaryMin: 50000,
      salaryMax: 70000,
      currency: 'EUR',
      employmentType: 'full-time',
      remoteOnly: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  },
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.getCandidateProfile.mockResolvedValue(candidateResponse)
  mocks.updateApplicationStatus.mockResolvedValue(undefined)
  mocks.showToast.mockResolvedValue(undefined)
})

function renderDrawer(onActionComplete = vi.fn()) {
  const user = userEvent.setup()
  render(
    <CandidateDetailDrawer
      application={application}
      open
      onOpenChange={vi.fn()}
      onActionComplete={onActionComplete}
    />,
  )
  return { user, onActionComplete }
}

describe('CandidateDetailDrawer', () => {
  it('renders the candidate profile and application context', async () => {
    renderDrawer()

    expect(await screen.findByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('Senior Engineer')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    expect(screen.getByText('+1 555 0100')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
    expect(screen.getByText('Full-stack engineer with 6 years of experience.')).toBeInTheDocument()
    expect(screen.getByText('Lisbon')).toBeInTheDocument()
    expect(screen.getByText('I am a great fit for this role.')).toBeInTheDocument()

    const resumeLink = screen.getByRole('link', { name: /open resume/i })
    expect(resumeLink).toHaveAttribute('href', 'http://localhost:4000/uploads/resumes/resume.pdf')
  })

  it('renders hiring action buttons', async () => {
    renderDrawer()

    expect(await screen.findByRole('button', { name: /schedule interview/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /make offer/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mark reviewing/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument()
  })

  it('calls updateApplicationStatus, showToast, and onActionComplete when marking as reviewing', async () => {
    const { user, onActionComplete } = renderDrawer()
    const reviewButton = await screen.findByRole('button', { name: /mark reviewing/i })

    await user.click(reviewButton)

    await waitFor(() => {
      expect(mocks.updateApplicationStatus).toHaveBeenCalledWith('app-1', 'reviewing')
    })
    expect(mocks.showToast).toHaveBeenCalledWith('success', 'Marked as under review')
    expect(onActionComplete).toHaveBeenCalledTimes(1)
  })

  it('shows the interview modal when scheduling an interview', async () => {
    const { user } = renderDrawer()
    const scheduleButton = await screen.findByRole('button', { name: /schedule interview/i })

    await user.click(scheduleButton)

    expect(screen.getByTestId('interview-modal')).toBeInTheDocument()
  })

  it('shows the offer modal when making an offer', async () => {
    const { user } = renderDrawer()
    const offerButton = await screen.findByRole('button', { name: /make offer/i })

    await user.click(offerButton)

    expect(screen.getByTestId('offer-modal')).toBeInTheDocument()
  })

  it('calls updateApplicationStatus with rejected when rejecting the candidate', async () => {
    const { user } = renderDrawer()
    const rejectButton = await screen.findByRole('button', { name: /reject/i })

    await user.click(rejectButton)

    await waitFor(() => {
      expect(mocks.updateApplicationStatus).toHaveBeenCalledWith('app-1', 'rejected')
    })
  })
})
