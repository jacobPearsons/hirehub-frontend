import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HeroSection } from '../HeroSection'

describe('HeroSection', () => {
  it('renders the full headline as the accessible name', () => {
    render(
      <MemoryRouter>
        <HeroSection />
      </MemoryRouter>,
    )
    const heading = screen.getByRole('heading', {
      name: /find your next role at companies that build/i,
    })
    expect(heading).toBeInTheDocument()
  })
})
