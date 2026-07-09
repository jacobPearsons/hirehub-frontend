import { Heart, Shield, Target } from 'lucide-react'
import { Section } from '../ui/Section'
import { Container } from '../ui/Container'
import { Card } from '../ui/Card'

const values = [
  {
    icon: Heart,
    title: 'Transparency',
    description:
      'We believe in radical transparency. Every job listing includes salary ranges, clear requirements, and honest descriptions of company culture.',
  },
  {
    icon: Shield,
    title: 'Community-first',
    description:
      'Our community is our strength. We build tools that help job seekers support each other and share opportunities.',
  },
  {
    icon: Target,
    title: 'Quality over quantity',
    description:
      "We'd rather have 10 great jobs than 100 mediocre ones. Every listing is reviewed to ensure it meets our standards.",
  },
]

export function AboutValues() {
  return (
    <Section className="bg-canvas">
      <Container>
        <h2 className="text-[32px] md:text-[40px] text-center font-medium mb-12">
          What we believe
        </h2>
        <div className="md:grid-cols-3 gap-6 grid">
          {values.map((value) => {
            const Icon = value.icon
            return (
              <Card key={value.title} variant="default" className="p-6">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-accent" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-medium mb-2">{value.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  {value.description}
                </p>
              </Card>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
