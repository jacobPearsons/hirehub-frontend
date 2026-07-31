import { render, screen } from '@testing-library/react'
import { OnboardingProgress } from '../OnboardingProgress'

describe('OnboardingProgress', () => {
  const labels = ['Basics', 'Resume', 'Skills', 'Preferences', 'Done']

  it('renders "Step 1 of 5" and the current label at index 0', () => {
    render(<OnboardingProgress current={0} total={5} labels={labels} />)
    expect(screen.getByText(/step 1 of 5/i)).toBeInTheDocument()
    expect(screen.getByText(/basics/i)).toBeInTheDocument()
  })

  it('renders "0% complete" at step 0 and "100% complete" on the last step', () => {
    const { rerender } = render(<OnboardingProgress current={0} total={5} labels={labels} />)
    expect(screen.getByText(/0% complete/i)).toBeInTheDocument()

    rerender(<OnboardingProgress current={4} total={5} labels={labels} />)
    expect(screen.getByText(/100% complete/i)).toBeInTheDocument()
    expect(screen.getByText(/step 5 of 5/i)).toBeInTheDocument()
  })
})
