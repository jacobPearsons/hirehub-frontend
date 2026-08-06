import { render, screen } from '@testing-library/react'
import PrivacyPolicyPage from '../PrivacyPolicyPage'
import TermsPage from '../TermsPage'
import CookiePolicyPage from '../CookiePolicyPage'

vi.mock('../../../utils/usePageMeta', () => ({
  usePageMeta: () => null,
}))

describe('LegalPages', () => {
  it('renders the privacy policy', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByRole('heading', { level: 1, name: /privacy policy/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /information we collect/i })).toBeInTheDocument()
  })

  it('renders the terms of service', () => {
    render(<TermsPage />)
    expect(screen.getByRole('heading', { level: 1, name: /terms of service/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /acceptance of terms/i })).toBeInTheDocument()
  })

  it('renders the cookie policy', () => {
    render(<CookiePolicyPage />)
    expect(screen.getByRole('heading', { level: 1, name: /cookie policy/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /what are cookies/i })).toBeInTheDocument()
  })
})
