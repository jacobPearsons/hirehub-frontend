import { Bot, ShieldCheck, Heart, Zap } from 'lucide-react'
import { Section } from '../ui/Section'
import { Container } from '../ui/Container'

const features = [
  {
    title: 'AI-Powered Matching',
    description:
      'Our smart algorithms connect you with roles that truly fit your skills and preferences.',
    icon: Bot,
  },
  {
    title: 'Curated Listings',
    description:
      'Every job is verified. No spam, no outdated posts, no wasting your time.',
    icon: ShieldCheck,
  },
  {
    title: 'Culture Insights',
    description:
      'See beyond the job description. Get authentic insights into company culture and values.',
    icon: Heart,
  },
  {
    title: 'Fast Apply',
    description:
      'Apply with your profile in one click. No redundant form filling.',
    icon: Zap,
  },
]

export function WhyUs() {
  return (
    <Section>
      <Container>
        <p className="text-sm font-medium text-ink-subtle text-center mb-2">
          Why choose us
        </p>
        <h2 className="text-[40px] leading-[1.15] tracking-[-0.8px] font-medium text-center mb-12">
          Built for modern hiring
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title}>
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-ink/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-5 h-5 text-ink" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{feature.title}</h3>
                    <p className="text-base text-ink-muted mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
