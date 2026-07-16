# Task 6: Stage 3 — Offer Letter View (Candidate) with Accept/Decline

## Task Description

Build a styled offer letter view that candidates see when their application status is "offer", with accept and decline functionality.

## Files to Create

### `src/components/offer/OfferLetterView.tsx`

A styled offer letter component matching the formal letter format.

**Layout:**
- Header: "HireHub Community — Official Offer of Employment" with accent styling
- Candidate name and address section
- Formal letter body with all offer terms:
  - Job Title
  - Employment Type
  - Start Date
  - Hourly Rate (formatted as currency)
  - Schedule
  - Manager Name & Title
- Key Responsibilities list
- Contingencies section
- Expiration date
- Accept/Decline buttons
- After acceptance: "Thank you for accepting! We'll be in touch with next steps." message
- After decline: Status changes, a "We understand" message

**Props:**
```typescript
interface OfferLetterViewProps {
  application: Application
  onStatusUpdate: (applicationId: string, status: ApplicationStatus) => void
}
```

**Behavior:**
- Accept button: Sets `offerDetails.accepted = true`, `offerDetails.acceptedAt = new Date().toISOString()`, updates local state, shows toast
- Decline button: Changes status to `rejected`, shows toast
- Both buttons should have confirmation (either a confirm dialog or a second click to confirm)
- After accept/decline, hide the buttons and show the appropriate message

**Styling:**
- Formal letter appearance with border and padding
- Use `Card` component from `../ui`
- Accent color for header
- Clean typography with proper spacing
- Responsive layout

## Files to Modify

### `src/components/dashboard/ApplicationCard.tsx`

Current state: Shows interview details for `interviewing` status (from Task 4).

Changes needed:
1. Import `OfferLetterView` from `../offer/OfferLetterView`
2. When `application.status === 'offer'` and `application.offerDetails` exists, render `OfferLetterView` below the existing status info
3. Pass `onStatusUpdate` callback to update the application status

**Pattern:**
```tsx
{application.status === 'offer' && application.offerDetails && (
  <div className="mt-4 pt-4 border-t border-hairline">
    <OfferLetterView application={application} onStatusUpdate={onStatusUpdate} />
  </div>
)}
```

### `src/components/dashboard/ApplicationsTab.tsx`

Changes needed:
1. Add a `handleStatusUpdate` function that updates application status locally
2. Pass this function to `ApplicationCard` as a prop
3. The function should update the `apps` state array

## Context

- Types: `OfferDetails` from `../../types/hiring-flow`, `Application`, `ApplicationStatus` from `../../types/application`
- UI: `Card`, `Button` from `../ui`
- Toast: `useToast()` from `../ui/Toast`
- The `OfferDetails` type has: `accepted?: boolean`, `acceptedAt?: string`
- Existing `ApplicationCard` already handles interview details display

## Verification

Run: `npx tsc --noEmit`
Expected: Clean compilation

## Report

Write your report to `/home/jacobp/Desktop/Projecs/hirehub-frontend/.superpowers/sdd/task-6-report.md`
