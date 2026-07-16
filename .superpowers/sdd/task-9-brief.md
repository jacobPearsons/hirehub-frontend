# Task 9: Final Wiring and Build Verification

## Task Description

Verify that all hiring pipeline components are properly wired together and the build passes. This is the final quality gate.

## Verification Checklist

### 1. TypeScript Compilation
Run: `npx tsc --noEmit`
Expected: Zero errors

### 2. Build
Run: `npm run build`
Expected: Clean build with no warnings

### 3. Lint
Run: `npm run lint`
Expected: No errors (warnings are acceptable)

### 4. Component Integration Check

Verify all components are properly exported and importable:

**`src/components/interview/index.ts`** should export:
- `InterviewScheduleModal`
- `InterviewDetails`

**`src/components/offer/index.ts`** should export:
- `OfferLetterModal`
- `OfferLetterView`

**`src/components/preboarding/index.ts`** should export:
- `PreBoardingChecklist`

**`src/components/orientation/index.ts`** should export:
- `OrientationCard`

### 5. Dashboard Wiring Check

**`src/components/employer-dashboard/ApplicantsTab.tsx`** should:
- Import and render `InterviewScheduleModal`
- Import and render `OfferLetterModal`
- Have "Schedule Interview" and "Make Offer" buttons wired to open modals
- Have "Send Pre-Boarding" and "Send Orientation" buttons

**`src/components/dashboard/ApplicationCard.tsx`** should:
- Show `InterviewDetails` when status is `interviewing`
- Show `OfferLetterView` when status is `offer`
- Show `PreBoardingChecklist` when offer is accepted
- Show `OrientationCard` when orientation details exist

### 6. Email Integration Check

**`src/api/emails.ts`** should export:
- `sendInterviewInvitation`
- `sendInterviewFollowUp`
- `sendOfferLetter`
- `sendPreBoardingChecklist`
- `sendOrientation`

### 7. Type Check

**`src/types/hiring-flow.ts`** should have:
- `InterviewDetails` interface
- `OfferDetails` interface
- `OnboardingChecklistItem` interface
- `OrientationDetails` interface

**`src/types/application.ts`** should have optional fields:
- `interviewDetails?: InterviewDetails`
- `offerDetails?: OfferDetails`
- `preBoardingChecklist?: OnboardingChecklistItem[]`
- `orientationDetails?: OrientationDetails`

## If Issues Found

- Fix any TypeScript errors
- Fix any build errors
- Fix any import issues
- Commit fixes

## Report

Write your report to `/home/jacobp/Desktop/Projecs/hirehub-frontend/.superpowers/sdd/task-9-report.md`:
- Test results for each check
- Any issues found and fixed
- Final status

Then report back with ONLY:
- **Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
- Commits created (short SHA + subject)
- One-line test summary
- Your concerns, if any
- The report file path