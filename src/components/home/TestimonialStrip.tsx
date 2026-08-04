import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Section } from '../ui/Section'
import { Container } from '../ui/Container'

const testimonials = [
  {
    quote:
      'HireHub helped us find our lead engineer in under two weeks. The quality of candidates was unmatched.',
    name: 'Sarah Chen',
    role: 'VP of Engineering, Vercel',
  },
  {
    quote:
      'We posted a single role and had a strong shortlist within days. The vetting meant every interview felt worthwhile.',
    name: 'Marcus Webb',
    role: 'Engineering Manager, Linear',
  },
  {
    quote:
      'Our team hired two backend engineers through HireHub. The candidates came prepared and stayed with us long-term.',
    name: 'Aisha Rahman',
    role: 'Head of Talent, Stripe',
  },
]

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function TestimonialStrip() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const active = testimonials[index]

  useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => window.clearInterval(id)
  }, [paused])

  return (
    <Section variant="inverse" className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img
          src="/testimonials-bg.svg"
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <Container className="relative">
        <div
          className="max-w-3xl mx-auto text-center"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <span className="text-4xl opacity-50 mb-4 block" aria-hidden="true">&ldquo;</span>
          <div className="relative min-h-[120px] sm:min-h-[104px] flex items-center justify-center mb-8">
            <AnimatePresence mode="wait">
              <motion.figure
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="w-full"
              >
                <blockquote className="text-[28px] leading-[1.3] font-medium">
                  {active.quote}
                </blockquote>
                <figcaption className="mt-6 flex items-center justify-center gap-3">
                  <span
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-inverse-surface-1 text-inverse-ink text-sm font-semibold"
                    aria-hidden="true"
                  >
                    {getInitials(active.name)}
                  </span>
                  <span className="text-left">
                    <span className="block font-medium">{active.name}</span>
                    <span className="block text-sm text-inverse-ink/60">{active.role}</span>
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-center gap-1.5" aria-hidden="true">
            {testimonials.map((t, i) => (
              <button
                key={t.name}
                type="button"
                tabIndex={-1}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? 'w-6 bg-inverse-ink/80' : 'w-1.5 bg-inverse-ink/25'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}
