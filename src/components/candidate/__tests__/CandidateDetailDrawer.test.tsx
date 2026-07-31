import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../../../api/applications', () => ({
  getCandidateProfile: vi.fn().mockResolvedValue({
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
  }),
  resumeFileUrl: (p: string) => `http://localhost:4000/uploads/resumes/${p}`,
}))

vi.mock('../../../context/ApplicationsContext', () => ({
  useApplications: vi.fn(() => ({
    updateApplicationStatus: vi.fn(),
  })),
}))

vi.mock('../../ui/Toast', () => ({
  useToast: vi.fn(() => ({ showToast: vi.fn() })),
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

describe('CandidateDetailDrawer', () => {
  it('renders the candidate profile and application context', async () => {
    render(
      <CandidateDetailDrawer
        application={application}
        open
        onOpenChange={vi.fn()}
        onActionComplete={vi.fn()}
      />,
    )

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
    render(
      <CandidateDetailDrawer
        application={application}
        open
        onOpenChange={vi.fn()}
        onActionComplete={vi.fn()}
      />,
    )

    expect(await screen.findByRole('button', { name: /schedule interview/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /make offer/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mark reviewing/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument()
  })
})
