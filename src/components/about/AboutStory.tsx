import { Section } from '../ui/Section'
import { Container } from '../ui/Container'
import { Card } from '../ui/Card'

const stats = [
  { value: '10,000+', label: 'Jobs posted' },
  { value: '500+', label: 'Companies' },
  { value: '50,000+', label: 'Job seekers' },
  { value: '94%', label: 'Satisfaction' },
]

export function AboutStory() {
  return (
    <Section>
      <Container>
        <div className="md:grid-cols-2 gap-12 items-center grid">
          <div>
            <h2 className="text-[32px] md:text-[40px] font-medium mb-4">
              Our story
            </h2>
            <p className="text-base text-ink-muted leading-relaxed mb-4">
              HireHub Community was born from a simple idea: hiring should be
              about people, not processes. We started as a small group of
              recruiters and developers who believed there was a better way to
              connect talent with opportunity.
            </p>
            <p className="text-base text-ink-muted leading-relaxed mb-4">
              Today, we're a thriving platform that serves thousands of job
              seekers and employers worldwide. Our community-driven approach
              ensures that every connection is meaningful and every opportunity
              is genuine.
            </p>
            <p className="text-base text-ink-muted leading-relaxed">
              We're continuously evolving, guided by feedback from our community
              and our unwavering commitment to making hiring human again.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat) => (
              <Card key={stat.label} variant="default" className="p-6 text-center">
                <div className="text-[28px] md:text-[34px] font-medium text-ink leading-none mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-ink-muted">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}
