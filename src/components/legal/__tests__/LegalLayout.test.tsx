import { render, screen } from '@testing-library/react'
import { LegalLayout } from '../LegalLayout'
import type { LegalDocument } from '../legalData'

const fixture: LegalDocument = {
  slug: 'privacy',
  title: 'Privacy Policy',
  description: 'How HireHub Community handles your data.',
  updatedAt: 'August 6, 2026',
  sections: [
    {
      id: 'info-we-collect',
      title: 'Information We Collect',
      paragraphs: [
        { text: 'We collect information you provide directly.' },
        { text: 'We also collect usage data.', bullets: ['Pages visited', 'Searches'] },
      ],
    },
    {
      id: 'contact',
      title: 'Contact Us',
      paragraphs: [{ text: 'Email support@hirehub.community.' }],
    },
  ],
}

describe('LegalLayout', () => {
  it('renders the title, description, and last-updated date', () => {
    render(<LegalLayout doc={fixture} />)
    expect(screen.getByRole('heading', { level: 1, name: /privacy policy/i })).toBeInTheDocument()
    expect(screen.getByText('How HireHub Community handles your data.')).toBeInTheDocument()
    expect(screen.getByText(/last updated: august 6, 2026/i)).toBeInTheDocument()
  })

  it('renders every section heading', () => {
    render(<LegalLayout doc={fixture} />)
    expect(screen.getByRole('heading', { level: 2, name: /information we collect/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /contact us/i })).toBeInTheDocument()
  })

  it('renders paragraph text and bullets', () => {
    render(<LegalLayout doc={fixture} />)
    expect(screen.getByText('We collect information you provide directly.')).toBeInTheDocument()
    expect(screen.getByText('Pages visited')).toBeInTheDocument()
  })

  it('renders a sidebar nav with an anchor per section', () => {
    render(<LegalLayout doc={fixture} />)
    const nav = screen.getByRole('navigation', { name: /sections/i })
    const link = nav.querySelector('a[href="#info-we-collect"]')
    expect(link).not.toBeNull()
  })
})
