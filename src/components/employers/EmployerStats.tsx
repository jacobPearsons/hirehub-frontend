import { Section } from '../ui/Section'
import { Container } from '../ui/Container'

const stats = [
  { number: '10,000+', label: 'Active Job Seekers' },
  { number: '500+', label: 'Companies Hiring' },
  { number: '94%', label: 'Satisfaction Rate' },
] as const

export function EmployerStats() {
  return (
    <Section className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06]">
        <img
          src="/employer-stats.svg"
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <Container className="relative">
        <h2 className="sr-only">HireHub by the numbers</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-[40px] font-medium text-ink">
                {stat.number}
              </span>
              <span className="text-sm text-ink-muted">{stat.label}</span>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
