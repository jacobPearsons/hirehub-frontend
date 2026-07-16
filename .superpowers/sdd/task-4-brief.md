# Task 4: Stage 2 — Interview Details (Candidate View)

## Task Description

Build a component that displays interview details to the candidate when their application status is "interviewing".

## Files to Create

### `src/components/interview/InterviewDetails.tsx`

A card component that displays interview details when application status is `interviewing`.

**Layout:**
- Card with interview type badge (phone/video/in-person)
- Date and time display
- Interviewer name and title
- Meeting link (clickable, opens in new tab) — only shown for video interviews
- Meeting location — only shown for in-person interviews
- Notes section — only shown if notes exist

**Props:**
```typescript
interface InterviewDetailsProps {
  details: InterviewDetails
}
```

**Styling:**
- Use `Card` component from `../ui`
- Interview type badge: use `Tag` component or inline badge with appropriate colors
  - phone: info color
  - video: accent color
  - in-person: success color
- Clean, readable layout with proper spacing
- Meeting link should be a clickable `<a>` tag with accent color

### `src/components/interview/index.ts`

Barrel export:
```typescript
export { InterviewScheduleModal } from './InterviewScheduleModal'
export { InterviewDetails } from './InterviewDetails'
```

## Files to Modify

### `src/components/dashboard/ApplicationCard.tsx`

Current state: Shows company logo, job title, company name, status badge, and submitted date.

Changes needed:
1. Import `InterviewDetails` from `../interview/InterviewDetails`
2. When `application.status === 'interviewing'` and `application.interviewDetails` exists, render the `InterviewDetails` component below the existing status info
3. The interview details should appear as an expandable section or inline below the card

**Pattern:**
```tsx
{/* After the existing status/date row */}
{application.status === 'interviewing' && application.interviewDetails && (
  <div className="mt-4 pt-4 border-t border-hairline">
    <InterviewDetails details={application.interviewDetails} />
  </div>
)}
```

## Context

- Types: `InterviewDetails` from `../../types/hiring-flow`
- UI components: `Card`, `Tag` from `../ui`
- Existing `ApplicationCard` is at `src/components/dashboard/ApplicationCard.tsx`
- The card already uses `motion.div` with `whileHover` for hover effect
- The card uses the existing `statusConfig` map for status badges

## Existing ApplicationCard Structure

```tsx
<motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
  <Card variant="default" className="p-5">
    <div className="flex items-start gap-4">
      <img ... />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3>{application.jobTitle}</h3>
            <p>{application.company}</p>
          </div>
          <span className={status.color}>{status.label}</span>
        </div>
        <p className="text-xs text-ink-tertiary mt-2">Submitted {submittedDate}</p>
      </div>
    </div>
  </Card>
</motion.div>
```

Add the interview details section after the closing `</div>` of the flex container but before the closing `</Card>`.

## Verification

Run: `npx tsc --noEmit`
Expected: Clean compilation

## Report

Write your report to `/home/jacobp/Desktop/Projecs/hirehub-frontend/.superpowers/sdd/task-4-report.md`
