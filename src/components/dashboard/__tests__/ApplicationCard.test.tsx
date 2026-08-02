import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ApplicationCard } from '../ApplicationCard'
import type { Application } from '../../../types/application'

const app: Application = {
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

describe('ApplicationCard', () => {
  it('renders a View Job button linking to the job detail page', () => {
    render(
      <MemoryRouter>
        <ApplicationCard application={app} />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /View Job/i })
    expect(link).toHaveAttribute('href', '/jobs/job-1')
  })

  it('opens the hiring flow modal', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <ApplicationCard application={app} />
      </MemoryRouter>,
    )
    await user.click(screen.getByRole('button', { name: /Hiring Flow/i }))
    expect(screen.getByText(/Hiring Flow — Frontend Engineer/i)).toBeInTheDocument()
  })
})
