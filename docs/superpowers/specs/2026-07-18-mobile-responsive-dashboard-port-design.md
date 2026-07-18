# Mobile-First Responsive + Dashboard Port — Design Spec

## Overview

Overhaul HireHub's frontend to be properly mobile-first across all pages, replace the flat tab-based dashboard with a sidebar + infobar shell (ported from loft-frontend), fix the job filter UX on mobile, and extract the 404 page into a proper component.

## Goals

1. Every page works well on screens 320px and up
2. Dashboard pages get a professional sidebar navigation with mobile drawer
3. Job filters don't consume the full mobile viewport — use a bottom sheet drawer
4. 404 page is a proper, centered component

## Non-Goals

- Adding new dashboard features (messages, notifications, profile, settings) — those are future work
- Changing the public navbar (it already has a mobile menu)
- Changing the API layer or data fetching patterns
- Adding new dependencies beyond what's already installed

## Constraints

- Must follow HireHub DESIGN.md conventions: CSS custom property tokens, no `cn()`/`clsx()`, string concatenation with ternaries, focus-visible rings, `useReducedMotion()` guards, border over box-shadow
- Must use existing dependencies (Radix UI, Framer Motion, Lucide, React Router)
- Port patterns from loft-frontend but adapt to React Router and HireHub's styling system
- No new npm packages

---

## Part 1: Dashboard Layout (Sidebar + Infobar)

### Architecture

A `DashboardShell` component wraps both dashboard pages. It provides:
- A persistent sidebar on desktop (md+ breakpoint, 768px)
- A hamburger-triggered slide-in drawer on mobile (<md)
- A top infobar with theme toggle, user info, and logout
- A scrollable main content area

### Components

#### DashboardShell (`src/components/layout/DashboardShell.tsx`)

Wraps children in a flex layout:
```
<div className="flex h-screen overflow-hidden">
  <Sidebar />
  <div className="flex-1 flex flex-col min-w-0">
    <Infobar />
    <main className="flex-1 overflow-y-auto">
      {children}
    </main>
  </div>
</div>
```

On mobile, the Sidebar is hidden by default and toggled via a hamburger button in the Infobar. The hamburger is only visible on mobile (`md:hidden`).

#### Sidebar (`src/components/layout/Sidebar.tsx`)

Dual-mode component accepting `mobile` and `isOpen`/`onClose` props.

**Desktop mode:** `hidden md:flex w-56 shrink-0 border-r border-hairline` — always visible, persistent.

**Mobile mode:** Fixed overlay with backdrop (`bg-black/40`), slide-in-from-left panel (`w-[280px] max-w-[85vw]`), close button.

**Navigation items** (role-based):
- **Seeker:**
  - Dashboard (`/dashboard`) — shows the existing tabbed interface (Saved Jobs + My Applications)
  - Browse Jobs (`/jobs`)
- **Employer:**
  - Dashboard (`/employer/dashboard`) — shows the existing tabbed interface (Job Listings + Applicants)
  - Post Job (`/post-job`)

The dashboard pages retain their internal tab navigation. The sidebar provides top-level navigation between the dashboard, other sections, and actions.

**Active state:** `bg-accent/10 text-accent` (orange accent, matching HireHub's design tokens)

**Styling:** Uses HireHub's CSS tokens — `bg-canvas`, `border-hairline`, `text-ink`/`text-ink-muted`, `hover:bg-surface-2`. Logo at top. User info + logout at bottom.

#### Infobar (`src/components/layout/Infobar.tsx`)

Top bar with:
- Hamburger button (mobile only, `md:hidden`) — triggers sidebar drawer
- ThemeToggle component
- User name (`hidden sm:inline`)
- Logout button (icon)

Styling: `border-b border-hairline h-14 flex items-center justify-between px-4 md:px-6`

### Route Changes

Dashboard routes in `App.tsx` get wrapped in `DashboardShell`:
```tsx
<Route path="/dashboard" element={
  <ProtectedRoute allowedRoles={['seeker']}>
    <DashboardShell>
      <ErrorBoundary><DashboardPage /></ErrorBoundary>
    </DashboardShell>
  </ProtectedRoute>
} />
```

Same pattern for `/employer/dashboard`.

### Dashboard Page Changes

Both `DashboardPage` and `EmployerDashboardPage` lose their outer `Section`/`Container` wrapper (the DashboardShell provides the layout). They keep their content (tabs, tab panels) but the header changes:

**Before:** `flex items-center justify-between mb-8` with HeroContent + link
**After:** Simple header with title + action link, `flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6`

The "Browse jobs" / "Post a new job" links are removed from the dashboard page headers — those actions are now accessible via the sidebar. The dashboard page headers just show the title and subtitle.

---

## Part 2: Job Filters Mobile UX

### Desktop (lg+, 1024px+)

Unchanged. FilterSidebar stays as a sticky sidebar in the `grid-cols-1 lg:grid-cols-[280px_1fr]` layout.

### Mobile (<lg)

The FilterSidebar is hidden. Replaced by:

#### FilterDrawer (`src/components/jobs/FilterDrawer.tsx`)

A bottom sheet that slides up from the bottom of the screen on mobile. Uses Radix Dialog with custom positioning.

**Trigger:** A "Filters" button appears next to the search bar area. It shows a badge with the count of active filters (e.g., "Filters (2)").

**Drawer content:**
- Header: "Filters" title + close button
- Same filter groups as FilterSidebar (Category, Seniority, Location) using the same `FilterOption` sub-component
- Clear filters button at bottom
- "Show results" button that closes the drawer and applies filters

**Styling:** `fixed inset-x-0 bottom-0 z-50 bg-canvas rounded-t-xl border-t border-hairline max-h-[80vh] overflow-y-auto`. Slide-up animation via Framer Motion.

#### ActiveFilterChips (`src/components/jobs/ActiveFilterChips.tsx`)

When the drawer is closed and filters are active, a row of chips appears below the search bar showing what's applied. Each chip shows the filter name and value with an X to remove it.

**Styling:** `flex flex-wrap gap-2` with pill-shaped chips: `inline-flex items-center gap-1 px-2.5 py-1 rounded-pill bg-surface-2 text-sm text-ink-muted`. X button: `text-ink-tertiary hover:text-ink`.

### JobBoardPage Changes

The page conditionally renders:
- **lg+:** Current layout with FilterSidebar in the grid
- **<lg:** Search bar + FilterDrawer trigger button + ActiveFilterChips + FilterDrawer modal

State is shared — the same `filters` state drives both the drawer and the chips.

---

## Part 3: Mobile-First Responsive Overhaul

### Common Patterns Applied

| Pattern | Before | After |
|---------|--------|-------|
| Hero headings | `text-[40px]` | `text-3xl md:text-[40px]` |
| Page headers | `flex items-center justify-between` | `flex flex-col sm:flex-row sm:items-center justify-between gap-4` |
| 2-col grids | `grid-cols-2` | `grid-cols-1 sm:grid-cols-2` |
| Tab overflow | `flex gap-1` | `flex gap-1 overflow-x-auto` (scroll on small screens) |
| Action button rows | `flex items-center gap-2` | `flex flex-wrap items-center gap-2` |
| Container padding | `px-4 md:px-6 lg:px-8` | Already correct (keep) |
| Section padding | `py-24` | `py-12 md:py-24` (reduce on mobile) |

### Page-Specific Changes

#### JobDetailPage
- Breadcrumb + save button: `flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6`
- Grid layout already uses `grid-cols-1 lg:grid-cols-[1fr_380px]` — keep
- Add mobile-specific apply bar at bottom (`lg:hidden`): sticky bottom bar with Apply + Save buttons, similar to loft-frontend pattern

#### DashboardPage + EmployerDashboardPage
- Header: `flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6`
- Tab bar: `flex overflow-x-auto gap-1 border-b border-hairline mb-6` — tabs scroll horizontally on very small screens

#### ApplicantsTab
- Applicant action buttons: `flex flex-wrap gap-2 mt-3` — wraps naturally on mobile
- On very small screens, some buttons could hide behind a "More" dropdown, but flex-wrap is sufficient for now

#### JobListingsTab
- Applicant count + View link: stack on mobile (`flex flex-col sm:flex-row sm:items-center gap-2`)

#### ApplicationCard
- Status badge: position stays top-right on desktop, moves below title on mobile (`flex flex-col sm:flex-row sm:items-center justify-between gap-2`)

#### HomePage
- HeroSection: already has responsive text scaling — verify `text-5xl md:text-7xl lg:text-8xl` pattern
- FeaturedJobs grid: already `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Section padding: `py-12 md:py-24`

#### AboutPage
- AboutStory 2-col: `grid-cols-1 md:grid-cols-2`
- AboutValues: already `grid-cols-1 md:grid-cols-3`
- Section padding reduction on mobile

#### ContactPage
- 2-col layout: `grid-cols-1 md:grid-cols-2`
- Form inputs: full width on mobile (already are)

#### EmployersPage
- Pricing cards: `grid-cols-1 md:grid-cols-3`
- Features grid: `grid-cols-1 md:grid-cols-2`

#### BlogPage
- Card grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

#### Auth Pages (Login, Signup, ForgotPassword, ResetPassword)
- Centered card layout: already works, verify padding on small screens
- Form fields: full width (already are)

#### PostJobPage
- Form layout: verify multi-column fields stack on mobile

---

## Part 4: 404 Page

### Component

Extract from inline JSX in `App.tsx` to `src/components/ui/NotFoundPage.tsx`.

**Design:**
```
<main className="min-h-screen flex items-center justify-center bg-canvas px-4">
  <div className="text-center">
    <h1 className="text-5xl md:text-[56px] font-medium text-ink mb-4">404</h1>
    <p className="text-lg text-ink-muted mb-6">Page not found</p>
    <Link to="/" className="text-accent hover:underline text-sm font-medium">
      Go home
    </Link>
  </div>
</main>
```

**Changes from current:**
- Extracted to a named component
- Responsive heading: `text-5xl md:text-[56px]`
- Added `px-4` for mobile padding
- Same minimal design, just proper component structure

### App.tsx Change

Replace inline JSX in the `*` route with `<NotFoundPage />`.

---

## Design Tokens Used

All styling uses HireHub's existing CSS custom property tokens via Tailwind:
- `bg-canvas`, `bg-surface-1`, `bg-surface-2`
- `text-ink`, `text-ink-muted`, `text-ink-tertiary`
- `border-hairline`
- `text-accent` (orange `#ff5600`)
- `text-error`, `text-success`
- `rounded-lg`, `rounded-pill`
- Focus rings: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30`

## Accessibility

- All interactive elements have focus-visible rings
- Sidebar mobile drawer has focus trap (Radix Dialog provides this)
- FilterDrawer uses proper ARIA attributes
- Tab interfaces use `role="tablist"`, `role="tab"`, `aria-selected`
- Icon-only buttons have `aria-label`
- All animations respect `useReducedMotion()`

## Testing

- Visual verification on 320px, 375px, 768px, 1024px, 1280px viewports
- Keyboard navigation through sidebar, filter drawer, tabs
- Screen reader verification for sidebar landmarks
- Verify no horizontal overflow on any page at any breakpoint
