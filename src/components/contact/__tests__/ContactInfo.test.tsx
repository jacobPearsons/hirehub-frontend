import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ContactInfo } from '../ContactInfo'

vi.mock('../../../utils/usePageMeta', () => ({
  usePageMeta: vi.fn(),
}))

function renderContactInfo() {
  return render(
    <MemoryRouter initialEntries={['/contact']}>
      <ContactInfo />
    </MemoryRouter>
  )
}

describe('ContactInfo', () => {
  it('renders Get in touch heading', () => {
    renderContactInfo()
    expect(screen.getByRole('heading', { name: /get in touch/i })).toBeInTheDocument()
  })

  it('renders email address', () => {
    renderContactInfo()
    expect(screen.getByText('hello@hirehub.community')).toBeInTheDocument()
  })

  it('renders phone number', () => {
    renderContactInfo()
    expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument()
  })

  it('renders the contact form', () => {
    renderContactInfo()
    expect(screen.getByRole('form')).toBeInTheDocument()
  })
})
