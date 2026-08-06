import { ScrollText } from 'lucide-react'
import { Section } from '../ui/Section'
import { Container } from '../ui/Container'
import type { LegalDocument } from './legalData'

interface LegalLayoutProps {
  doc: LegalDocument
}

export function LegalLayout({ doc }: LegalLayoutProps) {
  return (
    <Section id="top" className="py-16 md:py-20">
      <Container className="max-w-5xl">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <ScrollText className="w-7 h-7 text-accent" aria-hidden="true" />
            <p className="text-sm font-medium text-ink-muted uppercase tracking-wide">
              HireHub Community
            </p>
          </div>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-3">{doc.title}</h1>
          <p className="text-lg text-ink-muted max-w-2xl">{doc.description}</p>
          <p className="text-sm text-ink-subtle mt-4">Last updated: {doc.updatedAt}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
          <nav aria-label={`${doc.title} sections`} className="hidden lg:block">
            <ul className="space-y-1 sticky top-24">
              {doc.sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block px-3 py-1.5 text-sm text-ink-muted hover:text-ink hover:bg-surface-2 rounded-md transition-colors"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0">
            <div className="space-y-10">
              {doc.sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-24">
                  <h2 className="text-2xl font-medium mb-3">{section.title}</h2>
                  {section.paragraphs.map((paragraph, index) => (
                    <div key={index} className="mb-3">
                      <p className="text-[15px] text-ink-muted leading-relaxed">{paragraph.text}</p>
                      {paragraph.bullets && (
                        <ul className="mt-2 space-y-1 list-disc list-inside text-[15px] text-ink-muted leading-relaxed">
                          {paragraph.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </section>
              ))}
            </div>
            <div className="mt-12 border-t border-hairline pt-6">
              <a href="#top" className="text-sm text-accent hover:underline">
                Back to top
              </a>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
