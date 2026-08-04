import { Section } from '../ui/Section'
import { Container } from '../ui/Container'

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
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[32px] md:text-[40px] leading-[1.15] tracking-[-0.8px] font-medium mb-6">
            The people you want are already here
          </h2>
          <p className="text-lg text-ink-muted leading-[1.7]">
            More than <span className="text-ink font-medium">ten thousand active job seekers</span>{' '}
            open HireHub every day looking for their next role, and right now{' '}
            <span className="text-ink font-medium">over five hundred companies are hiring</span>{' '}
            through the platform. Ninety-four percent of the teams that have run a hiring cycle
            with us say they’d come back. That’s the pool you’re posting into.
          </p>
        </div>
      </Container>
    </Section>
  )
}
