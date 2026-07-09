import { Section } from '../ui/Section'
import { Container } from '../ui/Container'

const companies = ['Stripe', 'Vercel', 'Linear', 'Notion', 'Figma', 'Anthropic']

export function TrustBar() {
  return (
    <Section className="py-16">
      <Container>
        <p className="text-sm font-medium text-ink-subtle text-center mb-8">
          Trusted by teams at
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {companies.map((name) => (
            <span key={name} className="text-base font-medium text-ink-muted/50">
              {name}
            </span>
          ))}
        </div>
      </Container>
    </Section>
  )
}
