# Mobile-First Responsive + Dashboard Port

## Purpose / Big Picture

After this change, every HireHub page works well on screens 320px and up. Dashboard pages get a professional sidebar navigation with a mobile drawer. Job filters use a bottom sheet drawer on mobile instead of consuming the full viewport. The 404 page is a proper centered component.

The user will see: a responsive dashboard shell on `/dashboard` and `/employer/dashboard`, a "Filters" button on mobile job board that opens a bottom sheet, active filter chips showing applied filters, and properly scaled typography/grids across all pages.

## Progress

- [ ] ( ) Task 1: 404 Page Component
- [ ] ( ) Task 2: Sidebar Component
- [ ] ( ) Task 3: Infobar Component
- [ ] ( ) Task 4: DashboardShell Layout
- [ ] ( ) Task 5: FilterDrawer + ActiveFilterChips
- [ ] ( ) Task 6: JobBoardPage Responsive Update
- [ ] ( ) Task 7: Responsive Overhaul — Public Pages
- [ ] ( ) Task 8: Responsive Overhaul — Dashboard & Card Components

## Surprises & Discoveries

(none yet)

## Decision Log

(none yet)

## Context and Orientation

**Codebase:** HireHub frontend — React 19 + React Router 7 + Tailwind CSS 3 + Radix UI + Framer Motion

**Key files:**
- `src/App.tsx` — All routes, lazy-loaded page components, 404 catch-all
- `src/components/layout/Navbar.tsx` — Public navbar with mobile Radix Dialog menu
- `src/components/dashboard/DashboardPage.tsx` — Seeker dashboard (2 tabs)
- `src/components/employer-dashboard/EmployerDashboardPage.tsx` — Employer dashboard (2 tabs)
- `src/components/jobs/JobBoardPage.tsx` — Job listing with sidebar filters
- `src/components/jobs/FilterSidebar.tsx` — Always-visible filter sidebar
- `src/components/jobs/SearchBar.tsx` — Debounced search input

**Reference codebase:** `loft-frontend` at `/home/jacobp/Desktop/Projecs/loft-frontend` — has the sidebar + infobar dashboard shell pattern to port

**Design spec:** `docs/superpowers/specs/2026-07-18-mobile-responsive-dashboard-port-design.md`

**Detailed plan:** `docs/superpowers/plans/2026-07-18-mobile-responsive-dashboard-port.md` — contains exact code for each task

**Architecture:** The DashboardShell wraps dashboard routes with a persistent sidebar (md+) and slide-in drawer (<md). Job filters use a bottom sheet on mobile, sidebar on desktop. All pages get responsive typography/grid/spacing fixes.

**Conventions:** CSS custom property tokens, no cn()/clsx(), string concatenation with ternaries, focus-visible rings, useReducedMotion() guards, border over box-shadow.

## Plan of Work

### Milestone 1: 404 Page Component
**Goal:** Extract the inline 404 JSX into a proper component with responsive typography.
**Work:** Create `src/components/ui/NotFoundPage.tsx`, update `App.tsx` catch-all route.
**Result:** Centered 404 page with `text-5xl md:text-[56px]` heading, responsive padding.
**Proof:** `npx tsc --noEmit` passes, 404 renders correctly at all widths.

### Milestone 2-4: Dashboard Shell (Sidebar + Infobar + DashboardShell)
**Goal:** Build the dashboard layout with persistent sidebar, mobile drawer, and infobar.
**Work:** Create Sidebar, Infobar, DashboardShell components. Update dashboard page headers. Wire into App.tsx routes.
**Result:** Dashboard pages wrapped in shell with sidebar nav (role-based) and top bar.
**Proof:** `npx tsc --noEmit` passes, sidebar visible on desktop, hamburger drawer on mobile.

### Milestone 5-6: Job Filters Mobile UX
**Goal:** Replace the always-visible filter sidebar with a bottom sheet drawer on mobile.
**Work:** Create FilterDrawer, ActiveFilterChips. Update JobBoardPage with conditional rendering.
**Result:** Mobile users see a "Filters" button that opens a bottom sheet. Active filters shown as chips.
**Proof:** `npx tsc --noEmit` passes, filter drawer opens/closes on mobile, chips remove filters.

### Milestone 7-8: Responsive Overhaul
**Goal:** Fix responsive issues across all remaining pages.
**Work:** Update typography, grids, spacing on public pages, dashboard cards, and tabs.
**Result:** No horizontal overflow, proper scaling on all breakpoints.
**Proof:** `npx tsc --noEmit` passes, visual verification at 320px-1280px.

## Concrete Steps

See the detailed plan at `docs/superpowers/plans/2026-07-18-mobile-responsive-dashboard-port.md` for exact code and commands per task.

## Validation and Acceptance

1. `npx tsc --noEmit` — no type errors
2. `npm run build` — production build succeeds
3. Visual check at 320px, 375px, 768px, 1024px, 1280px
4. Dashboard sidebar: persistent on md+, hamburger drawer on <md
5. Job filters: bottom sheet on mobile, sidebar on desktop, active chips visible
6. 404 page: centered, responsive heading
7. No horizontal overflow on any page
8. Keyboard navigation through sidebar, filter drawer, tabs

## Idempotence and Recovery

- Each task is independently committable
- DashboardShell wraps routes but doesn't change page content — reverting App.tsx route changes restores old layout
- FilterDrawer is additive — old FilterSidebar remains for desktop
- All changes are CSS class additions/changes — no data model or API changes
