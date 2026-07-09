import { Link } from 'react-router-dom'
import { Section } from '../ui/Section'
import { Container } from '../ui/Container'

export function CTABanner() {
  return (
    <Section className="py-20">
      <Container>
        <div className="bg-surface-1 rounded-xl p-12 md:p-16 text-center">
          <h2 className="text-[40px] leading-[1.15] tracking-[-0.8px] font-medium mb-4">
            Ready to find your next role?
          </h2>
          <p className="text-lg text-ink-muted max-w-xl mx-auto mb-8">
            Join thousands of professionals who found their dream job through HireHub.
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center justify-center px-6 py-3 text-base rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 bg-ink text-white hover:bg-[#3a3a3a] dark:hover:bg-[#3a3a3a]"
          >
            Get Started
          </Link>
        </div>
      </Container>
    </Section>
  )
}
