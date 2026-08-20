# Task M8 — Employer Kanban Pipeline Tab (drag-and-drop)

**Status:** DONE

## Per-task summary

### 8.1 — pure `src/utils/kanban.ts` (TDD red → green)
- **Red:** wrote `src/utils/__tests__/kanban.test.ts` first (12 tests) and confirmed failure (module not found).
- **Green:** implemented `src/utils/kanban.ts`:
  - `PIPELINE_COLUMNS` — 6 active columns (applied → hired) with `{ key, label, color }` per the brief.
  - `TERMINAL_STATUSES = ['rejected', 'withdrawn'] as const`.
  - `groupByStatus(apps)` — groups into active columns only (terminal statuses excluded); every active column key is present even when empty.
  - `moveCard(columns, fromKey, toKey, appId)` — gates through `canTransition` from `utils/status.ts`; illegal moves (e.g. `applied → offer`, same-column, unknown app, from terminal status) return `{ columns, app: null, allowed: false }` and never mutate columns.
- 12/12 tests pass.

### 8.2 — `src/components/employer-dashboard/PipelineTab.tsx`
- Props `{ applications: Application[] }`; `updateApplicationStatus` from `ApplicationsContext`.
- `columns` state initialized via `groupByStatus` and recomputed when the `applications` prop changes (used the React-recommended "adjust state during render when a prop changes" pattern — see Concerns, the brief's `useEffect` version is flagged by the repo's `react-hooks/set-state-in-effect` lint rule).
- `DndContext` `onDragEnd`: parses `col-${status}:${appId}` / `col-${status}` ids (`String(id).split(':')[0]` then strips the `col-` prefix), calls `moveCard`; only when `allowed` does it optimistically set columns and call `updateApplicationStatus(appId, to.toUpperCase() as ApplicationStatus)`. On API failure it rolls the local columns back to `groupByStatus(applications)` and shows an error toast via the repo's standard `useToast` (`../ui/Toast`) — mirrored from the codebase's toast pattern (ApplicantsTab itself doesn't toast on failure, so no direct precedent existed).
- Reuses `ApplicationCard` inside each draggable card (`useDraggable` wrapper with `transform` + `touch-none`), passing both its existing props: `application` and `onStatusUpdate` (wired to the context so Offer Letter accept/decline still works).
- Each column is a `useDroppable` (`col-${key}`); `DragOverlay` renders the dragged card; toolbar shows per-column status counts; a non-draggable "Closed" grid section lists `rejected` + `withdrawn` cards.

### 8.3 — `src/components/employer-dashboard/__tests__/PipelineTab.test.tsx`
- Mocks `@dnd-kit/core` with the brief's exact structure (DndContext captures `onDragEnd` on `__dragEnd`; deterministic `useDraggable`/`useDroppable`; passthrough `DragOverlay`) — only deviation is replacing `: any` with explicit types so the repo's `@typescript-eslint/no-explicit-any` lint gate stays green (see Concerns).
- Asserts the 4 required behaviors:
  1. renders 6 column headers and places a card in its column;
  2. `drag(app.id, 'applied', 'screening')` calls `updateApplicationStatus` with `'SCREENING'`;
  3. `drag(app.id, 'applied', 'offer')` does NOT call `updateApplicationStatus` (matrix gate);
  4. rejected/withdrawn cards appear in the Closed section, not in columns.
- 4/4 tests pass.

### Wiring — `EmployerDashboardPage.tsx`
- Added a "Pipeline" tab beside Applicants (tablist buttons + `?tab=pipeline` routing).
- Applications are supplied via a small `PipelineTabWrapper` inside the page that reads `useApplications()` and renders `<PipelineTab applications={...} />`. This wrapper keeps `EmployerDashboardPage` itself free of the ApplicationsContext hook so the existing page test (which mounts no ApplicationsProvider) stays green untouched.

### Runtime correctness fix — `src/api/applications.ts`
- `updateApplicationStatus` now lowercases the incoming status before the `STATUS_TO_UPPER` lookup. The brief mandates calling the context with `to.toUpperCase()` (e.g. `'SCREENING'`), but the API layer keyed `STATUS_TO_UPPER` by lowercase, which would have sent `{ status: undefined }` at runtime. Lowercasing at the API boundary keeps the brief's contract and test while making the real call correct. Existing lowercase callers (ApplicantsTab, CandidateDetailDrawer) are unaffected; the existing `updateApplicationStatus sends uppercase status` API test still passes.

## Gates

| Gate | Result |
|---|---|
| `npm run test:run` | 72 files / 300 tests passed |
| `npm run lint` | clean (exit 0) |
| `npm run build` | `tsc -b` + vite build succeeded |

## Files changed (staged in commit)

- `src/utils/kanban.ts` (new)
- `src/utils/__tests__/kanban.test.ts` (new)
- `src/components/employer-dashboard/PipelineTab.tsx` (new)
- `src/components/employer-dashboard/__tests__/PipelineTab.test.tsx` (new)
- `src/components/employer-dashboard/EmployerDashboardPage.tsx`
- `src/api/applications.ts`
- `package.json`, `bun.lock`, `package-lock.json` (added `@dnd-kit/core@6.3.1`)

## Self-review findings

- No API call is ever made for illegal moves: `moveCard` returns `allowed:false` (also for same-column and unknown-card drops) and the UI returns before `updateApplicationStatus`.
- Optimistic + rollback: columns are updated optimistically only after the gate passes; on rejection the local columns are recomputed from the (unchanged) `applications` prop and an error toast is shown. Because `ApplicationsContext` only mutates its array on a successful API call, the prop remains the source of truth through the whole cycle.
- No `.superpowers/` files staged; none of the random-sort WIP files (`src/components/jobs/JobBoardPage.tsx`, `src/hooks/useJobs.ts`, `src/api/types.ts`, `src/components/employers/PricingSection.tsx`, `src/components/home/HeroSection.tsx`, `src/components/jobs/__tests__/JobBoardPageSearch.test.tsx`, or the employer pricing test) are staged.
- Existing EmployerDashboardPage tests (3 tab assertions, default-tab assertion) still pass unchanged.

## Concerns / adaptations vs the brief

1. **`useEffect` → render-time adjustment** in PipelineTab. The brief said "columns recomputed via effect when the prop changes"; the repo's lint rule `react-hooks/set-state-in-effect` (react-hooks v7) errors on it. Replaced with the React-documented "adjusting state when a prop changes" pattern (`if (prevApplications !== applications) { setPrevApplications(applications); setColumns(groupByStatus(applications)) }`) — same behavior, lint-clean.
2. **Test mock `any` → explicit types.** The brief's mock uses `: any`, which the repo's `@typescript-eslint/no-explicit-any` (error) lint gate rejects. Kept the exact mock structure/behavior with typed props (`ReactNode`, `DragEndPayload`) and `as unknown as MockDndContext` casts.
3. **`api/applications.ts` case normalization** (see Wiring) — required so the brief's `to.toUpperCase()` context call doesn't send `{ status: undefined }` to the backend. Flagging as the one out-of-scope-but-necessary file touched.
4. **`TERMINAL_STATUSES.includes(...)` TS error** — `as const` tuple vs `ApplicationStatus`; widened to `readonly string[]` in the two filter call sites (build gate).
5. **dnd-kit version:** `@dnd-kit/core@6.3.1` installed as a runtime dependency via `bun add` (repo convention: Dockerfile uses bun + `bun.lock`; `package-lock.json` synced with `npm install --package-lock-only` since both lockfiles are tracked). `@dnd-kit/utilities` came in as a transitive dep of core; only `@dnd-kit/core` was added to `package.json`.
6. **ApplicationCard props:** passes `application` and `onStatusUpdate` (the card's full existing prop surface) so offer accept/decline and Hiring Flow still function inside the pipeline.
