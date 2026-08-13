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
