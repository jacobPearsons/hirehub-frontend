import { render, screen } from '@testing-library/react'
import { FAQSection } from '../FAQSection'

describe('FAQSection', () => {
  it('renders a heading and FAQ questions', () => {
    render(<FAQSection />)
    expect(screen.getByRole('heading', { name: /frequently asked/i })).toBeInTheDocument()
    expect(screen.getByText('How do I create an account?')).toBeInTheDocument()
    expect(screen.getByText('How do I manage my saved jobs?')).toBeInTheDocument()
  })

  it('renders answers inside details elements', () => {
    render(<FAQSection />)
    expect(screen.getAllByRole('group')).toHaveLength(6)
  })
})
