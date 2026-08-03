import { render, screen } from '@testing-library/react'
import { PricingSection } from '../PricingSection'
import type { PricingTier } from '../../../data/pricing'

const mockNavigate = vi.fn()
const mockListPricingTiers = vi.fn()
const mockUseApp = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('../../../context/AppContext', () => ({
  useApp: () => mockUseApp(),
}))

vi.mock('../../../api/pricing', () => ({
  listPricingTiers: () => mockListPricingTiers(),
}))

vi.mock('../PaymentModal', () => ({
  PaymentModal: ({ tier, onPaid }: { tier: PricingTier | null; onPaid: (id: string) => void }) => (
    <button type="button" onClick={() => onPaid('conv-1')}>
      simulate-paid:{tier?.tier}
    </button>
  ),
}))

const tiers: PricingTier[] = [
  { tier: 'Pro', price: 299, period: 'month', description: 'x', features: ['a'], ctaText: 'Start Free Trial', featured: true },
]

describe('PricingSection', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    mockListPricingTiers.mockReset().mockResolvedValue({ data: tiers })
  })

  it('routes a paying employer to the employer dashboard messages tab with the conversation', async () => {
    mockUseApp.mockReturnValue({ user: { id: 'e1', name: 'Acme', role: 'employer' } })
    render(<PricingSection />)
    await screen.findByText('Simple, transparent pricing')
    await screen.findByRole('button', { name: /start free trial/i })
    screen.getByRole('button', { name: /simulate-paid/i }).click()
    expect(mockNavigate).toHaveBeenCalledWith('/employer/dashboard?tab=messages&conv=conv-1')
  })

  it('routes a paying seeker to the seeker dashboard messages tab', async () => {
    mockUseApp.mockReturnValue({ user: { id: 's1', name: 'Jane', role: 'seeker' } })
    render(<PricingSection />)
    await screen.findByRole('button', { name: /start free trial/i })
    screen.getByRole('button', { name: /simulate-paid/i }).click()
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard?tab=messages&conv=conv-1')
  })
})
