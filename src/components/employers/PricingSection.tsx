import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { Section } from '../ui/Section'
import { Container } from '../ui/Container'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { SkeletonGrid } from '../ui/SkeletonGrid'
import { listPricingTiers } from '../../api/pricing'
import { useApp } from '../../context/AppContext'
import { PaymentModal } from './PaymentModal'
import type { PricingTier } from '../../data/pricing'

export function PricingSection() {
  const { user } = useApp()
  const [tiers, setTiers] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null)
  const navigate = useNavigate()

  const handlePaid = (conversationId: string) => {
    const base = user?.role === 'employer' ? '/employer/dashboard' : '/dashboard'
    navigate(`${base}?tab=messages&conv=${conversationId}`)
  }

  useEffect(() => {
    listPricingTiers().then(res => setTiers(res.data)).catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <Section id="pricing" className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05]">
          <img src="/pricing-bg.svg" alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>
      <Container className="relative">
        <h2 className="text-[32px] md:text-[40px] leading-[1.15] font-medium text-center mb-4">
          Simple, transparent pricing
        </h2>
        <p className="text-lg text-ink-muted text-center max-w-2xl mx-auto mb-12">
          Choose the plan that fits your team. No hidden fees, no surprises.
        </p>
        {loading ? (
          <div className="max-w-5xl mx-auto">
            <SkeletonGrid count={3} columns={3} />
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <motion.div key={tier.tier} whileHover={{ y: -6 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
              <Card variant="pricing" className={`${tier.featured ? 'relative' : ''}`} featured={tier.featured}>
                {tier.featured && <span className="inline-block text-xs font-medium text-accent mb-2">Most Popular</span>}
                <h3 className="text-xl text-black dark:text-inverse-ink/70 font-medium mb-1">{tier.tier}</h3>
                <p className={`text-[40px] font-medium ${tier.featured ? 'text-black dark:text-inverse-ink/70' : 'text-ink'}`}>
                  {tier.price === 0 ? 'Custom' : `$${tier.price}`}
                </p>
                <p className="text-sm text-ink-muted mb-1">{tier.period === 'custom' ? '' : '/month'}</p>
                <p className={`text-sm mb-6 ${tier.featured ? 'text-black dark:text-inverse-ink/70' : 'text-ink-muted'}`}>{tier.description}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span className={`text-sm ${tier.featured ? 'text-black dark:text-inverse-ink/70' : 'text-ink'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant={tier.featured ? 'accent' : 'primary'} size="lg" className="w-full" type="button" onClick={() => setSelectedTier(tier)}>{tier.ctaText}</Button>
              </Card>
            </motion.div>
          ))}
        </div>
        )}
      </Container>
      {selectedTier && (
        <PaymentModal
          tier={selectedTier}
          open
          onOpenChange={(o) => !o && setSelectedTier(null)}
          onPaid={handlePaid}
        />
      )}
    </Section>
  )
}
