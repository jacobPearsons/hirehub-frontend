# Task 3 Report: Help Center

## Status: DONE_WITH_CONCERNS

## What I implemented
- `src/components/help/helpData.ts` — `HelpArticle`, `HelpCategory` interfaces and `helpCategories` (4 categories: For Job Seekers, For Employers, Accounts & Billing, Still need help?) transcribed verbatim from the brief.
- `src/components/help/HelpCenterPage.tsx` — default-exported page: heading, search filter input labeled "Search the help center", category sections with `details`/`summary` accordions, "No articles match" empty state, and a contact CTA linking to `/contact` and `/faq`. `usePageMeta` consumed for `/help`.
- `src/components/help/index.ts` — barrel re-exporting `helpCategories`, types, and `HelpCenterPage`.
- `src/App.tsx` — lazy import `const HelpCenterPage = lazy(() => import('./components/help/HelpCenterPage'))` added after the `CookiePolicyPage` lazy import (App.tsx:30), and `<Route path="/help" element={<ErrorBoundary><HelpCenterPage /></ErrorBoundary>} />` added immediately after the `/cookies` route (App.tsx:73). Anchors verified before editing.
- `src/components/help/__tests__/HelpCenterPage.test.tsx` — the 4 tests transcribed verbatim from the brief.

## TDD Evidence

### RED
Command: `npx vitest run src/components/help` (before implementing source files)

Output (abridged):
```
Error: Failed to resolve import "../HelpCenterPage" from "src/components/help/__tests__/HelpCenterPage.test.tsx". Does the file exist?
  Plugin: vite:import-analysis
Test Files  1 failed (1)
      Tests  no tests
```
Why expected: the test imports `../HelpCenterPage`, which did not exist yet. Failure was the required first step.

### GREEN
Command: `npx vitest run src/components/help` (after implementation)

Output:
```
Test Files  1 passed (1)
      Tests  4 passed (4)
```
All 4 tests pass, including the user-event filter test (`filters articles as the user types`).

## Verification (Step 8)
- `npx tsc --noEmit` — clean.
- `npx eslint .` — clean.
- `npx vitest run` — 63 files, 252 tests passed (248 prior + 4 new). Full suite green.

## Files changed
- Added: `src/components/help/helpData.ts`
- Added: `src/components/help/HelpCenterPage.tsx`
- Added: `src/components/help/index.ts`
- Added: `src/components/help/__tests__/HelpCenterPage.test.tsx`
- Modified: `src/App.tsx`

## Self-review findings
- All 4 HelpCenterPage tests pass, including the user-event filter test.
- Full suite green (252), tsc clean, eslint clean.
- Staged ONLY the five task files; unrelated working-tree files left untouched/unstaged.
- Committed on `main` with the exact message `feat(help): add help center page with searchable categories`.
- No new npm dependencies.

## Issues / concerns
1. **Deviation from verbatim component (one line):** The brief's verbatim test queries the search input via `getByRole('textbox', { name: /search the help center/i })`, but the brief's verbatim component used `<input type="search">`, which the installed Testing Library exposes with implicit role `searchbox` (verified in the failing run's accessible-roles dump: `searchbox: Name "Search the help center"`). With both files transcribed verbatim, the filter test could never pass — an internal inconsistency in the brief. Since the test is the executable acceptance criteria (task requires all 4 tests pass), I kept the test verbatim and changed the component's `type="search"` to `type="text"`. The `aria-label="Search the help center"` is unchanged, so the input's accessible name and the page behavior are identical; the input now resolves to role `textbox` as the test expects. Alternative (changing the test to `getByRole('searchbox')`) was rejected because the brief's 4 tests are the required passing set.
2. Report file `task-3-report.md` was already a dirty tracked file in the working tree; it was overwritten with this report and left unstaged (not part of the task's five staged files).
