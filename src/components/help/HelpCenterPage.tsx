import { useState } from 'react'
import { Building2, LifeBuoy, Plus, Search, UserRound, Headset } from 'lucide-react'
import { Section } from '../ui/Section'
import { Container } from '../ui/Container'
import { usePageMeta } from '../../utils/usePageMeta'
import { helpCategories, type HelpCategory } from './helpData'

const CATEGORY_ICONS: Record<HelpCategory['icon'], typeof Search> = {
  search: Search,
  user: UserRound,
  employer: Building2,
  support: Headset,
}

export default function HelpCenterPage() {
  const meta = usePageMeta({
    title: 'Help Center',
    description: 'Answers about accounts, searching, applying, and hiring on HireHub Community.',
    url: '/help',
  })
  const [query, setQuery] = useState('')

  const normalized = query.trim().toLowerCase()
  const categories = normalized
    ? helpCategories
        .map((category) => ({
          ...category,
          articles: category.articles.filter(
            (article) =>
              article.question.toLowerCase().includes(normalized) ||
              article.answer.toLowerCase().includes(normalized),
          ),
        }))
        .filter((category) => category.articles.length > 0)
    : helpCategories

  return (
    <>
      {meta}
      <Section className="py-16 md:py-20">
        <Container className="max-w-4xl">
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <LifeBuoy className="w-7 h-7 text-accent" aria-hidden="true" />
              <p className="text-sm font-medium text-ink-muted uppercase tracking-wide">Support</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-3">Help Center</h1>
            <p className="text-lg text-ink-muted max-w-2xl mb-8">
              Find answers about accounts, searching, applying, and hiring.
            </p>
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the help center"
                aria-label="Search the help center"
                className="w-full rounded-lg border border-hairline bg-surface-1 pl-9 pr-4 py-2.5 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-ink/30"
              />
            </div>
          </header>

          <div className="space-y-10">
            {categories.length === 0 && (
              <p className="text-sm text-ink-muted">No articles match "{query}". Try a different search.</p>
            )}
            {categories.map((category) => {
              const Icon = CATEGORY_ICONS[category.icon]
              return (
                <section key={category.id} aria-label={category.title}>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-5 h-5 text-accent" aria-hidden="true" />
                    <div>
                      <h2 className="text-2xl font-medium">{category.title}</h2>
                      <p className="text-sm text-ink-muted">{category.description}</p>
                    </div>
                  </div>
                  <div className="space-y-3 mt-4">
                    {category.articles.map((article) => (
                      <details key={article.question} className="group border border-hairline rounded-lg bg-surface-1">
                        <summary className="flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer list-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30">
                          <span className="text-sm font-medium text-ink">{article.question}</span>
                          <span className="text-ink-muted transition-transform group-open:rotate-45" aria-hidden="true">
                            <Plus className="w-4 h-4" />
                          </span>
                        </summary>
                        <p className="px-4 pb-4 text-sm text-ink-muted leading-relaxed">{article.answer}</p>
                      </details>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>

          <div className="mt-14 border border-hairline rounded-xl bg-surface-1 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium mb-1">Still have questions?</h2>
              <p className="text-sm text-ink-muted">Our team is happy to help.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/contact"
                className="inline-flex items-center rounded-lg bg-ink px-4 py-2 text-sm font-medium text-inverse-ink hover:opacity-90 transition-opacity"
              >
                Contact Us
              </a>
              <a
                href="/faq"
                className="inline-flex items-center rounded-lg border border-hairline px-4 py-2 text-sm font-medium text-ink hover:bg-surface-2 transition-colors"
              >
                Visit the FAQ
              </a>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
