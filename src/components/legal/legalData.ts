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
