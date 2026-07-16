# Task 3: Stage 2 — Interview Scheduling (Employer Modal)

## Task Description

Build a modal for employers to schedule interviews when moving a candidate to "interviewing" status.

## Files to Create

### `src/components/interview/InterviewScheduleModal.tsx`

A Radix Dialog modal with react-hook-form + zod for scheduling interviews.

**Form Fields:**
- Interview Type — select: phone, video, in-person
- Date — date input (required)
- Time — time input (required)
- Interviewer Name — text input (required)
- Interviewer Title — text input (required)
- Meeting Link — text input (shown when type is "video")
- Meeting Location — text input (shown when type is "in-person")
- Notes — textarea (optional)

**On submit:**
1. Create an `InterviewDetails` object with all form values + `scheduledAt: new Date().toISOString()`
2. Update the application via `updateApplicationStatus` API (the application object needs to carry the interviewDetails)
3. Send interview invitation email via `sendInterviewInvitation` from `src/api/emails.ts`
4. Call `onSuccess()` callback to close modal and refresh data
5. Show a toast on success

**Props:**
```typescript
interface InterviewScheduleModalProps {
  application: Application
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}
```

**Zod Schema:**
```typescript
const interviewSchema = z.object({
  interviewType: z.enum(['phone', 'video', 'in-person']),
  interviewDate: z.string().min(1, 'Date is required'),
  interviewTime: z.string().min(1, 'Time is required'),
  interviewerName: z.string().min(1, 'Interviewer name is required'),
  interviewerTitle: z.string().min(1, 'Interviewer title is required'),
  meetingLink: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  meetingLocation: z.string().optional(),
  notes: z.string().optional(),
})
```

## Files to Modify

### `src/components/employer-dashboard/ApplicantsTab.tsx`

Current state: The "Mark interviewing" button directly calls `handleStatusChange(app.id, 'interviewing')`.

Changes needed:
1. Import `InterviewScheduleModal`
2. Add state for `interviewModalApp: Application | null`
3. Replace the inline "Mark interviewing" button with one that opens the modal:
   ```tsx
   <button onClick={() => setInterviewModalApp(app)}>
     Schedule Interview
   </button>
   ```
4. Render `<InterviewScheduleModal>` at the bottom, passing the selected application
5. On success callback, re-fetch applications

## Context

- Existing patterns: Radix Dialog modals with Framer Motion animations (see `ApplyJobModal.tsx`)
- Form patterns: react-hook-form + zod resolver (see `ApplyJobForm.tsx`)
- Toast: `useToast()` from `../ui/Toast`
- API: `updateApplicationStatus` from `../../api/applications`
- Email: `sendInterviewInvitation` from `../../api/emails`
- Types: `Application` from `../../types/application`, `InterviewDetails` from `../../types/hiring-flow`
- Existing ApplicantsTab already has `allApps` state and `fetchData` function

## Existing ApplicantsTab Structure

The component already has:
- `allApps` state with applications
- `fetchData()` that fetches applications
- `handleStatusChange(id, status)` that calls API and updates local state
- Status action buttons (Mark reviewing, Mark interviewing, Make offer, Reject)

You need to:
1. Add a new `handleScheduleInterview(application: Application, details: InterviewDetails)` function that:
   - Updates the application object with `interviewDetails` field
   - Calls `updateApplicationStatus(application.id, 'interviewing')` 
   - Updates local state
2. Wire the modal's onSuccess to re-fetch data

## Important Notes

- The `updateApplicationStatus` API only sends `{ status }` — the interview details need to be stored locally (in state + localStorage via the ApplicationsContext)
- The modal should follow the exact same styling pattern as `ApplyJobModal.tsx`
- Use the `Input`, `Textarea`, `Button` components from `../ui`
- The modal title should be "Schedule Interview" with the candidate name

## Verification

Run: `npx tsc --noEmit`
Expected: Clean compilation

## Report

Write your report to `/home/jacobp/Desktop/Projecs/hirehub-frontend/.superpowers/sdd/task-3-report.md`
