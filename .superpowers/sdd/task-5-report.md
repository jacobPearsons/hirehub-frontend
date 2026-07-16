# Task 5 Report: Stage 3 — Offer Letter (Employer Modal) + Email

## What I Implemented

Created the `OfferLetterModal` component and wired it into the employer dashboard.

### `src/components/offer/OfferLetterModal.tsx`
- Radix Dialog modal following the exact same pattern as `InterviewScheduleModal.tsx`
- react-hook-form with the Zod schema from the brief
- All 11 form fields: Job Title, Employment Type (select), Start Date, Hourly Rate, Currency, Schedule, Manager Name, Manager Title, Key Responsibilities (textarea), Contingencies (textarea), Offer Expiration Date
- `hourlyRate` uses `valueAsNumber: true` for proper number coercion
- Responsibilities and contingencies parsed via `.split('\n').filter(l => l.trim())`
- On submit: creates `OfferDetails` object with `accepted: undefined`, updates status to `offer` via `updateApplicationStatus`, sends email via `sendOfferLetter`, calls `onSuccess()`, shows toast
- Default values for `jobTitle` pre-filled from `application.jobTitle` and `currency` defaulting to `"USD"`
- Scrollable modal (`max-h-[85vh] overflow-y-auto`) to accommodate the 11-field form

### `src/components/offer/index.ts`
- Barrel export for `OfferLetterModal`

### `src/components/employer-dashboard/ApplicantsTab.tsx`
- Added `OfferLetterModal` import
- Added `offerModalApp` state (mirrors `interviewModalApp` pattern)
- "Make offer" button now sets `offerModalApp` instead of calling `handleStatusChange`
- Renders `<OfferLetterModal>` alongside `<InterviewScheduleModal>` with matching close/success callbacks

## What I Tested

- **TypeScript compilation:** `npx tsc --noEmit` — clean, zero errors
- **Visual pattern match:** Modal structure is identical to `InterviewScheduleModal` (AnimatePresence, motion.div, Radix Dialog, same styling classes)

## Files Changed

| File | Action |
|------|--------|
| `src/components/offer/OfferLetterModal.tsx` | Created |
| `src/components/offer/index.ts` | Created |
| `src/components/employer-dashboard/ApplicantsTab.tsx` | Modified (3 edits) |

## Self-Review Findings

None. The implementation follows the exact patterns established by Task 3's interview modal and the brief's schema.

## Commit

- `bba6990` — `feat: add OfferLetterModal and wire into ApplicantsTab`
