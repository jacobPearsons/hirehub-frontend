import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar } from '../Sidebar'

vi.mock('../../../context/AppContext', () => ({
  useApp: () => ({ user: { name: 'Ada', role: 'admin' }, setUser: vi.fn() }),
}))
vi.mock('../../../api/auth', () => ({ logout: vi.fn() }))
vi.mock('../../../api/client', () => ({ setAccessToken: vi.fn() }))

describe('Sidebar', () => {
  it('renders nav labels when expanded', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    )
    expect(screen.getByText('Overview')).toBeInTheDocument()
  })

  it('hides nav labels when collapsed', () => {
    render(
      <MemoryRouter>
        <Sidebar collapsed />
      </MemoryRouter>,
    )
    expect(screen.queryByText('Overview')).not.toBeInTheDocument()
    // label still accessible via title
    expect(screen.getByTitle('Overview')).toBeInTheDocument()
  })
})
