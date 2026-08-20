### Task 8.1 — pure `src/utils/kanban.ts` (red first)

```ts
export const PIPELINE_COLUMNS = [
  { key: 'applied', label: 'Applied', color: 'bg-ink-muted/10 text-ink-muted' },
  { key: 'screening', label: 'Screening', color: 'bg-amber-500/10 text-amber-600' },
  { key: 'shortlist', label: 'Shortlist', color: 'bg-sky-500/10 text-sky-600' },
  { key: 'interviewing', label: 'Interviewing', color: 'bg-violet-500/10 text-violet-600' },
  { key: 'offer', label: 'Offer', color: 'bg-emerald-500/10 text-emerald-600' },
  { key: 'hired', label: 'Hired', color: 'bg-green-600/10 text-green-700' },
] as const

export const TERMINAL_STATUSES = ['rejected', 'withdrawn'] as const

export function groupByStatus(apps: Application[]): Record<string, Application[]> { /* group, active columns only */ }
export function moveCard(columns: Record<string, Application[]>, fromKey: string, toKey: string, appId: string): { columns: Record<string, Application[]>; app: Application | null; allowed: boolean }
```

`moveCard` uses `canTransition` (from `utils/status.ts`); if the move is illegal it returns `{ columns, app: null, allowed: false }` — the UI never calls the API for illegal moves.

Tests `src/utils/__tests__/kanban.test.ts`: grouping puts apps in the right column, terminal apps excluded from columns; `moveCard` moves a card between legal columns and returns `allowed: false` for illegal (e.g. `applied → offer`).

### Task 8.2 — PipelineTab UI

- Props: `{ applications: Application[] }`. Uses `updateApplicationStatus` from `ApplicationsContext`.
- State: `columns = groupByStatus(applications)` (recomputed via effect when the prop changes).
- `DndContext onDragEnd`: `if (!event.over) return; const from = String(event.active.id).split(':')[0]; const to = String(event.over.id).split(':')[0]; const appId = String(event.active.id).split(':')[1];` → `moveCard(...)`; if `allowed`, optimistic set + `updateApplicationStatus(appId, to.toUpperCase() as any)`; on API failure, refetch and toast.
- Card id convention: `col-${status}:${appId}` (draggable ids) and `col-${status}` (droppable ids).
- Reuse `ApplicationCard` inside each draggable card (pass its existing props; read `ApplicationCard.tsx`).
- Bottom "Closed" section: grid of `rejected` + `withdrawn` cards, non-draggable.
- Toolbar: status counts per column; an "Add new" hint is out of scope.

### Task 8.3 — tests `src/components/employer-dashboard/__tests__/PipelineTab.test.tsx`

Mock `@dnd-kit/core` so jsdom can drive it deterministically:

```ts
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragEnd }: any) => {
    ;(DndContext as any).__dragEnd = onDragEnd
    return children
  },
  useDraggable: () => ({ attributes: {}, listeners: {}, setNodeRef: () => {}, transform: null, isDragging: false }),
  useDroppable: () => ({ setNodeRef: () => {}, isOver: false }),
  DragOverlay: ({ children }: any) => children ?? null,
}))

function drag(appId: string, from: string, to: string) {
  ;(DndContext as any).__dragEnd({ active: { id: `col-${from}:${appId}` }, over: { id: `col-${to}` } })
}
```

Assert:
- renders 6 column headers and places a card in its column.
- `drag(app.id, 'applied', 'screening')` calls `updateApplicationStatus` with `'SCREENING'`.
- `drag(app.id, 'applied', 'offer')` does NOT call `updateApplicationStatus` (matrix gate).
- rejected/withdrawn cards appear in the Closed section, not in columns.

Wire into `EmployerDashboardPage.tsx` as a `PipelineTab` beside `ApplicantsTab` (read the tab rendering first; keep the existing tabs' tests green). Run frontend gates → green. Commit: `feat: employer kanban pipeline tab`.

---

## M9 — CandidateDetailDrawer enrichment

**File:** `src/components/candidate/CandidateDetailDrawer.tsx`. Read it first; it already renders application details and status buttons.

