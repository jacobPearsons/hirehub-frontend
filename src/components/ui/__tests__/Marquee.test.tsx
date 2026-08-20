import { render, screen } from '@testing-library/react'
import { MotionConfig } from 'framer-motion'
import { Marquee } from '../Marquee'

describe('Marquee', () => {
  it('duplicates items for an endless loop, hiding the second copy from assistive tech', () => {
    render(<Marquee items={[<span key="a">Alpha</span>, <span key="b">Beta</span>]} duration={10} />)
    expect(screen.getAllByText('Alpha', { hidden: true })).toHaveLength(2)
    expect(screen.getAllByText('Beta', { hidden: true })).toHaveLength(2)
    expect(document.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2)
  })

  it('renders a single static row under reduced motion', () => {
    render(
      <MotionConfig reducedMotion="always">
        <Marquee items={[<span key="a">Alpha</span>, <span key="b">Beta</span>]} />
      </MotionConfig>,
    )
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getAllByText('Alpha')).toHaveLength(1)
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull()
  })
})
