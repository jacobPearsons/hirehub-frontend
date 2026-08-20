# Legal Pages, Help Center, and Cross-Client Emails — Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship four missing public pages (Privacy Policy, Terms of Service, Cookie Policy, Help Center) with real content and fix the footer's broken `#` links, then rebuild the EmailJS templates (`src/api/emails.ts`) on a dark-mode-aware, Outlook-ghost-table, bulletproof-CTA email shell with exported pure renderers so they can be unit tested.

**Architecture:** Legal pages are content-driven — a `legalData.ts` module holds typed documents (sections/paragraphs/bullets) rendered by a shared `LegalLayout` with a sticky anchor sidebar. The Help Center is a data-driven accordion page with a live client-side search filter. Both are wired as lazy routes in `App.tsx`. Emails are rebuilt with a shared `renderShell()` (design tokens, dark-mode CSS, MSO ghost table, bulletproof logo + CTA) and each template renderer returns `{ subject, html }` from a single exported `renderEmailTemplate()` dispatcher; EmailJS sending stays behind the same five public functions.

**Tech Stack:** React 19.2, React Router 7, Tailwind CSS 3 (tokens `surface-1/2`, `canvas`, `ink`, `accent`, `hairline`), lucide-react, @emailjs/browser 4.4.1, Vitest 4 + Testing Library + jsdom.

## Global Constraints

- Repo: `hirehub-frontend` at `/home/jacobp/Desktop/Projecs/hirehub-frontend`, branch `main`. Never create or switch branches; work in the current working tree and commit directly on `main`.
- Never `git add -A` or `git add .` — stage only the task-named files listed in each task's Files section. The working tree already contains unrelated uncommitted files (`.superpowers/sdd/*`, `public/logos/*`, `PricingSection.tsx`, `HeroSection.tsx`, etc.) — leave them untouched and un-staged.
- TDD: write the failing test first, run it to confirm it fails, implement, run to confirm it passes.
- Verification commands (run from repo root): `npx tsc --noEmit`, `npx eslint .`, `npx vitest run`. Baseline: 237 tests across 59 files pass and tsc is clean.
- No new npm dependencies. Do not change any public signature of the five email senders (`sendInterviewInvitation`, `sendPostInterviewFollowUp`, `sendOfferLetter`, `sendPreBoardingChecklist`, `sendOrientationDetails`) or their param interfaces. No EmailJS→backend delivery migration.
- `usePageMeta({ title, description, url })` renders `${title} | HireHub Community`; every public page must render `{meta}` and pass a unique `url`.
- Email standards (email-engineering skill) — every rendered email MUST contain: `<meta name="color-scheme" content="light dark">`, `<meta name="supported-color-schemes" content="light dark">`, a `@media (prefers-color-scheme: dark)` block AND an Outlook `[data-ogsc]` block, an MSO ghost table + `<o:PixelsPerInch>96</o:PixelsPerInch>`, `bgcolor` + `background-color` on every colored cell, bulletproof CTA (table wrapper, padding on the `<td>`, `display:inline-block` on the `<a>`), `<html lang="en">`, `role="presentation"` + `border="0"` on all layout tables, preheader hidden div, and footer copy "You're receiving this because you have a HireHub account."
- Email design tokens (light): page bg `#f4f4f5`, card `#ffffff`, text `#374151`, muted `#9ca3af`, footer `#6b7280`, wordmark `#111827`, CTA `#2563eb`, logo tile `#ff5600`, logo bars `#ffffff`, font `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif` with `@import` of Inter 400/700. Dark mode: bg `#1a1a1a`, card `#2d2d2d`, text `#e5e7eb`, muted `#9ca3af`, link `#4da6ff`. Frontend email container max-width `600px`.
- Every user-provided value in an email is HTML-escaped; meeting links render only when they start with `http://` or `https://`.
- Commit style follows repo history (`feat(scope): message`). Commit after each task's green verification, staging only that task's files.

---

### Task 1: Legal content model and `LegalLayout`

**Files:**
- Create: `src/components/legal/legalData.ts`
- Create: `src/components/legal/LegalLayout.tsx`
- Test: `src/components/legal/__tests__/legalData.test.ts`
- Test: `src/components/legal/__tests__/LegalLayout.test.tsx`

**Interfaces:**
- Consumes: `usePageMeta` (Task 2 pages use it, not this task); `Section`/`Container` from `../ui`.
- Produces:
  - `interface LegalParagraph { text: string; bullets?: string[] }`
  - `interface LegalSection { id: string; title: string; paragraphs: LegalParagraph[] }`
  - `interface LegalDocument { slug: 'privacy' | 'terms' | 'cookies'; title: string; description: string; updatedAt: string; sections: LegalSection[] }`
  - `export const legalDocuments: LegalDocument[]` (order: privacy, terms, cookies)
  - `export function LegalLayout({ doc }: { doc: LegalDocument })` — renders header + sticky anchor sidebar + section content + "Back to top".
  - `export function getLegalDocument(slug: LegalDocument['slug']): LegalDocument`

- [ ] **Step 1: Write the failing tests**

Create `src/components/legal/__tests__/legalData.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { getLegalDocument, legalDocuments } from '../legalData'

describe('legalDocuments', () => {
  it('defines privacy, terms, and cookies documents in order', () => {
    expect(legalDocuments.map((d) => d.slug)).toEqual(['privacy', 'terms', 'cookies'])
  })

  it('gives every document a title, description, and updated date', () => {
    for (const doc of legalDocuments) {
      expect(doc.title.length).toBeGreaterThan(0)
      expect(doc.description.length).toBeGreaterThan(0)
      expect(doc.updatedAt).toMatch(/^\w+ \d{1,2}, \d{4}$/)
    }
  })

  it('has unique section ids and at least one paragraph per section', () => {
    for (const doc of legalDocuments) {
      const ids = doc.sections.map((s) => s.id)
      expect(new Set(ids).size).toBe(ids.length)
      for (const section of doc.sections) {
        expect(section.id.length).toBeGreaterThan(0)
        expect(section.title.length).toBeGreaterThan(0)
        expect(section.paragraphs.length).toBeGreaterThan(0)
      }
    }
  })

  it('looks up a document by slug', () => {
    expect(getLegalDocument('privacy').title).toBe('Privacy Policy')
    expect(getLegalDocument('terms').title).toBe('Terms of Service')
    expect(getLegalDocument('cookies').title).toBe('Cookie Policy')
  })
})
```

Create `src/components/legal/__tests__/LegalLayout.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { LegalLayout } from '../LegalLayout'
import type { LegalDocument } from '../legalData'

const fixture: LegalDocument = {
  slug: 'privacy',
  title: 'Privacy Policy',
  description: 'How HireHub Community handles your data.',
  updatedAt: 'August 6, 2026',
  sections: [
    {
      id: 'info-we-collect',
      title: 'Information We Collect',
      paragraphs: [
        { text: 'We collect information you provide directly.' },
        { text: 'We also collect usage data.', bullets: ['Pages visited', 'Searches'] },
      ],
    },
    {
      id: 'contact',
      title: 'Contact Us',
      paragraphs: [{ text: 'Email support@hirehub.community.' }],
    },
  ],
}

describe('LegalLayout', () => {
  it('renders the title, description, and last-updated date', () => {
    render(<LegalLayout doc={fixture} />)
    expect(screen.getByRole('heading', { level: 1, name: /privacy policy/i })).toBeInTheDocument()
    expect(screen.getByText('How HireHub Community handles your data.')).toBeInTheDocument()
    expect(screen.getByText(/last updated: august 6, 2026/i)).toBeInTheDocument()
  })

  it('renders every section heading', () => {
    render(<LegalLayout doc={fixture} />)
    expect(screen.getByRole('heading', { level: 2, name: /information we collect/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /contact us/i })).toBeInTheDocument()
  })

  it('renders paragraph text and bullets', () => {
    render(<LegalLayout doc={fixture} />)
    expect(screen.getByText('We collect information you provide directly.')).toBeInTheDocument()
    expect(screen.getByText('Pages visited')).toBeInTheDocument()
  })

  it('renders a sidebar nav with an anchor per section', () => {
    render(<LegalLayout doc={fixture} />)
    const nav = screen.getByRole('navigation', { name: /sections/i })
    const link = nav.querySelector('a[href="#info-we-collect"]')
    expect(link).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/legal`
Expected: FAIL — modules `../legalData` and `../LegalLayout` cannot be resolved.

- [ ] **Step 3: Create `src/components/legal/legalData.ts`**

```ts
export interface LegalParagraph {
  text: string
  bullets?: string[]
}

export interface LegalSection {
  id: string
  title: string
  paragraphs: LegalParagraph[]
}

export interface LegalDocument {
  slug: 'privacy' | 'terms' | 'cookies'
  title: string
  description: string
  updatedAt: string
  sections: LegalSection[]
}

const privacySections: LegalSection[] = [
  {
    id: 'info-we-collect',
    title: 'Information We Collect',
    paragraphs: [
      { text: "We collect information you provide directly, information we collect automatically when you use the platform, and information we receive from third parties. We collect only what we need to run HireHub Community." },
      { text: 'The categories of information we collect include:', bullets: [
        'Account and profile information — your name, email address, password, role, profile photo, skills, and work history',
        'Job seeker activity — applications, saved jobs, searches, and messages you send to employers',
        'Employer information — company profile, job listings, and hiring decisions you make',
        'Usage and device data — pages visited, features used, browser type, and IP address',
      ] },
    ],
  },
  {
    id: 'how-we-use',
    title: 'How We Use Your Information',
    paragraphs: [
      { text: 'We use your information to operate and improve HireHub Community, including:', bullets: [
        'Creating and maintaining your account',
        'Matching candidates with job opportunities and delivering applications to employers',
        'Sending transactional emails such as application status updates, interview invitations, and password resets',
        'Analyzing usage to improve the platform',
        'Protecting against fraud, abuse, and unauthorized access',
        'Sending promotional communications only with your consent, which you can withdraw at any time',
      ] },
    ],
  },
  {
    id: 'how-we-share',
    title: 'How We Share Your Information',
    paragraphs: [
      { text: 'When you apply to a job, we share your application materials with the employer that posted the job. We also share information with service providers who help us operate the platform, such as hosting, email delivery, and analytics providers, under contracts that require them to keep your data confidential.' },
      { text: 'We may disclose information when required by law, to protect the rights and safety of HireHub Community, our users, or the public, or in connection with a merger, acquisition, or sale of assets.' },
    ],
  },
  {
    id: 'data-retention',
    title: 'Data Retention',
    paragraphs: [
      { text: 'We retain your information while your account is active and for a reasonable period afterward. If your account is inactive for 24 months, we will delete or anonymize your personal data. You may request deletion of your data at any time, and we will honor such requests subject to legal obligations.' },
    ],
  },
  {
    id: 'your-rights',
    title: 'Your Rights and Choices',
    paragraphs: [
      { text: 'Depending on where you live, you may have the right to:', bullets: [
        'Access, correct, or update your personal information',
        'Request deletion of your personal information',
        'Receive a copy of your data in a portable format',
        'Object to or restrict certain processing',
        'Opt out of marketing communications',
      ] },
      { text: 'To exercise these rights, email support@hirehub.community. We will respond within a reasonable timeframe.' },
    ],
  },
  {
    id: 'data-security',
    title: 'Data Security',
    paragraphs: [
      { text: 'We use industry-standard safeguards, including HTTPS in transit, encryption at rest, and access controls, to protect your information. No method of transmission over the internet is 100% secure, but we work hard to keep your data safe.' },
    ],
  },
  {
    id: 'childrens-privacy',
    title: "Children's Privacy",
    paragraphs: [
      { text: 'HireHub Community is not intended for anyone under 16 years old. We do not knowingly collect personal information from children under 16. If you believe a child under 16 has provided us information, contact us and we will delete it.' },
    ],
  },
  {
    id: 'international-transfers',
    title: 'International Data Transfers',
    paragraphs: [
      { text: 'Your information may be processed and stored in the United States and in other countries where our service providers operate. When we transfer data internationally, we rely on appropriate safeguards to protect it.' },
    ],
  },
  {
    id: 'changes',
    title: 'Changes to This Policy',
    paragraphs: [
      { text: 'We may update this Privacy Policy from time to time. We will post any changes on this page with an updated "Last updated" date. If the changes are material, we will notify you by email.' },
    ],
  },
  {
    id: 'contact',
    title: 'Contact Us',
    paragraphs: [
      { text: 'If you have questions about this Privacy Policy, email us at support@hirehub.community.' },
    ],
  },
]

const termsSections: LegalSection[] = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    paragraphs: [
      { text: 'By creating an account or using HireHub Community, you agree to these Terms of Service. If you do not agree, please do not use the platform.' },
    ],
  },
  {
    id: 'eligibility',
    title: 'Eligibility',
    paragraphs: [
      { text: 'You must be at least 16 years old to use HireHub Community. If you use the platform on behalf of a company, you represent that you have authority to bind that company to these Terms.' },
    ],
  },
  {
    id: 'your-account',
    title: 'Your Account',
    paragraphs: [
      { text: 'You are responsible for the accuracy of the information in your account and for keeping your login credentials confidential. You may create only one account for yourself and must notify us of any unauthorized use of your account.' },
    ],
  },
  {
    id: 'job-seeker-conduct',
    title: 'Job Seeker Conduct',
    paragraphs: [
      { text: 'When using HireHub Community, you agree not to:', bullets: [
        'Provide false or misleading information in your profile or applications',
        'Use the platform for any unlawful purpose',
        'Scrape, harvest, or collect data from the platform without permission',
        'Harass, threaten, or discriminate against other users',
        'Impersonate another person or entity',
      ] },
    ],
  },
  {
    id: 'employer-conduct',
    title: 'Employer Conduct',
    paragraphs: [
      { text: 'Employers agree to post accurate job listings, comply with all applicable employment and anti-discrimination laws, and treat applicant information as confidential and use it only for the purpose of evaluating candidates.' },
    ],
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property',
    paragraphs: [
      { text: 'HireHub Community owns the platform, including its design, code, and content. You retain ownership of the content you submit. By submitting content, you grant us a non-exclusive license to display and process it to operate the platform.' },
    ],
  },
  {
    id: 'third-party-services',
    title: 'Third-Party Services',
    paragraphs: [
      { text: 'The platform may link to third-party websites and services. We are not responsible for the content or practices of those third parties, and your use of them is governed by their own terms and privacy policies.' },
    ],
  },
  {
    id: 'disclaimer',
    title: 'Disclaimer of Warranties',
    paragraphs: [
      { text: 'HireHub Community is provided "as is" and "as available" without warranties of any kind, express or implied, including fitness for a particular purpose. We do not guarantee that you will find a job or that any job posting is accurate.' },
    ],
  },
  {
    id: 'limitation-of-liability',
    title: 'Limitation of Liability',
    paragraphs: [
      { text: 'To the maximum extent permitted by law, HireHub Community and its operators are not liable for any indirect, incidental, or consequential damages arising from your use of the platform, including any hiring decisions, interviews, or employment outcomes.' },
    ],
  },
  {
    id: 'indemnification',
    title: 'Indemnification',
    paragraphs: [
      { text: 'You agree to indemnify and hold harmless HireHub Community and its operators from any claims, damages, or expenses arising from your use of the platform or your violation of these Terms.' },
    ],
  },
  {
    id: 'termination',
    title: 'Termination',
    paragraphs: [
      { text: 'We may suspend or terminate your account if you violate these Terms. You may close your account at any time by contacting us.' },
    ],
  },
  {
    id: 'governing-law',
    title: 'Governing Law',
    paragraphs: [
      { text: 'These Terms are governed by the laws of the State of Delaware, without regard to its conflict-of-laws principles. Any disputes will be resolved in the courts of the State of Delaware.' },
    ],
  },
  {
    id: 'changes-terms',
    title: 'Changes to These Terms',
    paragraphs: [
      { text: 'We may revise these Terms from time to time. Continued use of the platform after changes are posted constitutes acceptance of the revised Terms.' },
    ],
  },
  {
    id: 'contact-terms',
    title: 'Contact Us',
    paragraphs: [
      { text: 'Questions about these Terms? Email us at support@hirehub.community.' },
    ],
  },
]

const cookiesSections: LegalSection[] = [
  {
    id: 'what-are-cookies',
    title: 'What Are Cookies',
    paragraphs: [
      { text: 'Cookies are small text files stored on your device when you visit a website. They help websites remember you, keep you signed in, and understand how the site is used.' },
    ],
  },
  {
    id: 'how-we-use-cookies',
    title: 'How We Use Cookies',
    paragraphs: [
      { text: 'HireHub Community uses a small number of cookies and similar technologies to keep the platform working and improve it:', bullets: [
        'Essential cookies — keep you signed in and make forms and security features work. These cannot be turned off.',
        'Preference cookies — remember choices such as your preferred theme and cookie consent settings.',
        'Analytics cookies — help us understand aggregate usage so we can improve the platform.',
      ] },
    ],
  },
  {
    id: 'cookies-we-use',
    title: 'Cookies We Use',
    paragraphs: [
      { text: 'The cookies we set include:', bullets: [
        'A session cookie that remembers that you are signed in (essential, session length)',
        'A consent cookie that records your cookie preferences (essential, 1 year)',
        'Analytics cookies that collect anonymized usage statistics (analytics, up to 13 months)',
      ] },
    ],
  },
  {
    id: 'managing-cookies',
    title: 'Managing Cookies',
    paragraphs: [
      { text: 'You can control cookies through your browser settings, where you can delete existing cookies or block new ones. Blocking essential cookies may prevent you from signing in or using key features of HireHub Community.' },
    ],
  },
  {
    id: 'do-not-track',
    title: 'Do Not Track',
    paragraphs: [
      { text: 'Some browsers offer a "Do Not Track" signal. We do not currently respond to browser Do Not Track signals, but we keep our cookie use minimal and do not use cookies for cross-site advertising.' },
    ],
  },
  {
    id: 'changes-cookies',
    title: 'Changes to This Policy',
    paragraphs: [
      { text: 'We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated "Last updated" date.' },
    ],
  },
  {
    id: 'contact-cookies',
    title: 'Contact Us',
    paragraphs: [
      { text: 'Questions about this Cookie Policy? Email us at support@hirehub.community.' },
    ],
  },
]

export const legalDocuments: LegalDocument[] = [
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    description: 'How HireHub Community collects, uses, and protects your information.',
    updatedAt: 'August 6, 2026',
    sections: privacySections,
  },
  {
    slug: 'terms',
    title: 'Terms of Service',
    description: 'The rules that govern your use of HireHub Community.',
    updatedAt: 'August 6, 2026',
    sections: termsSections,
  },
  {
    slug: 'cookies',
    title: 'Cookie Policy',
    description: 'How HireHub Community uses cookies and similar technologies.',
    updatedAt: 'August 6, 2026',
    sections: cookiesSections,
  },
]

export function getLegalDocument(slug: LegalDocument['slug']): LegalDocument {
  const doc = legalDocuments.find((d) => d.slug === slug)
  if (!doc) throw new Error(`Unknown legal document: ${slug}`)
  return doc
}
```

- [ ] **Step 4: Create `src/components/legal/LegalLayout.tsx`**

```tsx
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
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/components/legal`
Expected: PASS (4 tests in legalData.test.ts, 4 tests in LegalLayout.test.tsx).

- [ ] **Step 6: Lint and typecheck**

Run: `npx tsc --noEmit && npx eslint src/components/legal`
Expected: no output, exit code 0.

- [ ] **Step 7: Commit**

```bash
git add src/components/legal/legalData.ts src/components/legal/LegalLayout.tsx src/components/legal/__tests__/legalData.test.ts src/components/legal/__tests__/LegalLayout.test.tsx
git commit -m "feat(legal): add legal content model and LegalLayout"
```

---

### Task 2: Legal pages and routes

**Files:**
- Create: `src/components/legal/PrivacyPolicyPage.tsx`
- Create: `src/components/legal/TermsPage.tsx`
- Create: `src/components/legal/CookiePolicyPage.tsx`
- Create: `src/components/legal/index.ts`
- Modify: `src/App.tsx` (lazy imports + 3 routes)
- Test: `src/components/legal/__tests__/LegalPages.test.tsx`

**Interfaces:**
- Consumes: `getLegalDocument`, `LegalLayout`, `LegalDocument` from Task 1; `usePageMeta` from `../../utils/usePageMeta`.
- Produces: default-exported `PrivacyPolicyPage`, `TermsPage`, `CookiePolicyPage` (each renders `{meta}` + `<LegalLayout doc={...} />`); routes `/privacy`, `/terms`, `/cookies` in `App.tsx`; `src/components/legal/index.ts` barrel.

- [ ] **Step 1: Write the failing test**

Create `src/components/legal/__tests__/LegalPages.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import PrivacyPolicyPage from '../PrivacyPolicyPage'
import TermsPage from '../TermsPage'
import CookiePolicyPage from '../CookiePolicyPage'

vi.mock('../../../utils/usePageMeta', () => ({
  usePageMeta: () => null,
}))

describe('LegalPages', () => {
  it('renders the privacy policy', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByRole('heading', { level: 1, name: /privacy policy/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /information we collect/i })).toBeInTheDocument()
  })

  it('renders the terms of service', () => {
    render(<TermsPage />)
    expect(screen.getByRole('heading', { level: 1, name: /terms of service/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /acceptance of terms/i })).toBeInTheDocument()
  })

  it('renders the cookie policy', () => {
    render(<CookiePolicyPage />)
    expect(screen.getByRole('heading', { level: 1, name: /cookie policy/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /what are cookies/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/legal/__tests__/LegalPages.test.tsx`
Expected: FAIL — the three page modules cannot be resolved.

- [ ] **Step 3: Create the three page components**

`src/components/legal/PrivacyPolicyPage.tsx`:

```tsx
import { usePageMeta } from '../../utils/usePageMeta'
import { getLegalDocument } from './legalData'
import { LegalLayout } from './LegalLayout'

export default function PrivacyPolicyPage() {
  const meta = usePageMeta({
    title: 'Privacy Policy',
    description: 'How HireHub Community collects, uses, and protects your information.',
    url: '/privacy',
  })
  return (
    <>
      {meta}
      <LegalLayout doc={getLegalDocument('privacy')} />
    </>
  )
}
```

`src/components/legal/TermsPage.tsx`:

```tsx
import { usePageMeta } from '../../utils/usePageMeta'
import { getLegalDocument } from './legalData'
import { LegalLayout } from './LegalLayout'

export default function TermsPage() {
  const meta = usePageMeta({
    title: 'Terms of Service',
    description: 'The rules that govern your use of HireHub Community.',
    url: '/terms',
  })
  return (
    <>
      {meta}
      <LegalLayout doc={getLegalDocument('terms')} />
    </>
  )
}
```

`src/components/legal/CookiePolicyPage.tsx`:

```tsx
import { usePageMeta } from '../../utils/usePageMeta'
import { getLegalDocument } from './legalData'
import { LegalLayout } from './LegalLayout'

export default function CookiePolicyPage() {
  const meta = usePageMeta({
    title: 'Cookie Policy',
    description: 'How HireHub Community uses cookies and similar technologies.',
    url: '/cookies',
  })
  return (
    <>
      {meta}
      <LegalLayout doc={getLegalDocument('cookies')} />
    </>
  )
}
```

`src/components/legal/index.ts`:

```ts
export { LegalLayout } from './LegalLayout'
export {
  getLegalDocument,
  legalDocuments,
  type LegalDocument,
  type LegalParagraph,
  type LegalSection,
} from './legalData'
export { default as PrivacyPolicyPage } from './PrivacyPolicyPage'
export { default as TermsPage } from './TermsPage'
export { default as CookiePolicyPage } from './CookiePolicyPage'
```

- [ ] **Step 4: Wire the routes in `src/App.tsx`**

Add the lazy imports after line 26 (`const FAQPage = lazy(...)`):

```tsx
const PrivacyPolicyPage = lazy(() => import('./components/legal/PrivacyPolicyPage'))
const TermsPage = lazy(() => import('./components/legal/TermsPage'))
const CookiePolicyPage = lazy(() => import('./components/legal/CookiePolicyPage'))
```

Add the routes after the `/faq` route (line 66):

```tsx
<Route path="/privacy" element={<ErrorBoundary><PrivacyPolicyPage /></ErrorBoundary>} />
<Route path="/terms" element={<ErrorBoundary><TermsPage /></ErrorBoundary>} />
<Route path="/cookies" element={<ErrorBoundary><CookiePolicyPage /></ErrorBoundary>} />
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/components/legal`
Expected: PASS (legalData, LegalLayout, and LegalPages suites all green).

- [ ] **Step 6: Typecheck, lint, and full suite**

Run: `npx tsc --noEmit && npx eslint . && npx vitest run`
Expected: tsc clean, eslint clean, 237 baseline tests + new legal tests all pass (no regressions — proves the `App.tsx` route additions compile and lazy imports resolve).

- [ ] **Step 7: Commit**

```bash
git add src/components/legal/PrivacyPolicyPage.tsx src/components/legal/TermsPage.tsx src/components/legal/CookiePolicyPage.tsx src/components/legal/index.ts src/components/legal/__tests__/LegalPages.test.tsx src/App.tsx
git commit -m "feat(legal): add privacy, terms, and cookie policy pages with routes"
```

---

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

### Task 4: Footer links

**Files:**
- Modify: `src/components/layout/Footer.tsx:16,24` (broken `#` links) and `src/components/layout/Footer.tsx:19-25` (add Terms + Cookie links)
- Test: `src/components/layout/__tests__/Footer.test.tsx`

**Interfaces:**
- Consumes: existing `footerLinks` object shape `{ label: string; to: string }[]` rendered via react-router `Link`.
- Produces: `Help Center` → `/help`, `Privacy Policy` → `/privacy`, plus new `Terms of Service` → `/terms` and `Cookie Policy` → `/cookies` in the Company column. No `to: '#'` remaining in the four columns.

- [ ] **Step 1: Write the failing test**

Create `src/components/layout/__tests__/Footer.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Footer } from '../Footer'

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  )
}

describe('Footer', () => {
  it('links the Help Center and legal pages to real routes', () => {
    renderFooter()
    expect(screen.getByRole('link', { name: 'Help Center' })).toHaveAttribute('href', '/help')
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy')
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('href', '/terms')
    expect(screen.getByRole('link', { name: 'Cookie Policy' })).toHaveAttribute('href', '/cookies')
  })

  it('has no links pointing at "#" in the content columns', () => {
    renderFooter()
    const links = screen.getAllByRole('link')
    const hashLinks = links.filter((link) => link.getAttribute('href') === '#')
    expect(hashLinks).toHaveLength(3)
  })
})
```

Note: the second test expects exactly 3 `#` links — those are the three social links (`Globe`, `MessageCircle`, `ExternalLink`), which are intentionally placeholder `href="#"` anchors and are NOT part of the four content columns. Do not change the social links.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/layout/__tests__/Footer.test.tsx`
Expected: FAIL — `Help Center` has `href="#"` and `Terms of Service`/`Cookie Policy` links do not exist.

- [ ] **Step 3: Update `footerLinks` in `src/components/layout/Footer.tsx`**

Replace the `resources` entry (line 16) and the `company` array (lines 19-25):

```tsx
  resources: [
    { label: 'Blog', to: '/blog' },
    { label: 'Career Advice', to: '/blog' },
    { label: 'Salary Guide', to: '/blog' },
    { label: 'Help Center', to: '/help' },
    { label: 'FAQ', to: '/faq' },
  ],
  company: [
    { label: 'About Us', to: '/about' },
    { label: 'For Employers', to: '/employers' },
    { label: 'Contact', to: '/contact' },
    { label: 'Post a Job', to: '/post-job' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Cookie Policy', to: '/cookies' },
  ],
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/layout/__tests__/Footer.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Typecheck and full suite**

Run: `npx tsc --noEmit && npx eslint src/components/layout && npx vitest run`
Expected: tsc clean, eslint clean, all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/Footer.tsx src/components/layout/__tests__/Footer.test.tsx
git commit -m "fix(footer): point help and legal links at real routes"
```

---

### Task 5: Rebuild email templates on a cross-client shell

**Files:**
- Modify: `src/api/emails.ts` (full rewrite)
- Test: `src/api/__tests__/emails.test.ts`

**Interfaces:**
- Consumes: `@emailjs/browser` (unchanged usage); the five existing param interfaces are kept byte-for-byte; the five public send functions keep identical signatures.
- Produces:
  - `export type EmailTemplateName = 'interview_invitation' | 'post_interview_followup' | 'offer_letter' | 'preboarding_checklist' | 'orientation_details'`
  - `export interface Cta { label: string; href: string }`
  - `export interface RenderedEmail { subject: string; html: string }`
  - `export function escapeHtml(value: unknown): string`
  - `export function renderShell(bodyHtml: string, cta: Cta | null, preheader?: string): string`
  - `export function renderEmailTemplate(name: EmailTemplateName, params: EmailParams): RenderedEmail`
  - Internal per-template renderers return `{ subject, html }`; `TEMPLATE_RENDERERS`/`TEMPLATE_SUBJECTS` maps are removed.

- [ ] **Step 1: Write the failing test**

Create `src/api/__tests__/emails.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { renderEmailTemplate, renderShell, escapeHtml } from '../emails'

vi.mock('@emailjs/browser', () => ({
  default: { send: vi.fn() },
}))

describe('escapeHtml', () => {
  it('escapes HTML metacharacters', () => {
    expect(escapeHtml('<script>"&\'')).toBe('&lt;script&gt;&quot;&amp;&#39;')
  })
})

describe('renderShell', () => {
  it('includes color-scheme meta tags and dark-mode CSS', () => {
    const html = renderShell('<p>Hi</p>', null)
    expect(html).toContain('<meta name="color-scheme" content="light dark" />')
    expect(html).toContain('<meta name="supported-color-schemes" content="light dark" />')
    expect(html).toContain('@media (prefers-color-scheme: dark)')
    expect(html).toContain('[data-ogsc]')
  })

  it('includes an MSO ghost table and PixelsPerInch for Outlook', () => {
    const html = renderShell('<p>Hi</p>', null)
    expect(html).toContain('<!--[if mso]>')
    expect(html).toContain('<o:PixelsPerInch>96</o:PixelsPerInch>')
    expect(html).toContain('width="600" align="center"')
  })

  it('renders a bulletproof CTA and omits it when cta is null', () => {
    const withCta = renderShell('<p>Hi</p>', { label: 'Go', href: 'https://app.hirehub.community/dashboard' })
    expect(withCta).toContain('<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0;">')
    expect(withCta).toContain('bgcolor="#2563eb"')
    expect(withCta).toContain('display:inline-block;padding:12px 24px')
    expect(withCta).toContain('>Go</a>')

    const withoutCta = renderShell('<p>Hi</p>', null)
    expect(withoutCta).not.toContain('cta-button')
  })

  it('declares bgcolor alongside background-color on the card', () => {
    const html = renderShell('<p>Hi</p>', null)
    expect(html).toContain('bgcolor="#ffffff"')
    expect(html).toContain('background-color:#ffffff')
  })
})

describe('renderEmailTemplate', () => {
  it('renders the interview invitation with a safe meeting link', () => {
    const { subject, html } = renderEmailTemplate('interview_invitation', {
      to: 'a@b.com',
      candidateName: 'Alice',
      jobTitle: 'Barista',
      interviewType: 'Video call',
      interviewDate: 'August 12, 2026',
      interviewTime: '2:30 PM',
      interviewerName: 'Bob',
      interviewerTitle: 'CTO',
      meetingLink: 'https://meet.example.com/x',
      meetingLocation: '',
    })
    expect(subject).toBe('Interview Invitation: Barista at HireHub Community')
    expect(html).toContain('Dear Alice,')
    expect(html).toContain('https://meet.example.com/x')
  })

  it('never renders a non-http meeting link', () => {
    const { html } = renderEmailTemplate('interview_invitation', {
      to: 'a@b.com',
      candidateName: 'Alice',
      jobTitle: 'Barista',
      interviewType: 'Video call',
      interviewDate: 'August 12, 2026',
      interviewTime: '2:30 PM',
      interviewerName: 'Bob',
      interviewerTitle: 'CTO',
      meetingLink: 'javascript:alert(1)',
      meetingLocation: '',
    })
    expect(html).not.toContain('javascript:')
  })

  it('escapes user-provided values', () => {
    const { html } = renderEmailTemplate('post_interview_followup', {
      to: 'a@b.com',
      candidateName: '<script>',
      jobTitle: 'A&B',
      expectedTimeline: 'one week',
    })
    expect(html).toContain('Dear &lt;script&gt;,')
    expect(html).toContain('A&amp;B')
  })

  it('renders offer, preboarding, and orientation content', () => {
    const offer = renderEmailTemplate('offer_letter', {
      to: 'a@b.com',
      candidateName: 'Alice',
      jobTitle: 'Barista',
      employmentType: 'Full-time',
      startDate: 'September 1, 2026',
      hourlyRate: '25',
      currency: 'USD',
      schedule: 'Mon-Fri, 9am-5pm',
      managerName: 'Carol',
      managerTitle: 'Cafe Manager',
      expirationDate: 'August 20, 2026',
    })
    expect(offer.html).toContain('Employment Terms')

    const preboarding = renderEmailTemplate('preboarding_checklist', {
      to: 'a@b.com',
      candidateName: 'Alice',
      deadline: 'August 25, 2026',
    })
    expect(preboarding.html).toContain('pre-boarding checklist')
    expect(preboarding.html).toContain('government-issued ID')

    const orientation = renderEmailTemplate('orientation_details', {
      to: 'a@b.com',
      candidateName: 'Alice',
      date: 'September 1, 2026',
      time: '9:00 AM',
      location: '123 Main St',
    })
    expect(orientation.html).toContain('Orientation Details')
    expect(orientation.html).toContain('123 Main St')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/api/__tests__/emails.test.ts`
Expected: FAIL — `renderEmailTemplate`, `renderShell`, `escapeHtml` are not exported from `../emails`.

- [ ] **Step 3: Rewrite `src/api/emails.ts`**

Replace the entire file with:

```ts
import emailjs from '@emailjs/browser'

export interface InterviewEmailParams {
  to: string
  candidateName: string
  jobTitle: string
  interviewType: string
  interviewDate: string
  interviewTime: string
  interviewerName: string
  interviewerTitle: string
  meetingLink: string
  meetingLocation: string
}

export interface PostInterviewEmailParams {
  to: string
  candidateName: string
  jobTitle: string
  expectedTimeline: string
}

export interface OfferEmailParams {
  to: string
  candidateName: string
  jobTitle: string
  employmentType: string
  startDate: string
  hourlyRate: string
  currency: string
  schedule: string
  managerName: string
  managerTitle: string
  expirationDate: string
}

export interface PreBoardingEmailParams {
  to: string
  candidateName: string
  deadline: string
}

export interface OrientationEmailParams {
  to: string
  candidateName: string
  date: string
  time: string
  location: string
}

export type EmailParams =
  | InterviewEmailParams
  | PostInterviewEmailParams
  | OfferEmailParams
  | PreBoardingEmailParams
  | OrientationEmailParams

export type EmailTemplateName =
  | 'interview_invitation'
  | 'post_interview_followup'
  | 'offer_letter'
  | 'preboarding_checklist'
  | 'orientation_details'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string

const PAGE_BG = '#f4f4f5'
const CARD_BG = '#ffffff'
const TEXT_COLOR = '#374151'
const MUTED_COLOR = '#9ca3af'
const FOOTER_COLOR = '#6b7280'
const WORDMARK_COLOR = '#111827'
const CTA_BG = '#2563eb'
const LOGO_BG = '#ff5600'
const LOGO_BAR = '#ffffff'
const DARK_BG = '#1a1a1a'
const DARK_CARD = '#2d2d2d'
const DARK_TEXT = '#e5e7eb'
const DARK_LINK = '#4da6ff'
const FONT_STACK = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"
const FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');"

export interface Cta {
  label: string
  href: string
}

export interface RenderedEmail {
  subject: string
  html: string
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function safeHref(value: string | null | undefined): string | null {
  if (!value) return null
  return value.startsWith('http://') || value.startsWith('https://') ? value : null
}

function logoHtml(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" height="40" style="display:inline-block;width:40px;height:40px;vertical-align:middle;">
    <tr>
      <td align="center" valign="middle" width="40" height="40" bgcolor="${LOGO_BG}" style="width:40px;height:40px;background-color:${LOGO_BG};border-radius:8px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="8">&nbsp;</td>
            <td width="4" height="24" bgcolor="${LOGO_BAR}" style="width:4px;height:24px;background-color:${LOGO_BAR};border-radius:2px;">&nbsp;</td>
            <td width="16" height="5" bgcolor="${LOGO_BAR}" style="width:16px;height:5px;background-color:${LOGO_BAR};border-radius:2px;">&nbsp;</td>
            <td width="4" height="24" bgcolor="${LOGO_BAR}" style="width:4px;height:24px;background-color:${LOGO_BAR};border-radius:2px;">&nbsp;</td>
            <td width="8">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  </table><span class="wordmark" style="font-family:${FONT_STACK};font-size:20px;font-weight:700;color:${WORDMARK_COLOR};vertical-align:middle;margin-left:10px;">HireHub</span>`
}

function bulletproofCta(cta: Cta): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0;">
    <tr>
      <td bgcolor="${CTA_BG}" style="background-color:${CTA_BG};border-radius:8px;">
        <a class="cta-button" href="${escapeHtml(cta.href)}" style="display:inline-block;padding:12px 24px;font-family:${FONT_STACK};font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">${escapeHtml(cta.label)}</a>
      </td>
    </tr>
  </table>`
}

function darkModeStyles(): string {
  return `@media (prefers-color-scheme: dark) {
    .email-bg { background-color: ${DARK_BG} !important; }
    .email-card { background-color: ${DARK_CARD} !important; }
    .email-card .text-body, .email-card h1, .email-card h2, .email-card h3 { color: ${DARK_TEXT} !important; }
    .text-muted { color: ${MUTED_COLOR} !important; }
    .text-footer { color: ${MUTED_COLOR} !important; }
    .wordmark { color: ${DARK_TEXT} !important; }
    a { color: ${DARK_LINK} !important; }
  }
  [data-ogsc] .email-bg { background-color: ${DARK_BG} !important; }
  [data-ogsc] .email-card { background-color: ${DARK_CARD} !important; }
  [data-ogsc] .email-card .text-body, [data-ogsc] .email-card h1, [data-ogsc] .email-card h2, [data-ogsc] .email-card h3 { color: ${DARK_TEXT} !important; }
  [data-ogsc] .text-muted { color: ${MUTED_COLOR} !important; }
  [data-ogsc] .text-footer { color: ${MUTED_COLOR} !important; }
  [data-ogsc] .wordmark { color: ${DARK_TEXT} !important; }
  [data-ogsc] a { color: ${DARK_LINK} !important; }`
}

export function renderShell(bodyHtml: string, cta: Cta | null, preheader = ''): string {
  const ctaHtml = cta ? bulletproofCta(cta) : ''
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <style>${FONT_IMPORT}
${darkModeStyles()}
  </style>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body class="email-bg" style="margin:0;padding:0;background-color:${PAGE_BG};">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${PAGE_BG}" style="background-color:${PAGE_BG};">
    <tr>
      <td align="center" bgcolor="${PAGE_BG}" style="background-color:${PAGE_BG};padding:32px 16px;">
        <!--[if mso]>
        <table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td>
        <![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
          <tr>
            <td class="email-card" bgcolor="${CARD_BG}" style="background-color:${CARD_BG};border-radius:12px;padding:32px;font-family:${FONT_STACK};font-size:15px;line-height:1.6;color:${TEXT_COLOR};">
              ${logoHtml()}
              ${bodyHtml}
              ${ctaHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 4px 0;font-family:${FONT_STACK};font-size:12px;line-height:1.5;color:${MUTED_COLOR};">
              <p class="text-footer" style="margin:0 0 4px;font-weight:700;color:${FOOTER_COLOR};">HireHub Community</p>
              <p class="text-muted" style="margin:0;">You're receiving this because you have a HireHub account.</p>
            </td>
          </tr>
        </table>
        <!--[if mso]>
        </td></tr></table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`
}

function para(text: string, muted = false): string {
  return `<p class="${muted ? 'text-muted' : 'text-body'}" style="margin:0 0 16px;font-size:${muted ? '14px' : '15px'};line-height:${muted ? '1.5' : '1.6'};color:${muted ? MUTED_COLOR : TEXT_COLOR};">${text}</p>`
}

function h2(text: string): string {
  return `<h2 class="text-body" style="margin:0 0 8px;font-size:20px;font-weight:700;color:${TEXT_COLOR};">${text}</h2>`
}

function h3(text: string): string {
  return `<h3 class="text-body" style="margin:0 0 12px;font-size:16px;font-weight:700;color:${TEXT_COLOR};">${text}</h3>`
}

function divider(): string {
  return '<hr style="border:none;border-top:1px solid #e5e5e3;margin:24px 0;" />'
}

function bulletList(items: string[]): string {
  return `<ul style="margin:0 0 24px;padding-left:20px;color:${TEXT_COLOR};font-size:15px;line-height:1.8;">${items
    .map((item) => `<li>${item}</li>`)
    .join('')}</ul>`
}

function detailRow(label: string, value: string): string {
  return `<td style="padding:0 16px 0 0;vertical-align:top;white-space:nowrap;"><span class="text-muted" style="font-size:13px;color:${MUTED_COLOR};">${label}</span></td><td style="vertical-align:top;"><p class="text-body" style="margin:0;font-size:15px;line-height:1.6;color:${TEXT_COLOR};">${value}</p></td>`
}

function meetingLinkRow(link: string): string {
  const href = safeHref(link)
  if (!href) return ''
  return `<tr>${detailRow('Meeting Link', `<a href="${escapeHtml(href)}" style="color:${CTA_BG};">${escapeHtml(link)}</a>`)}</tr>`
}

function checklistRow(label: string, last: boolean): string {
  const border = last ? '' : 'border-bottom:1px solid #e5e5e3;'
  return `<tr>
    <td style="padding:12px 0;${border}width:32px;vertical-align:top;">
      <span style="display:inline-block;width:20px;height:20px;border:2px solid ${CTA_BG};border-radius:4px;text-align:center;line-height:16px;font-size:12px;color:${CTA_BG};">&#10003;</span>
    </td>
    <td style="padding:12px 0;${border}"><p class="text-body" style="margin:0;font-size:15px;color:${TEXT_COLOR};">${label}</p></td>
  </tr>`
}

function interviewTemplate(p: InterviewEmailParams): RenderedEmail {
  const body = `
    ${h2('Interview Invitation')}
    ${para('You have been selected for the next step in our hiring process.', true)}
    ${divider()}
    ${para(`Dear ${escapeHtml(p.candidateName)},`)}
    ${para(`We are pleased to invite you for an interview for the <strong>${escapeHtml(p.jobTitle)}</strong> position at HireHub Community. Below are the details for your upcoming interview:`)}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;width:100%;">
      <tr>${detailRow('Interview Type', escapeHtml(p.interviewType))}</tr>
      <tr>${detailRow('Date', escapeHtml(p.interviewDate))}</tr>
      <tr>${detailRow('Time', escapeHtml(p.interviewTime))}</tr>
      <tr>${detailRow('Interviewer', `${escapeHtml(p.interviewerName)} — ${escapeHtml(p.interviewerTitle)}`)}</tr>
      ${meetingLinkRow(p.meetingLink)}
      ${p.meetingLocation ? `<tr>${detailRow('Location', escapeHtml(p.meetingLocation))}</tr>` : ''}
    </table>
    ${para('<strong>Preparation Tips:</strong>')}
    ${bulletList([
      'Review the job description and your application materials',
      'Prepare examples of your relevant experience and achievements',
      'Have questions ready about the role and team',
      'Test your audio/video setup if the interview is remote',
    ])}
    ${para('We look forward to speaking with you. If you need to reschedule, please reply to this email as soon as possible.')}
    ${para('Best regards,<br /><strong>The HireHub Community Team</strong>')}`
  return {
    subject: `Interview Invitation: ${p.jobTitle} at HireHub Community`,
    html: renderShell(body, null, `Interview invitation for ${p.jobTitle}`),
  }
}

function postInterviewTemplate(p: PostInterviewEmailParams): RenderedEmail {
  const body = `
    ${h2('Thank You for Interviewing')}
    ${para('We appreciate you taking the time to meet with us.', true)}
    ${divider()}
    ${para(`Dear ${escapeHtml(p.candidateName)},`)}
    ${para(`Thank you for taking the time to interview for the <strong>${escapeHtml(p.jobTitle)}</strong> position at HireHub Community. We enjoyed learning more about your experience and skills.`)}
    ${para(`Our team is currently reviewing all candidates, and we expect to have an update for you <strong>${escapeHtml(p.expectedTimeline)}</strong>. We will be in touch soon with the next steps.`)}
    ${para('In the meantime, if you have any questions, please do not hesitate to reach out.')}
    ${para('Thank you again for your interest in joining HireHub Community.')}
    ${para('Warm regards,<br /><strong>The HireHub Community Team</strong>')}`
  return {
    subject: 'Thank You for Interviewing with HireHub Community',
    html: renderShell(body, null, `Thank you for interviewing for ${p.jobTitle}`),
  }
}

function offerTemplate(p: OfferEmailParams): RenderedEmail {
  const body = `
    ${h2('Offer of Employment')}
    ${para('Congratulations! We are thrilled to extend this offer to you.', true)}
    ${divider()}
    ${para(`Dear ${escapeHtml(p.candidateName)},`)}
    ${para(`We are delighted to formally offer you the position of <strong>${escapeHtml(p.jobTitle)}</strong> at HireHub Community. We were impressed throughout the interview process and believe you will be an excellent addition to our team.`)}
    ${h3('Employment Terms')}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;width:100%;">
      <tr>${detailRow('Position', escapeHtml(p.jobTitle))}</tr>
      <tr>${detailRow('Employment Type', escapeHtml(p.employmentType))}</tr>
      <tr>${detailRow('Start Date', escapeHtml(p.startDate))}</tr>
      <tr>${detailRow('Compensation', `${escapeHtml(p.currency)} ${escapeHtml(p.hourlyRate)}`)}</tr>
      <tr>${detailRow('Schedule', escapeHtml(p.schedule))}</tr>
      <tr>${detailRow('Reporting To', `${escapeHtml(p.managerName)} — ${escapeHtml(p.managerTitle)}`)}</tr>
    </table>
    ${para(`This offer is contingent upon the successful completion of a background check and verification of your right to work. Please note that this offer will expire on <strong>${escapeHtml(p.expirationDate)}</strong> if not accepted.`)}
    ${para('To accept this offer, please reply to this email confirming your acceptance. If you have any questions about the terms outlined above, feel free to reach out.')}
    ${para('We look forward to welcoming you to the team!')}
    ${para(`Sincerely,<br /><strong>${escapeHtml(p.managerName)}</strong><br />${escapeHtml(p.managerTitle)}<br />HireHub Community`)}`
  return {
    subject: 'Official Offer of Employment — HireHub Community',
    html: renderShell(body, null, `Offer of employment for ${p.jobTitle}`),
  }
}

function preBoardingTemplate(p: PreBoardingEmailParams): RenderedEmail {
  const body = `
    ${h2('Welcome to the Team!')}
    ${para('Your journey with HireHub Community starts here.', true)}
    ${divider()}
    ${para(`Dear ${escapeHtml(p.candidateName)},`)}
    ${para(`Welcome to HireHub Community! We are excited to have you on board. Before your first day, please complete the following pre-boarding checklist <strong>by ${escapeHtml(p.deadline)}</strong>:`)}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;width:100%;">
      ${checklistRow('Submit a copy of your government-issued ID', false)}
      ${checklistRow('Complete your tax withholding forms (W-4 / relevant local forms)', false)}
      ${checklistRow('Provide your bank details for payroll setup', false)}
      ${checklistRow('Review and sign the employee handbook acknowledgment', false)}
      ${checklistRow('Upload a profile photo for your employee badge', true)}
    </table>
    ${para('If you have any questions or need assistance, please reply to this email or contact our HR team.')}
    ${para("We can't wait to see you on your first day!")}
    ${para('Best regards,<br /><strong>The HireHub Community Team</strong>')}`
  return {
    subject: 'Welcome to HireHub Community! Your Pre-Boarding Checklist',
    html: renderShell(body, null, `Pre-boarding checklist due by ${p.deadline}`),
  }
}

function orientationTemplate(p: OrientationEmailParams): RenderedEmail {
  const body = `
    ${h2('Your First Day — Orientation Details')}
    ${para('Everything you need to know for day one.', true)}
    ${divider()}
    ${para(`Dear ${escapeHtml(p.candidateName)},`)}
    ${para('Your first day at HireHub Community is almost here! Below are the details for your orientation session:')}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;width:100%;">
      <tr>${detailRow('Date', escapeHtml(p.date))}</tr>
      <tr>${detailRow('Time', escapeHtml(p.time))}</tr>
      <tr>${detailRow('Location', escapeHtml(p.location))}</tr>
    </table>
    ${h3('Agenda')}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;width:100%;border-collapse:separate;border-spacing:0;">
      <tr>
        <td bgcolor="${CTA_BG}" style="background-color:${CTA_BG};color:#ffffff;padding:10px 12px;font-weight:600;font-size:13px;border-radius:4px 0 0 0;width:120px;">Arrival</td>
        <td style="padding:10px 12px;background-color:#f4f4f5;color:${TEXT_COLOR};font-size:14px;border-radius:0 4px 0 0;">Welcome & office tour</td>
      </tr>
      <tr>
        <td bgcolor="${CTA_BG}" style="background-color:${CTA_BG};color:#ffffff;padding:10px 12px;font-weight:600;font-size:13px;">Meet the Team</td>
        <td style="padding:10px 12px;background-color:${CARD_BG};color:${TEXT_COLOR};font-size:14px;">Introductions and team overview</td>
      </tr>
      <tr>
        <td bgcolor="${CTA_BG}" style="background-color:${CTA_BG};color:#ffffff;padding:10px 12px;font-weight:600;font-size:13px;">Onboarding</td>
        <td style="padding:10px 12px;background-color:#f4f4f5;color:${TEXT_COLOR};font-size:14px;">Tools, systems, and workflows setup</td>
      </tr>
      <tr>
        <td bgcolor="${CTA_BG}" style="background-color:${CTA_BG};color:#ffffff;padding:10px 12px;font-weight:600;font-size:13px;border-radius:0 0 0 4px;">Q&A</td>
        <td style="padding:10px 12px;background-color:${CARD_BG};color:${TEXT_COLOR};font-size:14px;border-radius:0 0 4px 0;">Questions and wrap-up</td>
      </tr>
    </table>
    ${para('Please bring a valid photo ID and arrive 10 minutes early. Dress code is business casual.')}
    ${para('If you have any questions before your start date, feel free to reach out.')}
    ${para('See you soon!<br /><strong>The HireHub Community Team</strong>')}`
  return {
    subject: 'Your First Day at HireHub Community — Orientation Details',
    html: renderShell(body, null, `Orientation details for ${p.candidateName}`),
  }
}

function renderTemplate(name: EmailTemplateName, params: EmailParams): RenderedEmail {
  switch (name) {
    case 'interview_invitation':
      return interviewTemplate(params as InterviewEmailParams)
    case 'post_interview_followup':
      return postInterviewTemplate(params as PostInterviewEmailParams)
    case 'offer_letter':
      return offerTemplate(params as OfferEmailParams)
    case 'preboarding_checklist':
      return preBoardingTemplate(params as PreBoardingEmailParams)
    case 'orientation_details':
      return orientationTemplate(params as OrientationEmailParams)
  }
}

export function renderEmailTemplate(name: EmailTemplateName, params: EmailParams): RenderedEmail {
  return renderTemplate(name, params)
}

async function sendEmail(templateName: EmailTemplateName, params: EmailParams): Promise<void> {
  try {
    const { subject, html } = renderEmailTemplate(templateName, params)
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_email: params.to,
        subject,
        html_content: html,
      },
      { publicKey: PUBLIC_KEY },
    )
  } catch (err) {
    console.error(`[EmailJS] Failed to send "${templateName}":`, err)
  }
}

export function sendInterviewInvitation(params: InterviewEmailParams): Promise<void> {
  return sendEmail('interview_invitation', params)
}

export function sendPostInterviewFollowUp(params: PostInterviewEmailParams): Promise<void> {
  return sendEmail('post_interview_followup', params)
}

export function sendOfferLetter(params: OfferEmailParams): Promise<void> {
  return sendEmail('offer_letter', params)
}

export function sendPreBoardingChecklist(params: PreBoardingEmailParams): Promise<void> {
  return sendEmail('preboarding_checklist', params)
}

export function sendOrientationDetails(params: OrientationEmailParams): Promise<void> {
  return sendEmail('orientation_details', params)
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/api/__tests__/emails.test.ts`
Expected: PASS (10 tests: 1 escapeHtml, 4 renderShell, 5 renderEmailTemplate).

- [ ] **Step 5: Typecheck, lint, and full suite**

Run: `npx tsc --noEmit && npx eslint . && npx vitest run`
Expected: tsc clean (the senders' callers — `InterviewScheduleModal.tsx`, `OfferLetterModal.tsx`, `PreBoardingChecklist.tsx` — compile unchanged), eslint clean, all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/api/emails.ts src/api/__tests__/emails.test.ts
git commit -m "feat(email): rebuild frontend templates on cross-client shell with dark mode"
```

---

### Task 6: Full verification

**Files:**
- Modify: none (verification only). If any verification step fails, fix the failure in the task that owns the file, then re-run.

- [ ] **Step 1: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit code 0, no output.

- [ ] **Step 2: Lint**

Run: `npx eslint .`
Expected: exit code 0, no output.

- [ ] **Step 3: Full test suite**

Run: `npx vitest run`
Expected: all tests pass (237 baseline + new legal/help/footer/email tests). Note the new test count after this plan:
- legalData: 4, LegalLayout: 4, LegalPages: 3 (11 legal)
- HelpCenterPage: 4
- Footer: 2
- emails: 10

- [ ] **Step 4: Confirm clean working tree of task files**

Run: `git status --short`
Expected: no modified task files remain unstaged; unrelated pre-existing files (`.superpowers/sdd/*`, `public/logos/*`, `PricingSection.tsx`, `HeroSection.tsx`, plan docs, `errors.md`, JSON files) remain untouched and un-staged.

- [ ] **Step 5: Commit if the verification pass produced no changes (no-op)**

Run: `git status --short`
Expected: nothing new to commit for this task. Do not create an empty commit.
