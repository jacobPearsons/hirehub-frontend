import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Footer } from '../Footer'

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  )
}

describe('Footer', () => {
  it('links the Help Center and legal pages to real routes', () => {
    renderFooter()
    expect(screen.getByRole('link', { name: 'Help Center' })).toHaveAttribute('href', '/help')
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy')
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('href', '/terms')
    expect(screen.getByRole('link', { name: 'Cookie Policy' })).toHaveAttribute('href', '/cookies')
  })

  it('has no links pointing at "#" in the content columns', () => {
    renderFooter()
    const links = screen.getAllByRole('link')
    const hashLinks = links.filter((link) => link.getAttribute('href') === '#')
    expect(hashLinks).toHaveLength(3)
  })
})
