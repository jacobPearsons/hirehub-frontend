import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { Section } from '../ui/Section'
import { Container } from '../ui/Container'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { SkeletonGrid } from '../ui/SkeletonGrid'
import { listPricingTiers } from '../../api/pricing'
import type { PricingTier } from '../../data/pricing'

export function PricingSection() {
  const [tiers, setTiers] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listPricingTiers().then(res => setTiers(res.data)).catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <Section id="pricing" className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05]">
        <img src="/pricing-bg.png" alt="" className="w-full h-full object-cover" loading="lazy" />
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
                <h3 className="text-xl font-medium mb-1">{tier.tier}</h3>
                <p className={`text-[40px] font-medium ${tier.featured ? 'text-inverse-ink' : 'text-ink'}`}>
                  {tier.price === 0 ? 'Custom' : `$${tier.price}`}
                </p>
                <p className="text-sm text-ink-muted mb-1">{tier.period === 'custom' ? '' : '/month'}</p>
                <p className={`text-sm mb-6 ${tier.featured ? 'text-inverse-ink/70' : 'text-ink-muted'}`}>{tier.description}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span className={`text-sm ${tier.featured ? 'text-inverse-ink' : 'text-ink'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant={tier.featured ? 'accent' : 'primary'} size="lg" className="w-full" type="button">{tier.ctaText}</Button>
              </Card>
            </motion.div>
          ))}
        </div>
        )}
      </Container>
    </Section>
  )
}
