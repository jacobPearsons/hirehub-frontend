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
