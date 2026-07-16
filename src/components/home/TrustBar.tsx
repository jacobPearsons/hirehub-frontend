import { useState } from 'react'
import { Section } from '../ui/Section'
import { Container } from '../ui/Container'

const companies = [
  { name: 'Stripe', logo: '/logos/stripe.com.png' },
  { name: 'Fidelity', logo: '/logos/fidelity.com.png' },
  { name: 'Linear', logo: '/logos/linear.app.png' },
  { name: 'JPMorgan Chase', logo: '/logos/jpmorganchase.com.png' },
  { name: 'Binance', logo: '/logos/binance.com.png' },
  { name: 'Coinbase', logo: '/logos/coinbase.com.png' },
  { name: "Lowe's", logo: '/logos/lowes.com.png' },
  { name: 'SonarSource', logo: '/logos/sonarsource.com.png' },
]

function LogoImg({ name, logo }: { name: string; logo: string }) {
  const [error, setError] = useState(false)
  if (error) {
    return (
      <span className="text-base font-medium text-ink-muted/50">{name}</span>
    )
  }
  return (
    <img
      src={logo}
      alt={name}
      className="h-7 md:h-8 object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300"
      onError={() => setError(true)}
      loading="lazy"
    />
  )
}

export function TrustBar() {
  return (
    <Section className="py-16">
      <Container>
        <p className="text-sm font-medium text-ink-subtle text-center mb-8">
          Trusted by teams at
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {companies.map((c) => (
            <LogoImg key={c.name} name={c.name} logo={c.logo} />
          ))}
        </div>
      </Container>
    </Section>
  )
}
