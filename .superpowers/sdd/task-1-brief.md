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

