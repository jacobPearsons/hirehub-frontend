import { render, screen } from '@testing-library/react'
import { act } from 'react'
import { MotionConfig } from 'framer-motion'
import { Typewriter } from '../Typewriter'

describe('Typewriter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('exposes the full phrase as the accessible name', () => {
    render(<Typewriter text="Find your next role" />)
    expect(screen.getByLabelText('Find your next role')).toBeInTheDocument()
  })

  it('types the full text, holds, deletes, then loops', () => {
    render(<Typewriter text="abc" speed={10} deleteSpeed={5} holdMs={100} />)

    act(() => { vi.advanceTimersByTime(10) })
    expect(screen.getByText('a', { hidden: true })).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(10) })
    expect(screen.getByText('ab', { hidden: true })).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(10) })
    expect(screen.getByText('abc', { hidden: true })).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(100) })
    act(() => { vi.advanceTimersByTime(5) })
    expect(screen.getByText('ab', { hidden: true })).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(5) })
    act(() => { vi.advanceTimersByTime(5) })
    expect(screen.queryByText('a', { hidden: true })).not.toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(10) })
    expect(screen.getByText('a', { hidden: true })).toBeInTheDocument()
  })

  it('renders the full text statically under reduced motion', () => {
    render(
      <MotionConfig reducedMotion="always">
        <Typewriter text="abc" />
      </MotionConfig>,
    )
    expect(screen.getByText('abc', { hidden: true })).toBeInTheDocument()
    expect(screen.queryByText('|', { hidden: true })).not.toBeInTheDocument()
  })
})
