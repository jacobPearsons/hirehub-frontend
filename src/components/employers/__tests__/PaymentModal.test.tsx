import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { PaymentModal } from '../PaymentModal'
import type { PricingTier } from '../../../data/pricing'

const { mockOpenSupportConversation, mockUseApp } = vi.hoisted(() => ({
  mockOpenSupportConversation: vi.fn(),
  mockUseApp: vi.fn(),
}))

vi.mock('../../../api/messages', () => ({
  openSupportConversation: () => mockOpenSupportConversation(),
}))

vi.mock('../../../context/AppContext', () => ({
  useApp: () => mockUseApp(),
}))

const tier: PricingTier = { tier: 'Pro', price: 299, period: 'month', description: 'x', features: ['a'], ctaText: 'Start Free Trial', featured: true }

const conversation = {
  id: 'conv-1',
  employerId: 'employer-1',
  candidateId: 'candidate-1',
  employer: { id: 'employer-1', name: 'HireHub Team', role: 'ADMIN' },
  candidate: { id: 'candidate-1', name: 'Jane Doe', role: 'CANDIDATE' },
  messages: [],
  updatedAt: '2026-08-01T00:00:00.000Z',
}

describe('PaymentModal', () => {
  beforeEach(() => {
    mockOpenSupportConversation.mockReset()
    mockUseApp.mockReset()
  })

  it('submits a mock payment, shows a thank-you state, and starts chatting via onPaid', async () => {
    const user = userEvent.setup()
    const onPaid = vi.fn()
    mockUseApp.mockReturnValue({ user: { id: 'u1', name: 'Acme', email: 'acme@x.com', role: 'employer' } })
    mockOpenSupportConversation.mockResolvedValue({ success: true, data: conversation })

    render(
      <MemoryRouter>
        <PaymentModal tier={tier} open onOpenChange={() => {}} onPaid={onPaid} />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/card number/i), '4242 4242 4242 4242')
    await user.click(screen.getByRole('button', { name: /pay/i }))

    expect(await screen.findByText(/thank you/i)).toBeInTheDocument()
    expect(mockOpenSupportConversation).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: /start chatting/i }))
    expect(onPaid).toHaveBeenCalledWith('conv-1')
  })

  it('shows a sign-in-required state linking to /login when unauthenticated', () => {
    mockUseApp.mockReturnValue({ user: null })

    render(
      <MemoryRouter>
        <PaymentModal tier={tier} open onOpenChange={() => {}} onPaid={vi.fn()} />
      </MemoryRouter>
    )

    expect(screen.getByText(/sign in required/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login')
  })

  it('auto-navigates to chat about 1.2s after a successful payment', async () => {
    const user = userEvent.setup()
    const onPaid = vi.fn()
    mockUseApp.mockReturnValue({ user: { id: 'u1', name: 'Acme', email: 'acme@x.com', role: 'employer' } })
    mockOpenSupportConversation.mockResolvedValue({ success: true, data: conversation })

    render(
      <MemoryRouter>
        <PaymentModal tier={tier} open onOpenChange={() => {}} onPaid={onPaid} />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/card number/i), '4242 4242 4242 4242')
    await user.click(screen.getByRole('button', { name: /pay/i }))

    await screen.findByText(/thank you/i)
    expect(onPaid).not.toHaveBeenCalled()

    await waitFor(() => expect(onPaid).toHaveBeenCalledWith('conv-1'), { timeout: 2000 })
  })
})
