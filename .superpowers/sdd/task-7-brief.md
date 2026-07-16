# Task 7: Stage 4 — Pre-Boarding Checklist (Candidate View)

## Task Description

Build a pre-boarding checklist that appears when a candidate has accepted their offer (offerDetails.accepted === true). This is a visual checklist that the candidate works through before their start date.

## Files to Create

### `src/components/preboarding/PreBoardingChecklist.tsx`

An expandable checklist component.

**Layout:**
- Header: "Pre-Boarding Checklist" with a progress indicator (e.g. "3 of 7 completed")
- Progress bar showing completion percentage
- List of checklist items, each with:
  - Checkbox (checked/unchecked)
  - Item title
  - Category badge (Documents, IT Setup, Training, Benefits)
  - Description
- Completion message when all items are checked
- "Send Pre-Boarding Email" button that triggers the email

**Props:**
```typescript
interface PreBoardingChecklistProps {
  application: Application
  onCheckUpdate?: (items: OnboardingChecklistItem[]) => void
}
```

**Behavior:**
- Initialize with the default checklist items (5-7 items)
- Allow toggling items via checkbox
- Show progress (X of Y completed)
- When all items complete, show a success message
- Store checked state locally (on the component) + emit via onCheckUpdate

**Default Checklist Items:**
```typescript
const defaultChecklistItems: OnboardingChecklistItem[] = [
  { id: '1', title: 'Complete employment application', description: 'Fill out all required employment forms', category: 'Documents', completed: false },
  { id: '2', title: 'Provide identification documents', description: 'Submit government-issued ID and proof of work authorization', category: 'Documents', completed: false },
  { id: '3', title: 'Submit tax forms (W-4, I-9)', description: 'Complete federal and state tax withholding forms', category: 'Documents', completed: false },
  { id: '4', title: 'Sign non-disclosure agreement', description: 'Review and sign the company NDA', category: 'Documents', completed: false },
  { id: '5', title: 'Request IT equipment', description: 'Laptop, monitor, keyboard, mouse', category: 'IT Setup', completed: false },
  { id: '6', title: 'Create company email account', description: 'Set up your @company.com email address', category: 'IT Setup', completed: false },
  { id: '7', title: 'Complete benefits enrollment', description: 'Select health, dental, vision, and 401k options', category: 'Benefits', completed: false },
]
```

**Styling:**
- Use `Card` component from `../ui`
- Progress bar: use a div with width percentage and accent color
- Category badges: use `Tag` component or inline badges
- Checked items: strikethrough text + muted color
- Responsive layout

### `src/components/preboarding/index.ts`

Barrel export:
```typescript
export { PreBoardingChecklist } from './PreBoardingChecklist'
```

## Files to Modify

### `src/components/dashboard/ApplicationCard.tsx`

Changes needed:
1. Import `PreBoardingChecklist` from `../preboarding/PreBoardingChecklist`
2. When `application.status === 'offer'` AND `application.offerDetails?.accepted === true` AND `application.preBoardingChecklist` exists, render `PreBoardingChecklist` below the offer details
3. The pre-boarding checklist should only appear after the offer has been accepted

**Pattern:**
```tsx
{application.status === 'offer' && 
 application.offerDetails?.accepted === true && 
 application.preBoardingChecklist && (
  <div className="mt-4 pt-4 border-t border-hairline">
    <PreBoardingChecklist application={application} />
  </div>
)}
```

## Context

- Types: `OnboardingChecklistItem` from `../../types/hiring-flow`, `Application` from `../../types/application`
- UI: `Card`, `Tag`, `Button` from `../ui`
- The `OnboardingChecklistItem` type has: `id`, `title`, `description`, `category`, `completed`, `completedAt?`
- The `Application` type has `preBoardingChecklist?: OnboardingChecklistItem[]`
- Email function: `sendPreBoardingChecklist` from `../../api/emails`

## Verification

Run: `npx tsc --noEmit`
Expected: Clean compilation

## Report

Write your report to `/home/jacobp/Desktop/Projecs/hirehub-frontend/.superpowers/sdd/task-7-report.md`
