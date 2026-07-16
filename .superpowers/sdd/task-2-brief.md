# Task 2: Email Service Integration (EmailJS)

## Task Description

Create the email service layer using EmailJS for sending styled HTML emails to candidates at each stage of the HireHub Community hiring pipeline.

## Files to Create

### `src/api/emails.ts`

This file should export:

1. **Email parameter interfaces** for each email type:
   - `InterviewEmailParams` — to, candidateName, jobTitle, interviewType, interviewDate, interviewTime, interviewerName, interviewerTitle, meetingLink, meetingLocation
   - `PostInterviewEmailParams` — to, candidateName, jobTitle, expectedTimeline
   - `OfferEmailParams` — to, candidateName, jobTitle, employmentType, startDate, hourlyRate, currency, schedule, managerName, managerTitle, expirationDate
   - `PreBoardingEmailParams` — to, candidateName, deadline
   - `OrientationEmailParams` — to, candidateName, date, time, location

2. **HTML email templates** as template literal strings. Each template should be a complete HTML email with inline CSS:

   **Interview Invitation Email:**
   - Subject: "Interview Invitation: [Job Title] at HireHub Community"
   - Body: Formal invitation with interview details, meeting link, preparation tips
   - Style: Clean, professional, HireHub branding (orange accent #ff5600)

   **Post-Interview Follow-Up Email:**
   - Subject: "Thank You for Interviewing with HireHub Community"
   - Body: Thank you message, next steps timeline
   - Style: Same professional styling

   **Offer Letter Email:**
   - Subject: "Official Offer of Employment – HireHub Community"
   - Body: Formal offer letter with all terms, contingencies, acceptance instructions
   - Style: Formal letter format

   **Pre-Boarding Checklist Email:**
   - Subject: "Welcome to HireHub Community! Your Pre-Boarding Checklist"
   - Body: Checklist items, pre-start tasks, deadline
   - Style: Checklist format with checkboxes

   **Orientation Details Email:**
   - Subject: "Your First Day at HireHub Community – Orientation Details"
   - Body: Date, time, location, agenda items
   - Style: Clean schedule format

3. **`sendEmail` function** that:
   - Uses `@emailjs/browser` to send emails
   - Reads config from environment variables: `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`
   - Takes a template name and params, renders the HTML template, and sends via EmailJS
   - Returns a promise that resolves on success
   - Handles errors gracefully (logs but doesn't throw — email sending is best-effort)

4. **Convenience functions:**
   - `sendInterviewInvitation(params: InterviewEmailParams)`
   - `sendPostInterviewFollowUp(params: PostInterviewEmailParams)`
   - `sendOfferLetter(params: OfferEmailParams)`
   - `sendPreBoardingChecklist(params: PreBoardingEmailParams)`
   - `sendOrientationDetails(params: OrientationEmailParams)`

## Files to Modify

### `.env.example`

Add these lines at the end:
```
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

## Email Template Design Guidelines

- Use inline CSS (no external stylesheets — email clients don't support them)
- Base font: system-ui, -apple-system, sans-serif
- Max width: 600px, centered
- Background: #f5f1ec (matching the app's canvas color)
- Content background: #ffffff
- Accent color: #ff5600 (HireHub orange)
- Text color: #111111
- Muted text: #626260
- Header should have "HireHub Community" in the accent color with a brief mission tagline
- Footer: "© 2025 HireHub Community. All rights reserved."
- Professional, warm, supportive tone — connecting talent with opportunity

## Context

- EmailJS is already installed: `@emailjs/browser`
- The app uses Vite, so env vars are accessed via `import.meta.env.VITE_*`
- The existing API layer is at `src/api/` — this file should follow the same export patterns
- HireHub Community is a modern job board platform connecting talent with opportunity

## Verification

Run: `npx tsc --noEmit`
Expected: Clean compilation

## Report

Write your report to `/home/jacobp/Desktop/Projecs/hirehub-frontend/.superpowers/sdd/task-2-report.md`
