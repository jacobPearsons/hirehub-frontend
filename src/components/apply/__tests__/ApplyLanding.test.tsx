import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ApplyLanding } from '../ApplyLanding'
import { jobs } from '../../../data/jobs'
import type { AppUser } from '../../../context/AppContext'

const job = jobs[0]

const user: AppUser = {
  id: 'u1',
  name: 'Jane',
  email: 'jane@x.com',
  role: 'seeker',
}

describe('ApplyLanding', () => {
  it('shows account-creation CTAs for unauthenticated users', () => {
    render(
      <MemoryRouter>
        <ApplyLanding job={job} user={null} />
      </MemoryRouter>,
    )
    expect(screen.getByText(/create an account/i)).toBeInTheDocument()
    expect(screen.getByText(/browse more jobs/i)).toBeInTheDocument()
  })

  it('shows a go-to-dashboard CTA for authenticated users', () => {
    render(
      <MemoryRouter>
        <ApplyLanding job={job} user={user} />
      </MemoryRouter>,
    )
    expect(screen.getByText(/go to dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/browse more jobs/i)).toBeInTheDocument()
  })
})
