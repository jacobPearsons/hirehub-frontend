import { Users, Building2, Sparkles } from 'lucide-react'
import { Section } from '../ui/Section'
import { Container } from '../ui/Container'
import { Card } from '../ui/Card'

const features = [
  {
    title: 'For Talent',
    description:
      'Discover roles that match your skills and ambitions. Smart recommendations tailored to you.',
    icon: Users,
  },
  {
    title: 'For Employers',
    description:
      'Post jobs, find top candidates, and build your dream team with powerful matching.',
    icon: Building2,
  },
  {
    title: 'For Teams',
    description:
      'Scale your workforce with confidence. From one hire to a hundred, we\'ve got you covered.',
    icon: Sparkles,
  },
]

export function ValueProps() {
  return (
    <Section className="relative overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-full opacity-[0.08] pointer-events-none hidden lg:block">
        <img
          src="/valueprops-feature.svg"
          alt=""
          className="w-full h-full object-contain object-right"
          loading="lazy"
        />
      </div>
      <Container>
        <h2 className="text-[40px] leading-[1.15] tracking-[-0.8px] font-medium text-center mb-4">
          Why HireHub?
        </h2>
        <p className="text-lg text-ink-muted text-center max-w-xl mx-auto mb-12">
          We connect great talent with great companies — faster, smarter, and more transparently.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} variant="feature">
                <div className="w-12 h-12 rounded-full bg-accent/5 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-ink" aria-hidden="true" />
                </div>
                <h3 className="text-[22px] leading-[1.25] tracking-[-0.3px] font-medium mb-2">
                  {feature.title}
                </h3>
                <p className="text-base leading-[1.5] text-ink-muted">
                  {feature.description}
                </p>
              </Card>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
