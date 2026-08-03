# ExecPlan: Frontend Hardening — Accessibility, Testing, React 19 & Performance

## Purpose / Big Picture

After this plan is complete, the HireHub frontend will:

1. **Pass WCAG 2.2 AA** — keyboard navigation works everywhere, screen readers announce all dynamic content, focus indicators are always visible, and motion can be reduced.
2. **Have a testing safety net** — Vitest + React Testing Library covering critical paths (auth forms, job apply, dashboard tabs, toast system).
3. **Use React 19 idioms** — native document metadata (no react-helmet-async), memoized split contexts, `useOptimistic` for save/unsave, no async useEffect warnings.
4. **Perform well** — TanStack Query for server state with caching/deduplication, route preloading, bundle analyzed and optimized.
5. **Be production-ready** — error tracking integration point, route-level error boundaries, consistent form validation with react-hook-form + Zod.

The user-visible outcome: a polished, accessible job platform where keyboard users can navigate everything, forms validate before submission, page transitions feel instant with caching, and the codebase has tests to prevent regressions.

---

## Progress

- [x] (2026-07-15) Phase 1: Critical Foundations — fixed focus indicators, prefers-reduced-motion, Radix Dialog mobile nav, resume upload bug, useReducedMotion in 4 components
- [x] (2026-07-15) Phase 2: Testing Infrastructure — Vitest + RTL setup, 20 tests passing across Button, Toast, LoginPage, AppContext
- [x] (2026-07-15) Phase 3: Accessibility & Form Hardening — WAI-ARIA Tabs component, react-hook-form + Zod in 4 forms, route-level ErrorBoundaries, sanitized production errors
- [x] (2026-07-15) Phase 4: React 19 Modernization — removed react-helmet-async, split AppContext into Auth/SavedJobs/Applications contexts, useOptimistic for save/unsave, fixed async useEffect
- [ ] Phase 5: Performance & Polish (TanStack Query, route preloading, bundle optimization)

---

## Surprises & Discoveries

(none yet)

## Decision Log

(none yet)

---

## Context and Orientation

### Codebase Overview

- **Framework**: React 19.2.7 SPA with Vite 8.1.1, TypeScript 6.0
- **Routing**: react-router-dom 7.18.1 with BrowserRouter, all routes lazy-loaded
- **Styling**: Tailwind CSS 3 with CSS custom property tokens (`index.css`), dark mode via `[data-theme="dark"]`
- **State**: React Context + `useReducer` in a single monolithic `AppContext.tsx`
- **API**: Custom fetch wrapper (`src/api/client.ts`) with JWT access token (in-memory) + HTTP-only refresh cookie
- **Forms**: Mixed — react-hook-form + Zod in `PostJobForm.tsx`, manual `useState` in 6 other forms
- **Components**: 19 reusable UI primitives in `src/components/ui/`, feature-specific components in 11 directories
- **Testing**: None configured — no test framework, no test files, no test scripts

### Key Files

| File | Purpose |
|---|---|
| `/src/index.css` | Global styles, CSS custom properties (design tokens), font imports |
| `/src/App.tsx` | Root routing, provider nesting, lazy-loaded routes, AnimatePresence |
| `/src/main.tsx` | Entry point, BrowserRouter, AppProvider wrapper |
| `/src/context/AppContext.tsx` | Global state: user, savedJobIds, applications, loading |
| `/src/context/ThemeContext.tsx` | Dark/light theme toggle |
| `/src/components/ui/Button.tsx` | Reusable button with 4 variants, motion.button |
| `/src/components/ui/Toast.tsx` | Toast notification system with context API |
| `/src/components/ui/ErrorBoundary.tsx` | Class-based error boundary (only one in app) |
| `/src/components/layout/Navbar.tsx` | Sticky nav with mobile hamburger drawer |
| `/src/components/auth/LoginPage.tsx` | Login form (manual useState) |
| `/src/components/auth/SignupPage.tsx` | Signup form with role selection |
| `/src/components/apply/ApplyJobForm.tsx` | Job application form with file upload |
| `/src/components/dashboard/DashboardPage.tsx` | Seeker dashboard with tabs |
| `/src/components/employer-dashboard/EmployerDashboardPage.tsx` | Employer dashboard with tabs |
| `/src/components/contact/ContactForm.tsx` | Contact form (manual useState) |
| `/src/components/post-job/PostJobForm.tsx` | Post job form (react-hook-form + Zod) — reference implementation |
| `/src/utils/usePageMeta.tsx` | SEO metadata via react-helmet-async |
| `/src/api/client.ts` | Fetch wrapper with token refresh |
| `/src/api/applications.ts` | Application API endpoints |
| `/tailwind.config.js` | Tailwind config with CSS variable mappings |
| `/vite.config.ts` | Vite config with proxy and manual chunks |

### Terminology

- **Design tokens**: CSS custom properties (`--color-canvas`, `--color-ink`, etc.) that define the visual language
- **WAI-ARIA tabs**: The accessible tabs pattern from W3C with `tablist`/`tab`/`tabpanel` roles and keyboard navigation
- **Focus trap**: When a modal/dialog is open, keyboard focus cycles only within it and cannot escape to background content
- **Server state**: Data fetched from the API (jobs, applications, blog posts) — managed by TanStack Query after Phase 4
- **Client state**: UI state (theme, auth session, saved job IDs) — stays in Context/Zustand

---

## Plan of Work

### Milestone 1: Critical Accessibility & Bug Fixes

**Goal**: Fix the 3 highest-severity accessibility gaps and the resume upload bug.

**Work**:
1. **`index.css`** — Replace `:focus-visible { outline: none; }` with a proper visible fallback. Add `@media (prefers-reduced-motion: reduce)` block.
2. **`Navbar.tsx`** — Replace the CSS `translate-x` mobile nav with `@radix-ui/react-dialog` (already installed) for proper focus trap, Escape key, and focus restoration.
3. **`ApplyJobForm.tsx`** — Capture the `File` object in state, pass it via FormData to `createApplication`.
4. **Framer Motion** — Add `useReducedMotion()` to `App.tsx` page transitions, `Reveal.tsx`, `Button.tsx`, and `Toast.tsx`.

**Result**: Keyboard users can navigate the mobile nav, focus is always visible, motion can be reduced, and resume uploads actually work.

**Proof**:
- Tab through the entire page — focus indicator visible on every interactive element
- Open mobile nav — focus moves into it, Escape closes it, focus returns to hamburger button
- Apply to a job with a resume — verify the file is sent in the network request
- Enable `prefers-reduced-motion: reduce` in OS — no animations play

### Milestone 2: Testing Infrastructure

**Goal**: Establish Vitest + React Testing Library with initial test coverage.

**Work**:
1. Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`.
2. Create `vitest.config.ts` with React plugin and jsdom environment.
3. Add `test` and `test:coverage` scripts to `package.json`.
4. Write tests for: Button (variants, click, disabled), Toast (show, dismiss, auto-dismiss), LoginPage (renders, validates, submits), AppContext reducer (actions).
5. Create `src/test/setup.ts` with jest-dom matchers.

**Result**: `bun test` runs and passes all tests. CI-ready test infrastructure.

**Proof**:
- `bun test` exits 0 with all tests passing
- Coverage report shows component-level coverage

### Milestone 3: WAI-ARIA Tabs & Form Validation

**Goal**: Complete accessible tabs and consistent form validation across all forms.

**Work**:
1. **Extract reusable `<Tabs>` component** — WAI-ARIA compliant with keyboard navigation, proper roles, and IDs.
2. **Refactor `DashboardPage.tsx` and `EmployerDashboardPage.tsx`** to use the new Tabs component.
3. **Standardize forms with react-hook-form + Zod** — Create schemas for LoginPage, SignupPage, ContactForm, ApplyJobForm. Port from manual useState to `useForm` + `zodResolver`. Use `PostJobForm.tsx` as the reference pattern.
4. **Add `role="alert"` to all form-level error messages.**
5. **Add `fieldset`/`legend` to SignupPage radio group.**
6. **Add route-level ErrorBoundaries** around each lazy-loaded route in `App.tsx`. Sanitize error messages in production.

**Result**: All forms validate client-side with field-level errors. Tabs work with arrow keys. Errors are announced by screen readers.

**Proof**:
- Tab through dashboard tabs with arrow keys — focus moves correctly, panels are announced
- Submit empty login form — field errors appear and are announced
- Submit invalid email — format error shown
- Trigger a route error — boundary catches it, shows sanitized message

### Milestone 4: React 19 Modernization

**Goal**: Replace React 18-era patterns with React 19 idioms.

**Work**:
1. **Remove `react-helmet-async`** — Convert `usePageMeta()` to render `<title>`, `<meta>`, `<link>` directly in components (React 19 native document metadata). Remove `HelmetProvider` from `App.tsx`.
2. **Split AppContext** — Create `AuthContext` (user, login/logout), `SavedJobsContext` (savedJobIds, toggle), `ApplicationsContext` (applications, add/update). Memoize all values with `useMemo`. Create focused `useAuth()`, `useSavedJobs()`, `useApplications()` hooks.
3. **Fix async useEffect** — Refactor `AppProvider` initialization to avoid async useEffect pattern.
4. **Add `useOptimistic`** — Use for save/unsave job toggle in SavedJobsContext for instant UI feedback.
5. **Memoize `useApp()` return** — Ensure the hook returns stable references.

**Result**: No React 19 warnings, memoized contexts prevent unnecessary re-renders, save/unsave feels instant, metadata is rendered inline.

**Proof**:
- No console warnings about async effects
- Profiling with React DevTools — context consumers only re-render when their specific slice changes
- Save a job — UI updates instantly before API response
- Page titles render correctly without react-helmet-async

### Milestone 5: Performance & Polish

**Goal**: Add server-state caching, optimize bundle, ensure consistent loading states.

**Work**:
1. **Install TanStack Query** — Create query client with sensible defaults (staleTime: 5min, retry: 2). Wrap app in `QueryClientProvider`.
2. **Convert API fetching** — Jobs list, job detail, blog posts, saved jobs, applications all use `useQuery`/`useMutation`. Remove manual loading/error state management for server data.
3. **Add route preloading** — Prefetch job detail on hover/focus of job cards. Prefetch blog post on hover.
4. **Bundle analysis** — Run `vite build` with visualizer, identify and optimize heavy chunks. Consider dynamic import for framer-motion if it's a large chunk.
5. **Add loading skeletons** — Ensure every data-fetching view shows skeleton state during loading (use existing Skeleton components).
6. **Design token cleanup** — Consolidate `error`/`danger`, add `--color-warning`, `--color-info`, `--color-focus-ring`. Add `color-scheme: light dark`.

**Result**: Page loads are faster with caching, skeletons show during all fetches, bundle is optimized.

**Proof**:
- Navigate to /jobs — data loads from cache on second visit (network tab shows 304 or cached)
- Hover a job card — detail page prefetches
- `bun run build` — bundle size within budget
- All pages show skeletons during loading

---

## Concrete Steps

### Phase 1 Execution (Milestone 1)

```bash
# Step 1: Install framer-motion reduced-motion support (already installed, just need hook usage)
# No new deps needed for Phase 1

# Step 2: Fix index.css
# Edit src/index.css — replace focus-visible outline:none, add prefers-reduced-motion

# Step 3: Fix Navbar with Radix Dialog
# Edit src/components/layout/Navbar.tsx — wrap mobile nav in Dialog

# Step 4: Fix ApplyJobForm resume upload
# Edit src/components/apply/ApplyJobForm.tsx — capture File in state

# Step 5: Add useReducedMotion to animated components
# Edit src/App.tsx, src/components/ui/Button.tsx, src/components/ui/Toast.tsx, src/components/ui/Reveal.tsx
```

### Phase 2 Execution (Milestone 2)

```bash
# Step 1: Install test dependencies
bun add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# Step 2: Create vitest config
# Write vitest.config.ts

# Step 3: Create test setup
# Write src/test/setup.ts

# Step 4: Add test scripts to package.json
# "test": "vitest", "test:run": "vitest run", "test:coverage": "vitest run --coverage"

# Step 5: Write tests
# Write src/components/ui/__tests__/Button.test.tsx
# Write src/components/ui/__tests__/Toast.test.tsx
# Write src/components/auth/__tests__/LoginPage.test.tsx
# Write src/context/__tests__/AppContext.test.tsx
```

### Phase 3 Execution (Milestone 3)

```bash
# Step 1: Create Tabs component
# Write src/components/ui/Tabs.tsx with WAI-ARIA pattern

# Step 2: Refactor dashboard pages
# Edit src/components/dashboard/DashboardPage.tsx
# Edit src/components/employer-dashboard/EmployerDashboardPage.tsx

# Step 3: Install react-hook-form + zod (already installed)
# Already in package.json — no install needed

# Step 4: Create Zod schemas
# Write src/schemas/auth.ts (login, signup)
# Write src/schemas/contact.ts
# Write src/schemas/application.ts

# Step 5: Refactor forms
# Edit LoginPage.tsx, SignupPage.tsx, ContactForm.tsx, ApplyJobForm.tsx

# Step 6: Add route-level error boundaries
# Edit App.tsx — wrap each Route in ErrorBoundary

# Step 7: Sanitize ErrorBoundary production messages
# Edit src/components/ui/ErrorBoundary.tsx
```

### Phase 4 Execution (Milestone 4)

```bash
# Step 1: Remove react-helmet-async
bun remove react-helmet-async

# Step 2: Convert usePageMeta to native document metadata
# Rewrite src/utils/usePageMeta.tsx
# Update all page components to use new pattern

# Step 3: Split AppContext
# Write src/context/AuthContext.tsx
# Write src/context/SavedJobsContext.tsx
# Write src/context/ApplicationsContext.tsx
# Edit src/context/AppContext.tsx — compose providers
# Update all consumer imports

# Step 4: Add useOptimistic for save/unsave
# Edit SavedJobsContext.tsx

# Step 5: Fix async useEffect
# Edit AppContext.tsx initialization pattern
```

### Phase 5 Execution (Milestone 5)

```bash
# Step 1: Install TanStack Query
bun add @tanstack/react-query

# Step 2: Create query client
# Write src/api/queryClient.ts

# Step 3: Add QueryClientProvider to App.tsx

# Step 4: Convert API fetching to queries  [DONE — commits 400c987..b7f4b4b]
# Created src/hooks/useJobs.ts, useJob.ts, useBlogPosts.ts, useSavedJobs.ts, useApplications.ts, useEmployerJobsQuery.ts, useCandidateProfileQuery.ts
# Refactored pages to use these hooks. Deferred surfaces: MessagesTab, AdminPage, PricingSection, NotificationBell, layout components

# Step 5: Add route preloading
# Edit job cards and nav links

# Step 6: Bundle analysis  [DONE]
# JobBoardPage chunk 10.09 kB / 3.22 kB gz (baseline ~10.68 kB / 3.41 kB gz); single shared useQuery chunk, no per-page Query duplication

# Step 7: Design token cleanup
# Edit src/index.css and tailwind.config.js
```

---

## Validation and Acceptance

### Automated Validation

```bash
# After each phase, run:
bun run typecheck    # TypeScript compilation passes
bun run lint         # ESLint passes
bun test             # All tests pass (after Phase 2)
bun run build        # Production build succeeds
```

### Manual Validation Checklist

**Phase 1 (Accessibility)**:
- [ ] Tab through entire homepage — focus ring visible on every interactive element
- [ ] Open mobile nav on small viewport — focus trapped inside, Escape closes, focus returns to trigger
- [ ] Apply to a job with resume — check Network tab for FormData with file
- [ ] Enable OS reduced motion — page transitions, toasts, reveals, buttons all skip animation

**Phase 2 (Testing)**:
- [ ] `bun test` — all tests pass
- [ ] `bun run test:coverage` — coverage report generated

**Phase 3 (Tabs & Forms)**:
- [ ] Dashboard tabs — arrow keys move between tabs, screen reader announces panel
- [ ] Submit empty login form — "Email is required" + "Password is required" errors shown and announced
- [ ] Submit signup with mismatched passwords — error shown
- [ ] Submit contact form empty — validation errors shown
- [ ] Trigger route error — boundary catches, shows generic message

**Phase 4 (React 19)**:
- [ ] No React 19 console warnings
- [ ] React DevTools profiler — context consumers only re-render on relevant changes
- [ ] Save/unsave job — UI updates instantly
- [ ] Page titles render correctly on all pages

**Phase 5 (Performance)**:
- [ ] Navigate to /jobs twice — second load is instant (cache hit)
- [ ] Hover job card — network shows prefetch request
- [ ] All data pages show skeleton during loading
- [ ] `bun run build` — bundle size within 300KB gzipped total

---

## Idempotence and Recovery

- **Each phase is independent** — if Phase N fails, earlier phases are unaffected
- **Git branches** — create a branch per phase, merge after validation
- **Rollback** — `git checkout main` reverts all changes; dependencies can be removed with `bun remove`
- **Test gate** — each phase must pass `bun test` (after Phase 2) before proceeding
- **TypeScript gate** — `bun run typecheck` must pass before any commit
