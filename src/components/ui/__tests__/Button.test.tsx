import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../Button'

describe('Button', () => {
  it('renders with children text', () => {
    render(<Button variant="primary" size="md">Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button variant="primary" size="md" onClick={handleClick}>Click</Button>)
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('applies primary variant styles by default', () => {
    render(<Button variant="primary" size="md">Primary</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-ink')
  })

  it('applies secondary variant styles when variant="secondary"', () => {
    render(<Button variant="secondary" size="md">Secondary</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-surface-2')
  })

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button variant="primary" size="md" disabled onClick={handleClick}>Disabled</Button>)
    await user.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('has type="button" by default', () => {
    render(<Button variant="primary" size="md">Button</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('has correct aria-label when provided', () => {
    render(<Button variant="primary" size="md" aria-label="Custom label">Icon</Button>)
    expect(screen.getByRole('button', { name: 'Custom label' })).toBeInTheDocument()
  })
})
