import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HiringFlowModal } from '../HiringFlowModal'
import type { Application } from '../../../types/application'

const application: Application = {
  id: 'app-1',
  jobId: 'job-1',
  jobTitle: 'Frontend Engineer',
  company: 'Acme',
  companyLogo: '',
  applicantName: 'Jane Doe',
  applicantEmail: 'jane@example.com',
  coverLetter: '',
  status: 'reviewing',
  submittedAt: '2026-07-01T00:00:00Z',
}

describe('HiringFlowModal', () => {
  it('renders all hiring stages', () => {
    render(<HiringFlowModal application={application} open onOpenChange={vi.fn()} />)
    expect(screen.getByText('Applied')).toBeInTheDocument()
    expect(screen.getByText('Under Review')).toBeInTheDocument()
    expect(screen.getByText('Interviewing')).toBeInTheDocument()
    expect(screen.getByText('Offer')).toBeInTheDocument()
  })

  it('marks the current stage', () => {
    render(<HiringFlowModal application={application} open onOpenChange={vi.fn()} />)
    expect(screen.getByText('Current')).toBeInTheDocument()
  })
})
