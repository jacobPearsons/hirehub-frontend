import { useState } from 'react'
import { HelpCircle, Plus } from 'lucide-react'
import { Section } from '../ui/Section'
import { Container } from '../ui/Container'
import { faqItems } from './faqData'

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  function handleToggle(index: number) {
    setOpenIndex((current) => (current === index ? null : index))
  }

  return (
    <Section id="faq" className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05]" aria-hidden="true">
        <img src="/faq-bg.svg" alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>
      <Container className="relative max-w-3xl">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="w-7 h-7 text-accent" aria-hidden="true" />
          <h2 className="text-[32px] md:text-[40px] leading-[1.15] font-medium">
            Frequently asked questions
          </h2>
        </div>
        <p className="text-lg text-ink-muted mb-10">
          Everything you need to know about registering, hiring, and interviews.
        </p>
        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <details
              key={item.question}
              open={openIndex === index}
              className="group border border-hairline rounded-lg bg-surface-1"
            >
              <summary
                onClick={(e) => {
                  e.preventDefault()
                  handleToggle(index)
                }}
                aria-expanded={openIndex === index}
                className="flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer list-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
              >
                <span className="text-sm font-medium text-ink">{item.question}</span>
                <span className="text-ink-muted transition-transform group-open:rotate-45" aria-hidden="true">
                  <Plus className="w-4 h-4" />
                </span>
              </summary>
              <p className="px-4 pb-4 text-sm text-ink-muted leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  )
}
