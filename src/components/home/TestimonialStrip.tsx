import { Section } from '../ui/Section'
import { Container } from '../ui/Container'

export function TestimonialStrip() {
  return (
    <Section variant="inverse" className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img
          src="/testimonials-bg.png"
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <Container className="relative">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-4xl opacity-50 mb-4 block" aria-hidden="true">&ldquo;</span>
          <blockquote className="text-[28px] leading-[1.3] font-medium mb-8">
            HireHub helped us find our lead engineer in under two weeks. The quality of
            candidates was unmatched.
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-inverse-surface-1" aria-hidden="true" />
            <div className="text-left">
              <p className="font-medium">Sarah Chen</p>
              <p className="text-sm text-inverse-ink/60">VP of Engineering, Vercel</p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
