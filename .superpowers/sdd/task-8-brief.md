# Task 8: Stage 5 — Orientation Details (Candidate View)

## Task Description

Build an orientation details component that shows candidates their onboarding schedule and important information after they have accepted their offer and completed pre-boarding.

## Files to Create

### `src/components/orientation/OrientationCard.tsx`

A card component displaying orientation details.

**Layout:**
- Header: "Your Orientation Schedule" with accent styling
- Orientation date and time (formatted nicely)
- Location (with link if virtual meeting)
- Agenda items as a timeline/list
- Important notes section
- "View Pre-Boarding Checklist" link (if pre-boarding not complete)

**Props:**
```typescript
interface OrientationCardProps {
  details: OrientationDetails
  preBoardingComplete?: boolean
}
```

**Display Fields:**
- Date & Time: formatted as "Monday, January 15, 2024 at 9:00 AM"
- Location: address or "Virtual (link provided)"
- Agenda: bullet list with times if provided
- Notes: paragraph text
- Dress code if provided
- Parking/transit info if provided

**Styling:**
- Use `Card` component from `../ui`
- Accent color for header
- Timeline-style agenda with colored dots
- Clean, professional appearance
- Responsive layout

### `src/components/orientation/index.ts`

Barrel export:
```typescript
export { OrientationCard } from './OrientationCard'
```

## Files to Modify

### `src/components/dashboard/ApplicationCard.tsx`

Changes needed:
1. Import `OrientationCard` from `../orientation/OrientationCard`
2. When `application.status === 'offer'` AND `application.offerDetails?.accepted === true` AND `application.orientationDetails` exists, render `OrientationCard`
3. This should appear after the pre-boarding checklist (or instead of it if no checklist)

**Pattern:**
```tsx
{application.status === 'offer' && 
 application.offerDetails?.accepted === true && 
 application.orientationDetails && (
  <div className="mt-4 pt-4 border-t border-hairline">
    <OrientationCard 
      details={application.orientationDetails} 
      preBoardingComplete={application.preBoardingChecklist?.every(item => item.completed)} 
    />
  </div>
)}
```

## Context

- Types: `OrientationDetails` from `../../types/hiring-flow`, `Application` from `../../types/application`
- UI: `Card` from `../ui`
- The `OrientationDetails` type has: `date`, `location`, `agenda`, `notes`, `dressCode`, `parkingInfo`
- Existing `ApplicationCard` already handles interview details and offer details display

## Verification

Run: `npx tsc --noEmit`
Expected: Clean compilation

## Report

Write your report to `/home/jacobp/Desktop/Projecs/hirehub-frontend/.superpowers/sdd/task-8-report.md`
