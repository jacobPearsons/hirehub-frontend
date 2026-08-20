import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TrustBar } from '../TrustBar'

describe('TrustBar', () => {
  it('renders the Powered by heading', () => {
    render(
      <MemoryRouter>
        <TrustBar />
      </MemoryRouter>,
    )
    expect(screen.getByText('Powered by')).toBeInTheDocument()
  })

  it('renders all 16 company logos in the marquee', () => {
    render(
      <MemoryRouter>
        <TrustBar />
      </MemoryRouter>,
    )
    const names = [
      'Stripe',
      'Fidelity',
      'Linear',
      'JPMorgan Chase',
      'Binance',
      'Coinbase',
      "Lowe's",
      'SonarSource',
      'GitHub',
      'Atlassian',
      'Canva',
      'Amazon',
      'Anthropic',
      'DigitalOcean',
      'Salesforce',
      'Greenhouse',
    ]
    for (const name of names) {
      expect(screen.getAllByAltText(name, { hidden: true })).toHaveLength(2)
    }
    expect(document.querySelectorAll('[aria-hidden="true"]')).toHaveLength(16)
  })
})
