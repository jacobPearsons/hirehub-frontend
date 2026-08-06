import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HelpCenterPage from '../HelpCenterPage'

vi.mock('../../../utils/usePageMeta', () => ({
  usePageMeta: () => null,
}))

describe('HelpCenterPage', () => {
  it('renders a heading and every category title', () => {
    render(<HelpCenterPage />)
    expect(screen.getByRole('heading', { level: 1, name: /help center/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /for job seekers/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /for employers/i })).toBeInTheDocument()
  })

  it('renders article questions as accordion summaries', () => {
    render(<HelpCenterPage />)
    expect(screen.getByText('How do I create an account?')).toBeInTheDocument()
    expect(screen.getByText('How do I apply to a job?')).toBeInTheDocument()
  })

  it('filters articles as the user types', async () => {
    const user = userEvent.setup()
    render(<HelpCenterPage />)
    const input = screen.getByRole('textbox', { name: /search the help center/i })
    await user.type(input, 'reset my password')
    expect(screen.getByText('How do I reset my password?')).toBeInTheDocument()
    expect(screen.queryByText('How do I create an account?')).not.toBeInTheDocument()
  })

  it('links to contact and FAQ pages', () => {
    render(<HelpCenterPage />)
    expect(screen.getByRole('link', { name: /contact us/i })).toHaveAttribute('href', '/contact')
    expect(screen.getByRole('link', { name: /visit the faq/i })).toHaveAttribute('href', '/faq')
  })
})
