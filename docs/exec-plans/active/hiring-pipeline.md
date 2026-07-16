# PATHMATCH Hiring Pipeline — Full Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete 5-stage candidate onboarding flow (Stages 2-5) for PATHMATCH, including interview scheduling, offer letters, pre-boarding checklists, orientation details, and email notifications via EmailJS.

**Architecture:** Extend the `Application` type with stage-specific data fields. Build employer-side modals (interview scheduling, offer letter creation) and candidate-side views (interview details, offer letter with accept/decline, pre-boarding checklist, orientation card). Integrate EmailJS for sending styled HTML emails to candidates at each stage transition. All new data is stored on the Application object via the existing API.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 3, Framer Motion, Radix UI Dialog, react-hook-form + Zod, Lucide icons, EmailJS (@emailjs/browser)

---

## Global Constraints

- All components follow existing codebase patterns (Radix Dialog + Framer Motion for modals, react-hook-form + Zod for forms, Tailwind CSS with CSS custom properties)
- No new dependencies except `@emailjs/browser` for email sending
- EmailJS integration uses a service ID, template ID, and public key configured via environment variables (`VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`)
- All email templates are HTML strings defined in `src/api/emails.ts`
- Application status transitions: applied → reviewing → interviewing → offer (or rejected at any point)
- Pre-boarding checklist is only visible when offer is accepted
- Orientation details are only visible after offer acceptance
- Dark mode support via existing CSS custom properties
- Accessibility: ARIA labels, keyboard navigation, focus management on modals
- TypeScript strict mode — no `any` types
- Follow existing file organization: components grouped by feature in `src/components/`

---

## Task 1: Extend Data Types

**Files:**
- Create: `src/types/hiring-flow.ts`
- Modify: `src/types/application.ts`

### Step 1.1: Create hiring-flow.ts with stage-specific types

Create `src/types/hiring-flow.ts`:

```typescript
export type InterviewType = 'phone' | 'video' | 'in-person'

export interface InterviewDetails {
  interviewType: InterviewType
  interviewDate: string
  interviewTime: string
  interviewerName: string
  interviewerTitle: string
  meetingLink?: string
  meetingLocation?: string
  notes?: string
  scheduledAt: string
}

export type EmploymentType = 'full-time' | 'part-time' | 'contract'

export interface OfferDetails {
  jobTitle: string
  employmentType: EmploymentType
  startDate: string
  hourlyRate: number
  currency: string
  schedule: string
  managerName: string
  managerTitle: string
  responsibilities: string[]
  contingencies: string[]
  expirationDate: string
  accepted?: boolean
  acceptedAt?: string
}

export interface OnboardingChecklistItem {
  id: string
  label: string
  completed: boolean
  completedAt?: string
}

export interface OrientationDetails {
  date: string
  time: string
  location: string
  agenda: string[]
}
```

### Step 1.2: Extend Application type

Modify `src/types/application.ts` to add optional fields:

```typescript
import type { InterviewDetails, OfferDetails, OnboardingChecklistItem, OrientationDetails } from './hiring-flow'

export type ApplicationStatus = 'applied' | 'reviewing' | 'interviewing' | 'rejected' | 'offer'

export interface Application {
  id: string
  jobId: string
  jobTitle: string
  company: string
  companyLogo: string
  applicantName: string
  applicantEmail: string
  applicantPhone?: string
  coverLetter: string
  portfolioUrl?: string
  resumeFileName?: string
  status: ApplicationStatus
  submittedAt: string
  interviewDetails?: InterviewDetails
  offerDetails?: OfferDetails
  onboardingChecklist?: OnboardingChecklistItem[]
  orientationDetails?: OrientationDetails
}
```

### Step 1.3: Verify TypeScript compiles

Run: `npx tsc --noEmit`
Expected: Clean compilation (test file errors are pre-existing)

---

## Task 2: Email Service Integration (EmailJS)

**Files:**
- Create: `src/api/emails.ts`
- Modify: `.env.example`
- Modify: `src/api/client.ts` (no changes needed — EmailJS is independent)

### Step 2.1: Create email templates and send function

Create `src/api/emails.ts`:

This file contains:
1. HTML email templates for each stage (interview invitation, post-interview follow-up, offer letter, pre-boarding checklist, orientation details)
2. A `sendEmail` function that uses EmailJS to send emails
3. Template parameter interfaces

The email templates should match the tone and content from `flow.md`:
- Stage 2: Interview Invitation (includes Teams link, interviewer name, preparation tips)
- Stage 2B: Post-Interview Follow-Up (thank you, timeline)
- Stage 3: Offer Letter (formal employment offer with all terms)
- Stage 4: Pre-Boarding Checklist (I-9, W-4, handbook, direct deposit, pre-start tasks)
- Stage 5: First Day Orientation (date, time, location, agenda)

### Step 2.2: Add EmailJS dependency

Run: `npm install @emailjs/browser`

### Step 2.3: Update .env.example

Add:
```
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### Step 2.4: Verify TypeScript compiles

Run: `npx tsc --noEmit`

---

## Task 3: Stage 2 — Interview Scheduling (Employer Modal)

**Files:**
- Create: `src/components/interview/InterviewScheduleModal.tsx`
- Modify: `src/components/employer-dashboard/ApplicantsTab.tsx`

### Step 3.1: Create InterviewScheduleModal

Build a Radix Dialog modal with react-hook-form + zod for scheduling interviews. Fields:
- Interview Type (phone/video/in-person) — select/radio
- Date — date input
- Time — time input
- Interviewer Name — text input
- Interviewer Title — text input
- Meeting Link (for video) — text input, conditional on type
- Meeting Location (for in-person) — text input, conditional on type
- Notes — textarea

On submit:
1. Update application with `interviewDetails` and status `interviewing`
2. Send interview invitation email via EmailJS
3. Close modal

### Step 3.2: Wire into ApplicantsTab

Replace the inline "Mark interviewing" button with a button that opens `InterviewScheduleModal`. Pass the application and applicant email to the modal.

---

## Task 4: Stage 2 — Interview Details (Candidate View) + Email

**Files:**
- Create: `src/components/interview/InterviewDetails.tsx`
- Modify: `src/components/dashboard/ApplicationCard.tsx`

### Step 4.1: Create InterviewDetails component

Build a card component that displays interview details when application status is `interviewing`:
- Interview type badge (phone/video/in-person)
- Date and time
- Interviewer name and title
- Meeting link (clickable, opens Teams or browser)
- Meeting location
- Notes section

### Step 4.2: Integrate into ApplicationCard

When `application.status === 'interviewing'` and `application.interviewDetails` exists, render `InterviewDetails` below the existing status info in the ApplicationCard.

---

## Task 5: Stage 3 — Offer Letter (Employer Modal) + Email

**Files:**
- Create: `src/components/offer/OfferLetterModal.tsx`
- Modify: `src/components/employer-dashboard/ApplicantsTab.tsx`

### Step 5.1: Create OfferLetterModal

Build a Radix Dialog modal with react-hook-form + zod for creating offer letters. Fields:
- Job Title — text input
- Employment Type (full-time/part-time/contract) — select
- Start Date — date input
- Hourly Rate — number input
- Currency — text input (default USD)
- Schedule — text input (e.g., "Monday to Friday, 9:00 AM – 5:00 PM")
- Manager Name — text input
- Manager Title — text input
- Key Responsibilities — textarea (comma-separated or multi-line)
- Contingencies — textarea (e.g., "background check, drug screening")
- Offer Expiration Date — date input

On submit:
1. Update application with `offerDetails` and status `offer`
2. Send offer letter email via EmailJS
3. Close modal

### Step 5.2: Wire into ApplicantsTab

Replace the inline "Make offer" button with a button that opens `OfferLetterModal`. Pass the application and applicant email to the modal.

---

## Task 6: Stage 3 — Offer Letter View (Candidate) with Accept/Decline

**Files:**
- Create: `src/components/offer/OfferLetterView.tsx`
- Modify: `src/components/dashboard/ApplicationCard.tsx`

### Step 6.1: Create OfferLetterView

Build a styled offer letter view matching the PATHMATCH formal letter format from flow.md:
- Header with PATHMATCH branding
- Formal offer letter text with all terms
- Accept and Decline buttons
- When accepted: set `offerDetails.accepted = true`, `offerDetails.acceptedAt = new Date().toISOString()`
- When declined: change status back to `reviewing` or a custom `rejected` state
- Show a "Thank you for accepting" message after acceptance

### Step 6.2: Integrate into ApplicationCard

When `application.status === 'offer'` and `application.offerDetails` exists, render `OfferLetterView` in an expanded section of the ApplicationCard. Add a toggle to expand/collapse the offer letter.

---

## Task 7: Stage 4 — Pre-Boarding Checklist

**Files:**
- Create: `src/components/onboarding/PreBoardingChecklist.tsx`
- Modify: `src/components/dashboard/DashboardPage.tsx`

### Step 7.1: Create PreBoardingChecklist

Build a checklist component with items from flow.md:
1. Complete Form I-9
2. Complete W-4
3. Review and sign Employee Handbook Acknowledgement
4. Set up direct deposit information
5. Review job description

Each item has:
- Checkbox (toggles completion)
- Label text
- Completion timestamp (shown when completed)

Also include the "Additional Pre-Start Tasks" section:
1. Contact real estate agent for satellite office setup
2. Complete lease/office paperwork and obtain keys
3. Receive and inventory hardware (phones, iPads, laptops, stationery)

Track completion in `application.onboardingChecklist` array.

### Step 7.2: Add Pre-Boarding tab to DashboardPage

Add a third tab "Pre-Boarding" to the seeker DashboardPage. Only show this tab when the user has an application with status `offer` and `offerDetails.accepted === true`.

---

## Task 8: Stage 5 — Orientation Details

**Files:**
- Create: `src/components/onboarding/OrientationCard.tsx`
- Modify: `src/components/dashboard/DashboardPage.tsx`

### Step 8.1: Create OrientationCard

Build a card showing orientation details:
- Date and time
- Location (office address or virtual meeting link)
- Agenda items (numbered list):
  1. Welcome & introductions
  2. PATHMATCH mission, history, and values
  3. Review of pre-boarding progress
  4. Finalize remaining employment paperwork
  5. IT setup (login credentials, email, software access)
  6. First-week goals and expectations

### Step 8.2: Add to DashboardPage

Show OrientationCard below the tabs when the user has an accepted offer. The orientation details are stored in `application.orientationDetails`.

---

## Task 9: Wire Everything Together & Verify

**Files:**
- Modify: `src/components/dashboard/DashboardPage.tsx` (final integration)
- Modify: `src/components/employer-dashboard/ApplicantsTab.tsx` (final integration)

### Step 9.1: Final dashboard integration

Ensure all new tabs and components are properly wired:
- Seeker Dashboard: Saved Jobs | My Applications | Pre-Boarding (conditional)
- Orientation card shown below tabs when applicable
- Employer Dashboard: Job Listings | Applicants (with interview/offer modals)

### Step 9.2: Verify TypeScript compilation

Run: `npx tsc --noEmit`
Expected: Clean compilation

### Step 9.3: Verify build

Run: `npm run build`
Expected: Successful build

### Step 9.4: Verify lint

Run: `npm run lint`
Expected: No errors

---

## Validation and Acceptance

1. TypeScript compiles cleanly: `npx tsc --noEmit`
2. Build succeeds: `npm run build`
3. Lint passes: `npm run lint`
4. All new components follow existing patterns (Radix Dialog, Framer Motion, react-hook-form + Zod, Tailwind CSS)
5. Email templates match flow.md content and tone
6. Dark mode works for all new components
7. Accessibility: ARIA labels, keyboard navigation, focus management
8. Application type correctly extended with all new optional fields

## Idempotence and Recovery

- All new files are additive — no existing files are deleted
- If a task fails, the specific task can be re-executed without affecting others
- EmailJS integration is optional — components work without it (emails just won't send)
- Application data is persisted via existing API — if API is unavailable, localStorage fallback works
