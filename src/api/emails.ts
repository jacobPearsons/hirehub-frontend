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

type EmailParams =
  | InterviewEmailParams
  | PostInterviewEmailParams
  | OfferEmailParams
  | PreBoardingEmailParams
  | OrientationEmailParams

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string

function wrapHtml(subject: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f1ec;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f1ec;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="background-color:#ff5600;padding:24px 32px;border-radius:8px 8px 0 0;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">HireHub Community</h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;font-weight:400;">Connecting talent with opportunity</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;padding:32px;border-radius:0 0 8px 8px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 0;text-align:center;">
              <p style="margin:0;color:#626260;font-size:12px;">&copy; 2025 HireHub Community. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function sharedStyles() {
  return {
    p: 'margin:0 0 16px;color:#111111;font-size:15px;line-height:1.6;',
    pMuted: 'margin:0 0 16px;color:#626260;font-size:14px;line-height:1.5;',
    label: 'display:inline-block;background-color:#f5f1ec;color:#111111;font-size:13px;font-weight:600;padding:4px 10px;border-radius:4px;margin-bottom:4px;',
    value: 'margin:0 0 16px;color:#111111;font-size:15px;line-height:1.6;',
    heading: 'margin:0 0 8px;color:#111111;font-size:20px;font-weight:700;',
    subheading: 'margin:0 0 16px;color:#626260;font-size:14px;',
    divider: 'border:none;border-top:1px solid #e5e5e3;margin:24px 0;',
  }
}

function detailRow(label: string, value: string): string {
  const s = sharedStyles()
  return `<td style="padding:0 16px 0 0;vertical-align:top;"><span style="${s.label}">${label}</span></td><td style="vertical-align:top;"><p style="${s.value}">${value}</p></td>`
}

function interviewTemplate(p: InterviewEmailParams): string {
  const s = sharedStyles()
  const body = `
    <h2 style="${s.heading}">Interview Invitation</h2>
    <p style="${s.pMuted}">You have been selected for the next step in our hiring process.</p>
    <hr style="${s.divider}" />
    <p style="${s.p}">Dear ${p.candidateName},</p>
    <p style="${s.p}">We are pleased to invite you for an interview for the <strong>${p.jobTitle}</strong> position at HireHub Community. Below are the details for your upcoming interview:</p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;">
      <tr>${detailRow('Interview Type', p.interviewType)}</tr>
      <tr>${detailRow('Date', p.interviewDate)}</tr>
      <tr>${detailRow('Time', p.interviewTime)}</tr>
      <tr>${detailRow('Interviewer', `${p.interviewerName} — ${p.interviewerTitle}`)}</tr>
      ${p.meetingLink ? `<tr>${detailRow('Meeting Link', `<a href="${p.meetingLink}" style="color:#ff5600;text-decoration:none;">${p.meetingLink}</a>`)}</tr>` : ''}
      ${p.meetingLocation ? `<tr>${detailRow('Location', p.meetingLocation)}</tr>` : ''}
    </table>

    <p style="${s.p}"><strong>Preparation Tips:</strong></p>
    <ul style="margin:0 0 24px;padding-left:20px;color:#111111;font-size:15px;line-height:1.8;">
      <li>Review the job description and your application materials</li>
      <li>Prepare examples of your relevant experience and achievements</li>
      <li>Have questions ready about the role and team</li>
      <li>Test your audio/video setup if the interview is remote</li>
    </ul>

    <p style="${s.p}">We look forward to speaking with you. If you need to reschedule, please reply to this email as soon as possible.</p>
    <p style="${s.p}">Best regards,<br /><strong>The HireHub Community Team</strong></p>
  `
  return wrapHtml(`Interview Invitation: ${p.jobTitle} at HireHub Community`, body)
}

function postInterviewTemplate(p: PostInterviewEmailParams): string {
  const s = sharedStyles()
  const body = `
    <h2 style="${s.heading}">Thank You for Interviewing</h2>
    <p style="${s.pMuted}">We appreciate you taking the time to meet with us.</p>
    <hr style="${s.divider}" />
    <p style="${s.p}">Dear ${p.candidateName},</p>
    <p style="${s.p}">Thank you for taking the time to interview for the <strong>${p.jobTitle}</strong> position at HireHub Community. We enjoyed learning more about your experience and skills.</p>
    <p style="${s.p}">Our team is currently reviewing all candidates, and we expect to have an update for you <strong>${p.expectedTimeline}</strong>. We will be in touch soon with the next steps.</p>
    <p style="${s.p}">In the meantime, if you have any questions, please don't hesitate to reach out.</p>
    <p style="${s.p}">Thank you again for your interest in joining HireHub Community.</p>
    <p style="${s.p}">Warm regards,<br /><strong>The HireHub Community Team</strong></p>
  `
  return wrapHtml('Thank You for Interviewing with HireHub Community', body)
}

function offerTemplate(p: OfferEmailParams): string {
  const s = sharedStyles()
  const body = `
    <h2 style="${s.heading}">Offer of Employment</h2>
    <p style="${s.pMuted}">Congratulations! We are thrilled to extend this offer to you.</p>
    <hr style="${s.divider}" />
    <p style="${s.p}">Dear ${p.candidateName},</p>
    <p style="${s.p}">We are delighted to formally offer you the position of <strong>${p.jobTitle}</strong> at HireHub Community. We were impressed throughout the interview process and believe you will be an excellent addition to our team.</p>

    <h3 style="margin:0 0 12px;color:#111111;font-size:16px;font-weight:700;">Employment Terms</h3>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;">
      <tr>${detailRow('Position', p.jobTitle)}</tr>
      <tr>${detailRow('Employment Type', p.employmentType)}</tr>
      <tr>${detailRow('Start Date', p.startDate)}</tr>
      <tr>${detailRow('Compensation', `${p.currency} ${p.hourlyRate}`)}</tr>
      <tr>${detailRow('Schedule', p.schedule)}</tr>
      <tr>${detailRow('Reporting To', `${p.managerName} — ${p.managerTitle}`)}</tr>
    </table>

    <p style="${s.p}">This offer is contingent upon the successful completion of a background check and verification of your right to work. Please note that this offer will expire on <strong>${p.expirationDate}</strong> if not accepted.</p>

    <p style="${s.p}">To accept this offer, please reply to this email confirming your acceptance. If you have any questions about the terms outlined above, feel free to reach out.</p>
    <p style="${s.p}">We look forward to welcoming you to the team!</p>
    <p style="${s.p}">Sincerely,<br /><strong>${p.managerName}</strong><br />${p.managerTitle}<br />HireHub Community</p>
  `
  return wrapHtml('Official Offer of Employment – HireHub Community', body)
}

function preBoardingTemplate(p: PreBoardingEmailParams): string {
  const s = sharedStyles()
  const body = `
    <h2 style="${s.heading}">Welcome to the Team!</h2>
    <p style="${s.pMuted}">Your journey with HireHub Community starts here.</p>
    <hr style="${s.divider}" />
    <p style="${s.p}">Dear ${p.candidateName},</p>
    <p style="${s.p}">Welcome to HireHub Community! We are excited to have you on board. Before your first day, please complete the following pre-boarding checklist <strong>by ${p.deadline}</strong>:</p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;">
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e5e5e3;width:32px;vertical-align:top;">
          <span style="display:inline-block;width:20px;height:20px;border:2px solid #ff5600;border-radius:4px;text-align:center;line-height:16px;font-size:12px;color:#ff5600;">&#10003;</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e5e3;"><p style="margin:0;color:#111111;font-size:15px;">Submit a copy of your government-issued ID</p></td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e5e5e3;width:32px;vertical-align:top;">
          <span style="display:inline-block;width:20px;height:20px;border:2px solid #ff5600;border-radius:4px;text-align:center;line-height:16px;font-size:12px;color:#ff5600;">&#10003;</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e5e3;"><p style="margin:0;color:#111111;font-size:15px;">Complete your tax withholding forms (W-4 / relevant local forms)</p></td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e5e5e3;width:32px;vertical-align:top;">
          <span style="display:inline-block;width:20px;height:20px;border:2px solid #ff5600;border-radius:4px;text-align:center;line-height:16px;font-size:12px;color:#ff5600;">&#10003;</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e5e3;"><p style="margin:0;color:#111111;font-size:15px;">Provide your bank details for payroll setup</p></td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e5e5e3;width:32px;vertical-align:top;">
          <span style="display:inline-block;width:20px;height:20px;border:2px solid #ff5600;border-radius:4px;text-align:center;line-height:16px;font-size:12px;color:#ff5600;">&#10003;</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e5e3;"><p style="margin:0;color:#111111;font-size:15px;">Review and sign the employee handbook acknowledgment</p></td>
      </tr>
      <tr>
        <td style="padding:12px 0;width:32px;vertical-align:top;">
          <span style="display:inline-block;width:20px;height:20px;border:2px solid #ff5600;border-radius:4px;text-align:center;line-height:16px;font-size:12px;color:#ff5600;">&#10003;</span>
        </td>
        <td style="padding:12px 0;"><p style="margin:0;color:#111111;font-size:15px;">Upload a profile photo for your employee badge</p></td>
      </tr>
    </table>

    <p style="${s.p}">If you have any questions or need assistance, please reply to this email or contact our HR team.</p>
    <p style="${s.p}">We can't wait to see you on your first day!</p>
    <p style="${s.p}">Best regards,<br /><strong>The HireHub Community Team</strong></p>
  `
  return wrapHtml('Welcome to HireHub Community! Your Pre-Boarding Checklist', body)
}

function orientationTemplate(p: OrientationEmailParams): string {
  const s = sharedStyles()
  const body = `
    <h2 style="${s.heading}">Your First Day — Orientation Details</h2>
    <p style="${s.pMuted}">Everything you need to know for day one.</p>
    <hr style="${s.divider}" />
    <p style="${s.p}">Dear ${p.candidateName},</p>
    <p style="${s.p}">Your first day at HireHub Community is almost here! Below are the details for your orientation session:</p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;">
      <tr>${detailRow('Date', p.date)}</tr>
      <tr>${detailRow('Time', p.time)}</tr>
      <tr>${detailRow('Location', p.location)}</tr>
    </table>

    <h3 style="margin:0 0 12px;color:#111111;font-size:16px;font-weight:700;">Agenda</h3>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;border-collapse:separate;border-spacing:0;">
      <tr>
        <td style="padding:10px 12px;background-color:#ff5600;color:#ffffff;font-weight:600;font-size:13px;border-radius:4px 0 0 0;width:120px;">Arrival</td>
        <td style="padding:10px 12px;background-color:#fff8f3;color:#111111;font-size:14px;border-radius:0 4px 0 0;">Welcome & office tour</td>
      </tr>
      <tr>
        <td style="padding:10px 12px;background-color:#ff5600;color:#ffffff;font-weight:600;font-size:13px;">Meet the Team</td>
        <td style="padding:10px 12px;background-color:#ffffff;color:#111111;font-size:14px;">Introductions and team overview</td>
      </tr>
      <tr>
        <td style="padding:10px 12px;background-color:#ff5600;color:#ffffff;font-weight:600;font-size:13px;">Onboarding</td>
        <td style="padding:10px 12px;background-color:#fff8f3;color:#111111;font-size:14px;">Tools, systems, and workflows setup</td>
      </tr>
      <tr>
        <td style="padding:10px 12px;background-color:#ff5600;color:#ffffff;font-weight:600;font-size:13px;border-radius:0 0 0 4px;">Q&A</td>
        <td style="padding:10px 12px;background-color:#ffffff;color:#111111;font-size:14px;border-radius:0 0 4px 0;">Questions and wrap-up</td>
      </tr>
    </table>

    <p style="${s.p}">Please bring a valid photo ID and arrive 10 minutes early. Dress code is business casual.</p>
    <p style="${s.p}">If you have any questions before your start date, feel free to reach out.</p>
    <p style="${s.p}">See you soon!<br /><strong>The HireHub Community Team</strong></p>
  `
  return wrapHtml('Your First Day at HireHub Community – Orientation Details', body)
}

const TEMPLATE_RENDERERS: Record<string, (params: EmailParams) => string> = {
  interview_invitation: interviewTemplate as (p: EmailParams) => string,
  post_interview_followup: postInterviewTemplate as (p: EmailParams) => string,
  offer_letter: offerTemplate as (p: EmailParams) => string,
  preboarding_checklist: preBoardingTemplate as (p: EmailParams) => string,
  orientation_details: orientationTemplate as (p: EmailParams) => string,
}

const TEMPLATE_SUBJECTS: Record<string, string> = {
  interview_invitation: 'Interview Invitation: {{jobTitle}} at HireHub Community',
  post_interview_followup: 'Thank You for Interviewing with HireHub Community',
  offer_letter: 'Official Offer of Employment – HireHub Community',
  preboarding_checklist: 'Welcome to HireHub Community! Your Pre-Boarding Checklist',
  orientation_details: 'Your First Day at HireHub Community – Orientation Details',
}

async function sendEmail(templateName: string, params: EmailParams): Promise<void> {
  const renderer = TEMPLATE_RENDERERS[templateName]
  if (!renderer) {
    console.error(`[EmailJS] Unknown template: ${templateName}`)
    return
  }

  const html = renderer(params)
  const subject = TEMPLATE_SUBJECTS[templateName] ?? templateName

  try {
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
