import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('opens an item when its summary is clicked', async () => {
    const user = userEvent.setup()
    render(<FAQSection />)
    const question = screen.getByText('How do I create an account?')
    await user.click(question)
    expect(question.closest('details')).toHaveAttribute('open')
  })

  it('closes the previous item when another one is opened', async () => {
    const user = userEvent.setup()
    render(<FAQSection />)
    const first = screen.getByText('How do I create an account?')
    const second = screen.getByText('How do I apply for a job?')
    await user.click(first)
    expect(first.closest('details')).toHaveAttribute('open')
    await user.click(second)
    expect(second.closest('details')).toHaveAttribute('open')
    expect(first.closest('details')).not.toHaveAttribute('open')
  })

  it('closes an item when the open one is clicked again', async () => {
    const user = userEvent.setup()
    render(<FAQSection />)
    const question = screen.getByText('How do I create an account?')
    await user.click(question)
    expect(question.closest('details')).toHaveAttribute('open')
    await user.click(question)
    expect(question.closest('details')).not.toHaveAttribute('open')
  })
})
