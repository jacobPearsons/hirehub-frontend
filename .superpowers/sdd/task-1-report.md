# Task 1 Report — Polyfill IntersectionObserver in vitest setup

## Status

**DONE** (polyfill applied verbatim and committed) with one important deviation from the brief: the brief expected `16 → 2` remaining failures; actual result is `16 → 12`. The remaining 10 are **not** IntersectionObserver failures — they are pre-existing test bugs that were previously masked by the IntersectionObserver uncaught exception poisoning whole suite files. Diagnosed and documented below; fixing them is out of scope for this task (brief commits `src/test/setup.ts` only).

## Before / After failure counts

| Step | Command | Result |
|---|---|---|
| Baseline | `npm run test:run` | **16 failed** / 55 passed (71 total), 6 failed files, 4 uncaught errors |
| After polyfill | `npm run test:run` | **12 failed** / 59 passed (71 total), 5 failed files, 1 uncaught error |
| Type-only check | `npm run build` | ✓ built in 1.83s |

### IntersectionObserver failures fixed (4 tests)

All were caused by framer-motion `whileInView` in `src/components/ui/Reveal.tsx` calling `IntersectionObserver` where jsdom leaves it undefined:

- `BlogPage.test.tsx` — 2 (file now fully passes)
- `JobBoardPage.test.tsx` — 2 ("renders the heading", "shows loading state initially") — these were pure cascade failures from the uncaught exception

### Remaining 12 failures — NOT IntersectionObserver

Verified by running each suite in isolation post-polyfill; each fails with a concrete, non-IntersectionObserver error:

1. **`JobBoardPage.test.tsx` (4)** — pre-existing test bug introduced by commit `72076ee` ("feat: integrate FilterDrawer into JobBoardPage with responsive layout"). The page renders duplicate content for mobile + desktop (`lg:hidden` / `hidden lg:block` are CSS-only visibility, which jsdom does not apply):
   - "renders a search bar" → `Found multiple elements with the placeholder text of: Search jobs...` (two `SearchBar`s, JobBoardPage.tsx:105-122)
   - "renders filter options..." → filters only render after the async `listJobs` resolves; test queries synchronously (needs `await findBy...`)
   - "renders empty state..." → `Found multiple elements with the text: /no jobs match/i` (empty state rendered in both desktop grid and mobile div, JobBoardPage.tsx:149-165)
   - "renders job cards..." → same double-render; `findByText('Frontend Engineer')` times out
2. **`EmployerDashboardPage.test.tsx` (3)** — test mocks `../../../api/jobs` with only `listJobs`, but a component imports `listEmployerJobs` → `No "listEmployerJobs" export is defined on the "../../../api/jobs" mock`
3. **`DashboardPage.test.tsx` (3)** — `OverviewTab` calls `useApplications()` outside an `ApplicationsProvider` → `useApplications must be used within ApplicationsProvider`

Plus the 2 expected for other tasks: `ForgotPasswordPage.test.tsx` (1) and `ContactInfo.test.tsx` (1).

These failures existed before the polyfill (16 baseline includes them) but were attributed to IntersectionObserver because the uncaught exception failed every test in the affected file. Suggest follow-up tasks: fix the JobBoardPage tests to assert against the mobile/desktop duplicates (e.g., `getAllByPlaceholderText` / restructure assertions), add `listEmployerJobs` to the EmployerDashboardPage mock, and wrap DashboardPage tests in `ApplicationsProvider`.

## Files changed

- `src/test/setup.ts` (+11 lines) — appended the no-op `IntersectionObserverMock` and `globalThis.IntersectionObserver` assignment (typed cast `as unknown as typeof IntersectionObserver`), exactly as specified in the brief.

Note: `setupFiles` is already wired in `vitest.config.ts` (`./src/test/setup.ts`), so no config change was needed.

## Commit

- `76f3505` — `fix(test): polyfill IntersectionObserver in vitest setup`
- Staged: `src/test/setup.ts` only (1 file, 11 insertions).
- Untracked files (`errors.md`, `docs/superpowers/plans/2026-07-31-onboarding-wizard-frontend.md`) and the pre-existing modified brief remain unstaged.

## Concerns

1. **Brief expectation mismatch**: the brief's "16 → 2" does not hold; only 4 tests were actually IntersectionObserver-caused. The other 10 require real test/component fixes (see above) and should be tracked as follow-ups, not assumed fixed by this polyfill.
2. `src/test/setup.ts` already had the baseline failure count caveat: the brief's stated 14 affected tests overstated IntersectionObserver's reach because jsdom uncaught exceptions mask sibling failures in the same file.
