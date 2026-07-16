import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider, useApp } from '../AppContext'
import type { Application } from '../../types/application'

vi.mock('../../api/auth', () => ({
  getMe: vi.fn().mockRejectedValue(new Error('Not authenticated')),
}))

vi.mock('../../api/client', () => ({
  getAccessToken: vi.fn().mockReturnValue(null),
  setAccessToken: vi.fn(),
}))

vi.mock('../../api/savedJobs', () => ({
  listSavedJobs: vi.fn().mockResolvedValue({ data: [], success: true }),
  saveJob: vi.fn().mockResolvedValue({ success: true }),
  removeSavedJob: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock('../../api/applications', () => ({
  listApplications: vi.fn().mockResolvedValue({ data: [], success: true }),
}))

const mockApp: Application = {
  id: 'app-1',
  jobId: 'job-1',
  jobTitle: 'Engineer',
  company: 'Acme',
  companyLogo: '',
  applicantName: 'Alice',
  applicantEmail: 'a@b.com',
  coverLetter: 'Hi',
  status: 'applied',
  submittedAt: '2025-01-01',
}

function TestConsumer() {
  const { user, loading, savedJobIds, applications, setUser, toggleSaveJob, addApplication, setLoading } = useApp()
  return (
    <div>
      <span data-testid="user">{user ? user.name : 'null'}</span>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="savedJobIds">{JSON.stringify(savedJobIds)}</span>
      <span data-testid="applications">{JSON.stringify(applications)}</span>
      <button onClick={() => setUser({ id: '1', name: 'Alice', email: 'a@b.com', role: 'seeker' })}>set user</button>
      <button onClick={() => toggleSaveJob('job-1')}>toggle job-1</button>
      <button onClick={() => toggleSaveJob('job-2')}>toggle job-2</button>
      <button onClick={() => addApplication(mockApp)}>add app</button>
      <button onClick={() => setLoading(false)}>set loading false</button>
    </div>
  )
}

function renderWithProvider() {
  return render(<AppProvider><TestConsumer /></AppProvider>)
}

describe('AppContext reducer', () => {
  it('SET_USER action sets the user', async () => {
    const user = userEvent.setup()
    renderWithProvider()
    expect(screen.getByTestId('user')).toHaveTextContent('null')

    await user.click(screen.getByRole('button', { name: 'set user' }))
    expect(screen.getByTestId('user')).toHaveTextContent('Alice')
  })

  it('SET_LOADING action toggles loading', async () => {
    const user = userEvent.setup()
    renderWithProvider()
    expect(screen.getByTestId('loading')).toHaveTextContent('false')

    await user.click(screen.getByRole('button', { name: 'set loading false' }))
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
  })

  it('TOGGLE_SAVE_JOB adds and removes job IDs', async () => {
    const user = userEvent.setup()
    renderWithProvider()
    expect(screen.getByTestId('savedJobIds')).toHaveTextContent('[]')

    await user.click(screen.getByRole('button', { name: 'toggle job-1' }))
    await waitFor(() => {
      expect(screen.getByTestId('savedJobIds')).toHaveTextContent('["job-1"]')
    })

    await user.click(screen.getByRole('button', { name: 'toggle job-2' }))
    await waitFor(() => {
      expect(screen.getByTestId('savedJobIds')).toHaveTextContent('["job-1","job-2"]')
    })

    await user.click(screen.getByRole('button', { name: 'toggle job-1' }))
    await waitFor(() => {
      expect(screen.getByTestId('savedJobIds')).toHaveTextContent('["job-2"]')
    })
  })

  it('ADD_APPLICATION adds an application', async () => {
    const user = userEvent.setup()
    renderWithProvider()
    expect(screen.getByTestId('applications')).toHaveTextContent('[]')

    await user.click(screen.getByRole('button', { name: 'add app' }))
    const apps = JSON.parse(screen.getByTestId('applications').textContent!)
    expect(apps).toHaveLength(1)
    expect(apps[0].id).toBe('app-1')
  })
})
