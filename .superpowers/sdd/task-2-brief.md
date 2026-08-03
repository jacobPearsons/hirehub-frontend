## Task 2 — Fix remaining 10 pre-existing test failures

Post-polyfill reality: **12 failed / 59 passed** in 5 files. All 10 remaining
failures are real test bugs (missing providers/mocks, outdated expectations,
responsive double-render) — NOT framework gaps. Component behavior is
intentional; tests are corrected to match it.

TDD: run each file, fix its tests, re-run until green. Exact fixes:

### 2a. `src/components/jobs/__tests__/JobBoardPage.test.tsx` (4 failures)

`JobCard` calls `useQueryClient` → wrap the render helper in
`QueryClientProvider`:

```ts
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function renderJobBoardPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{/* ...existing wrapper... */}</MemoryRouter>
    </QueryClientProvider>
  )
}
```

`JobBoardPage` renders both a mobile and a desktop layout in one DOM tree
(intentional responsive markup), so every one-off text/placeholder query
matches twice. Fix each assertion:

- "renders a search bar": `getByPlaceholderText('Search jobs...')` →
  `getAllByPlaceholderText('Search jobs...')`, expect `.length` to be ≥ 1.
- "renders filter options ...": the grid is only rendered after `loading`
  clears, so the synchronous `getByText('Category')` races the promise →
  use `await screen.findByText('Category')` (also `findByText` for
  'Seniority' and 'Location').
- "renders empty state when no jobs are returned":
  `await screen.findAllByText(/no jobs match/i)`, expect `.length` ≥ 1.
- "renders job cards when jobs are returned":
  `await screen.findAllByText('Frontend Engineer')`, expect `.length` ≥ 1
  (unblocks once `QueryClientProvider` is present).

### 2b. `src/components/dashboard/__tests__/DashboardPage.test.tsx` (3 failures)

`DashboardPage` renders `OverviewTab` by default, which calls `useApplications()`
(needs `ApplicationsProvider`) and destructures `savedJobIds` from `useApp`
(the mock only returns `user`/`setUser` → `savedJobIds.length` throws). Fix:

- Wrap the render helper in `<ApplicationsProvider>` (safe in tests: no access
  token → it never calls the API) alongside the existing `MemoryRouter` +
  `ToastProvider`.
- Extend the `useApp` mock to return `{ user: null, setUser: vi.fn(), savedJobIds: [] }`.
- "defaults to Saved Jobs tab" is WRONG — the component defaults to `overview`
  (`DashboardPage.tsx:20` `useSearchParams().get('tab') ?? 'overview'`). Rename
  to "defaults to Overview tab" and assert the Overview tab has
  `aria-selected="true"`.

### 2c. `src/components/employer-dashboard/__tests__/EmployerDashboardPage.test.tsx` (3 failures)

The page's `JobListingsTab` (rendered by default) calls `listEmployerJobs()`
from `api/jobs`, but the test mock only exports `listJobs`. Fix:

- Add `listEmployerJobs: vi.fn().mockResolvedValue({ data: [] })` to the
  `vi.mock('../../../api/jobs')` factory (JobListingsTab reads `res.data`).
- "defaults to Job Listings tab" is correct (default is `listings`,
  `EmployerDashboardPage.tsx:14`) — it passes once the mock exists.

Verify: `npm run test:run` → **71 passed / 0 failed**. Also `npm run build`.

Commit: `fix(test): repair JobBoard/Dashboard/EmployerDashboard suites`.

