# WS3: OverviewTab Real-Time Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The dashboard Overview stat cards reflect real-time data (applications, saved jobs, interviews) and route to filtered views; the interview stat uses a corrected status filter; the card gets a neutral, light/dark-safe background image.

**Architecture:** `OverviewTab.tsx` already reads live counts from `useApplications()` and `useApp()` — the counts are real-time as long as those contexts refresh. Fix the interview count to filter on the `interviewing` status exactly and add defensive guards for the `applications` context being empty on first mount. Add a neutral SVG background image (works in both light and dark mode) behind the stat-card grid, and make the stat cards still route to their tab destinations. Optionally add `aria` labels so cards are announced.

**Tech Stack:** React 19, React Router 7, Tailwind CSS 3, Lucide React, existing context providers.

## Global Constraints

- Follow HireHub DESIGN.md conventions: tokens via Tailwind, no `cn()`/`clsx()`, string concat ternaries
- No box-shadow on cards — `border border-hairline`
- Focus-visible rings on interactive elements
- Existing dependencies only — no new npm packages
- Run `npm run test:run`, `npm run build`, `npm run lint` after each task

---

### Task 1: Correct the Interviews count + defensive guards

**Files:**
- Modify: `src/components/dashboard/OverviewTab.tsx:37-41`

**Interfaces:**
- Consumes: `useApplications()` → `{ applications }`; `useApp()` → `{ user, savedJobIds }`
- Produces: Counts array computed with `interviewing` filter and safe access

- [ ] **Step 1: Write the failing test**

Create `src/components/dashboard/__tests__/OverviewTab.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { OverviewTab } from '../OverviewTab'

jest.mock('../../../context/ApplicationsContext', () => ({
  useApplications: () => ({
    applications: [
      { id: 'a1', status: 'applied' },
      { id: 'a2', status: 'interviewing' },
      { id: 'a3', status: 'offer' },
    ],
  }),
}))

jest.mock('../../../context/AppContext', () => ({
  useApp: () => ({ user: null, savedJobIds: ['j1', 'j2'] }),
}))

describe('OverviewTab counts', () => {
  it('renders applications, saved jobs, and interviews counts', () => {
    render(
      <MemoryRouter>
        <OverviewTab />
      </MemoryRouter>,
    )
    expect(screen.getByText('3')).toBeInTheDocument() // applications
    expect(screen.getByText('2')).toBeInTheDocument() // saved jobs
    expect(screen.getByText('1')).toBeInTheDocument() // interviewing
  })

  it('renders stat card links with correct destinations', () => {
    render(
      <MemoryRouter>
        <OverviewTab />
      </MemoryRouter>,
    )
    const savedLink = screen.getByRole('link', { name: /Saved Jobs/i })
    expect(savedLink).toHaveAttribute('href', '/dashboard?tab=saved')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/components/dashboard/__tests__/OverviewTab.test.tsx`
Expected: FAIL — the interview count may be wrong or the links not matched by accessible name.

- [ ] **Step 3: Update the counts computation**

```tsx
const applicationsList = Array.isArray(applications) ? applications : []

const counts = [
  applicationsList.length,
  savedJobIds.length,
  applicationsList.filter(a => a?.status === 'interviewing').length,
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/components/dashboard/__tests__/OverviewTab.test.tsx`
Expected: PASS

- [ ] **Step 5: Full gate**

Run: `npm run test:run && npm run build && npm run lint`
Expected: all pass

- [ ] **Step 6: Commit**

```bash
git add src/components/dashboard/OverviewTab.tsx src/components/dashboard/__tests__/OverviewTab.test.tsx
git commit -m "fix(dashboard): correct interview count and harden overview tab data"
```

---

### Task 2: Neutral light/dark background for the stat-card grid

**Files:**
- Create: `public/overview-grid-bg.svg`
- Modify: `src/components/dashboard/OverviewTab.tsx:117` (grid container)

**Interfaces:**
- Consumes: static SVG asset in `public/`
- Produces: `OverviewTab` renders the grid section with a decorative, non-interactive background layer

- [ ] **Step 1: Create the neutral SVG**

Create `public/overview-grid-bg.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400" fill="none" aria-hidden="true">
  <rect width="800" height="400" fill="transparent"/>
  <circle cx="120" cy="80" r="140" fill="currentColor" opacity="0.04"/>
  <circle cx="680" cy="320" r="180" fill="currentColor" opacity="0.05"/>
  <path d="M0 200 C 200 120, 600 280, 800 160" stroke="currentColor" stroke-width="1" opacity="0.06"/>
</svg>
```

Note: `currentColor` inherits from the CSS `text-ink` token, so the same file renders correctly in both light and dark mode (tint follows ink color).

- [ ] **Step 2: Wire the background into the grid container**

Wrap the stat-card grid with a `relative` section and place the SVG as an absolute layer:

```tsx
<div className="relative overflow-hidden rounded-xl">
  <img
    src="/overview-grid-bg.svg"
    alt=""
    aria-hidden="true"
    loading="lazy"
    className="absolute inset-0 w-full h-full object-cover pointer-events-none text-ink"
  />
  <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4">
    {/* stat cards unchanged */}
  </div>
</div>
```

- [ ] **Step 3: Visual verification**

Run: `npm run dev`, open `/dashboard` at light and dark theme, confirm the background is subtle and legible behind the cards. Verify no horizontal overflow.

- [ ] **Step 4: Full gate**

Run: `npm run test:run && npm run build && npm run lint`
Expected: all pass

- [ ] **Step 5: Commit**

```bash
git add public/overview-grid-bg.svg src/components/dashboard/OverviewTab.tsx
git commit -m "feat(dashboard): add neutral light/dark overview background"
```

---

## Validation and Acceptance

1. Applications, Saved Jobs, and Interviews counts are correct and update when contexts refresh
2. Stat cards still navigate to `/dashboard?tab=applications` and `/dashboard?tab=saved`
3. Background SVG renders in both light and dark themes without clashing
4. All frontend gates pass
