### Task 3: Help Center

**Files:**
- Create: `src/components/help/helpData.ts`
- Create: `src/components/help/HelpCenterPage.tsx`
- Create: `src/components/help/index.ts`
- Modify: `src/App.tsx` (lazy import + `/help` route)
- Test: `src/components/help/__tests__/HelpCenterPage.test.tsx`

**Interfaces:**
- Consumes: `usePageMeta`, `Section`, `Container`, lucide-react icons, `details`/`summary` accordion pattern from `FAQSection`.
- Produces:
  - `interface HelpArticle { question: string; answer: string }`
  - `interface HelpCategory { id: string; title: string; description: string; icon: 'search' | 'user' | 'employer' | 'support'; articles: HelpArticle[] }`
  - `export const helpCategories: HelpCategory[]`
  - `export default function HelpCenterPage()` — heading + search filter input (labeled "Search the help center") + category accordions + contact CTA; default route `/help` in `App.tsx`; `src/components/help/index.ts` barrel.

- [ ] **Step 1: Write the failing test**

Create `src/components/help/__tests__/HelpCenterPage.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HelpCenterPage from '../HelpCenterPage'

vi.mock('../../../utils/usePageMeta', () => ({
  usePageMeta: () => null,
}))

describe('HelpCenterPage', () => {
  it('renders a heading and every category title', () => {
    render(<HelpCenterPage />)
    expect(screen.getByRole('heading', { level: 1, name: /help center/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /for job seekers/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /for employers/i })).toBeInTheDocument()
  })

  it('renders article questions as accordion summaries', () => {
    render(<HelpCenterPage />)
    expect(screen.getByText('How do I create an account?')).toBeInTheDocument()
    expect(screen.getByText('How do I apply to a job?')).toBeInTheDocument()
  })

  it('filters articles as the user types', async () => {
    const user = userEvent.setup()
    render(<HelpCenterPage />)
    const input = screen.getByRole('textbox', { name: /search the help center/i })
    await user.type(input, 'reset my password')
    expect(screen.getByText('How do I reset my password?')).toBeInTheDocument()
    expect(screen.queryByText('How do I create an account?')).not.toBeInTheDocument()
  })

  it('links to contact and FAQ pages', () => {
    render(<HelpCenterPage />)
    expect(screen.getByRole('link', { name: /contact us/i })).toHaveAttribute('href', '/contact')
    expect(screen.getByRole('link', { name: /visit the faq/i })).toHaveAttribute('href', '/faq')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/help`
Expected: FAIL — modules `../HelpCenterPage` cannot be resolved.

- [ ] **Step 3: Create `src/components/help/helpData.ts`**

```ts
export interface HelpArticle {
  question: string
  answer: string
}

export interface HelpCategory {
  id: string
  title: string
  description: string
  icon: 'search' | 'user' | 'employer' | 'support'
  articles: HelpArticle[]
}

export const helpCategories: HelpCategory[] = [
  {
    id: 'job-seekers',
    title: 'For Job Seekers',
    description: 'Accounts, searching, and applying to jobs.',
    icon: 'user',
    articles: [
      {
        question: 'How do I create an account?',
        answer: 'Click "Sign up" in the top navigation, choose your role (Job Seeker or Employer), and complete the onboarding wizard. You will need a valid email address.',
      },
      {
        question: 'How do I apply to a job?',
        answer: 'Open a job listing and click "Apply". Your profile and resume are sent to the employer, and you can track the application status on your dashboard.',
      },
      {
        question: 'How do I reset my password?',
        answer: 'On the login page, click "Forgot password". We will email you a link that expires in one hour. Click it to choose a new password.',
      },
      {
        question: 'How do I save a job to apply later?',
        answer: 'Click the bookmark icon on any job listing to save it. Saved jobs appear under the "Saved Jobs" tab on your dashboard.',
      },
      {
        question: 'How do I update my profile?',
        answer: 'Go to your dashboard and open the Profile page. You can update your photo, skills, work history, and contact details there.',
      },
    ],
  },
  {
    id: 'employers',
    title: 'For Employers',
    description: 'Posting jobs, reviewing applicants, and hiring.',
    icon: 'employer',
    articles: [
      {
        question: 'How do I post a job?',
        answer: 'Sign in with an employer account and click "Post a Job". Fill in the role details, location, pay, and requirements, then publish. Your listing goes live immediately.',
      },
      {
        question: 'How do I review applicants?',
        answer: 'Open the Applicants tab on your employer dashboard. You can view each candidate profile, move them through pipeline stages, and message them directly.',
      },
      {
        question: 'How do I schedule an interview?',
        answer: 'From an applicant record, use the interview invitation action to send the candidate a scheduled interview with date, time, and meeting link.',
      },
      {
        question: 'Can I edit or close a job posting?',
        answer: 'Yes. On your job listings, open the listing and choose Edit to change details or Close to stop receiving new applications.',
      },
    ],
  },
  {
    id: 'accounts-billing',
    title: 'Accounts & Billing',
    description: 'Payments, invoices, and plan questions.',
    icon: 'search',
    articles: [
      {
        question: 'What does HireHub Community cost?',
        answer: 'Job seekers can use HireHub Community for free. Employers pay a flat rate per published job; see the Employers page for current pricing.',
      },
      {
        question: 'How do I update my payment method?',
        answer: 'Open your employer dashboard, navigate to Billing, and update your payment method there. We never store full card numbers on our servers.',
      },
    ],
  },
  {
    id: 'support',
    title: 'Still need help?',
    description: 'Reach a human or find more answers.',
    icon: 'support',
    articles: [
      {
        question: 'How do I contact support?',
        answer: 'Email support@hirehub.community and we will get back to you within one business day.',
      },
      {
        question: 'Where can I read the FAQ?',
        answer: 'Our FAQ page covers registering, hiring, and interviews in more depth.',
      },
    ],
  },
]
```

- [ ] **Step 4: Create `src/components/help/HelpCenterPage.tsx`**

```tsx
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
                type="search"
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
```

- [ ] **Step 5: Create `src/components/help/index.ts`**

```ts
export { helpCategories, type HelpArticle, type HelpCategory } from './helpData'
export { default as HelpCenterPage } from './HelpCenterPage'
```

- [ ] **Step 6: Wire the route in `src/App.tsx`**

Add the lazy import after the `CookiePolicyPage` import added in Task 2:

```tsx
const HelpCenterPage = lazy(() => import('./components/help/HelpCenterPage'))
```

Add the route after the `/cookies` route:

```tsx
<Route path="/help" element={<ErrorBoundary><HelpCenterPage /></ErrorBoundary>} />
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx vitest run src/components/help`
Expected: PASS (4 tests in HelpCenterPage.test.tsx).

- [ ] **Step 8: Typecheck, lint, and full suite**

Run: `npx tsc --noEmit && npx eslint . && npx vitest run`
Expected: tsc clean, eslint clean, all tests pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/help/helpData.ts src/components/help/HelpCenterPage.tsx src/components/help/index.ts src/components/help/__tests__/HelpCenterPage.test.tsx src/App.tsx
git commit -m "feat(help): add help center page with searchable categories"
```

---

