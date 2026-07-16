# Task 5: Stage 3 — Offer Letter (Employer Modal) + Email

## Task Description

Build a modal for employers to create and send formal offer letters when moving a candidate to "offer" status.

## Files to Create

### `src/components/offer/OfferLetterModal.tsx`

A Radix Dialog modal with react-hook-form + zod for creating offer letters.

**Form Fields:**
- Job Title — text input (required)
- Employment Type — select: full-time, part-time, contract (required)
- Start Date — date input (required)
- Hourly Rate — number input (required)
- Currency — text input, default "USD" (required)
- Schedule — text input, e.g. "Monday to Friday, 9:00 AM – 5:00 PM" (required)
- Manager Name — text input (required)
- Manager Title — text input (required)
- Key Responsibilities — textarea, one per line (required)
- Contingencies — textarea, one per line (required, e.g. "Background check", "Drug screening")
- Offer Expiration Date — date input (required)

**On submit:**
1. Create an `OfferDetails` object with all form values
2. Parse responsibilities and contingencies from textarea (split by newline, filter empty)
3. Set `accepted: undefined` (not yet accepted)
4. Update the application status to `offer` via API
5. Send offer letter email via `sendOfferLetter` from `src/api/emails.ts`
6. Call `onSuccess()` callback to close modal and refresh data
7. Show a toast on success

**Props:**
```typescript
interface OfferLetterModalProps {
  application: Application
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}
```

**Zod Schema:**
```typescript
const offerSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required'),
  employmentType: z.enum(['full-time', 'part-time', 'contract']),
  startDate: z.string().min(1, 'Start date is required'),
  hourlyRate: z.number().min(0, 'Rate must be positive'),
  currency: z.string().min(1, 'Currency is required').default('USD'),
  schedule: z.string().min(1, 'Schedule is required'),
  managerName: z.string().min(1, 'Manager name is required'),
  managerTitle: z.string().min(1, 'Manager title is required'),
  responsibilities: z.string().min(1, 'Responsibilities are required'),
  contingencies: z.string().min(1, 'Contingencies are required'),
  expirationDate: z.string().min(1, 'Expiration date is required'),
})
```

## Files to Modify

### `src/components/employer-dashboard/ApplicantsTab.tsx`

Current state: The "Make offer" button directly calls `handleStatusChange(app.id, 'offer')`.

Changes needed:
1. Import `OfferLetterModal` from `../offer/OfferLetterModal`
2. Add state for `offerModalApp: Application | null`
3. Replace the inline "Make offer" button with one that opens the modal:
   ```tsx
   <button onClick={() => setOfferModalApp(app)}>
     Make Offer
   </button>
   ```
4. Render `<OfferLetterModal>` at the bottom, passing the selected application
5. On success callback, re-fetch applications

## Context

- Follow the exact same modal pattern as `InterviewScheduleModal.tsx` (Task 3)
- Follow the exact same form pattern as `ApplyJobForm.tsx`
- Use `Input`, `Textarea`, `Button` components from `../ui`
- Use `useToast` for notifications
- Email: `sendOfferLetter` from `../../api/emails`
- Types: `Application` from `../../types/application`, `OfferDetails` from `../../types/hiring-flow`

## Existing ApplicantsTab State

The component already has:
- `allApps` state with applications
- `fetchData()` that fetches applications
- `handleStatusChange(id, status)` that calls API and updates local state
- `interviewModalApp` state and `InterviewScheduleModal` rendering (from Task 3)

You need to add similar state and rendering for the offer modal.

## Verification

Run: `npx tsc --noEmit`
Expected: Clean compilation

## Report

Write your report to `/home/jacobp/Desktop/Projecs/hirehub-frontend/.superpowers/sdd/task-5-report.md`
