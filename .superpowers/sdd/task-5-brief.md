### Task 5.1 — `src/types/application.ts` (red: compile against new tests)

```ts
export type ApplicationStatus =
  | 'applied' | 'screening' | 'shortlist' | 'interviewing'
  | 'offer' | 'hired' | 'rejected' | 'withdrawn'

export interface ScreeningAnswer {
  questionId: string
  answerText: string
  score?: number
  matchedKeywords?: string[]
  question?: { prompt: string; expectedKeywords: string[]; maxScore: number }
}

export interface ScreeningResult { score: number; maxPossible: number }

export interface TimelineEntry {
  id: string
  fromStatus: ApplicationStatus | null
  toStatus: ApplicationStatus
  actorRole: string
  createdAt: string
}
```

Extend the existing `Application` interface with `screeningResult?: ScreeningResult`, `screeningAnswers?: ScreeningAnswer[]`, `timeline?: TimelineEntry[]` (read the file first; do not remove existing fields).

### Task 5.2 — `src/api/applications.ts`

- `STATUS_TO_UPPER`: remove `reviewing`, add `screening: 'SCREENING'`, `shortlist: 'SHORTLIST'`, `hired: 'HIRED'`, `withdrawn: 'WITHDRAWN'`.
- `normalizeApplication`: map `screeningResult`, `screeningAnswers`, `timeline` (dates → strings as the rest of the object does).
- New functions (read the file and mirror existing signatures/error handling):
  - `getApplication(id: string): Promise<Application>`
  - `withdrawApplication(id: string): Promise<Application>`
  - extend the apply call to accept `screeningAnswers: { questionId: string; answerText: string }[]`.

### Task 5.3 — new `src/utils/status.ts`

Centralize the duplicated `statusConfig` records:

```ts
import type { ApplicationStatus } from '../types/application'

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string }> = {
  applied: { label: 'Applied', color: 'bg-ink-muted/10 text-ink-muted' },
  screening: { label: 'Screening', color: 'bg-amber-500/10 text-amber-600' },
  shortlist: { label: 'Shortlist', color: 'bg-sky-500/10 text-sky-600' },
  interviewing: { label: 'Interviewing', color: 'bg-violet-500/10 text-violet-600' },
  offer: { label: 'Offer', color: 'bg-emerald-500/10 text-emerald-600' },
  hired: { label: 'Hired', color: 'bg-green-600/10 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-error/10 text-error' },
  withdrawn: { label: 'Withdrawn', color: 'bg-ink-muted/10 text-ink-muted' },
}

export const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  applied: ['screening', 'shortlist', 'rejected', 'withdrawn'],
  screening: ['shortlist', 'interviewing', 'rejected', 'withdrawn', 'applied'],
  shortlist: ['interviewing', 'offer', 'rejected', 'withdrawn'],
  interviewing: ['offer', 'rejected', 'withdrawn'],
  offer: ['hired', 'rejected', 'withdrawn'],
  hired: [],
  rejected: [],
  withdrawn: [],
}

export function canTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false
}
```

Update the four components to import `STATUS_CONFIG` instead of their local records (delete the locals). Specific line-level changes:
- `ApplicantsTab.tsx`: `statusConfig` → `STATUS_CONFIG`; replace `app.status !== 'reviewing'` with `app.status !== 'screening'` and `handleStatusChange(app.id, 'reviewing')` → `'screening'`.
- `CandidateDetailDrawer.tsx` (~lines 224/228): same `reviewing` → `screening` replacement.
- `ApplicationCard.tsx`: local record → import.
- `AdminPage.tsx`: local record → import.
- `HiringFlowModal.tsx`: `STAGES` — replace `{ key: 'reviewing', ... }` with `{ key: 'screening', label: 'Screening', description: 'Your application is being screened against the job requirements.' }`; add `{ key: 'hired', label: 'Hired', ... }`; extend `STATUS_ORDER`: `screening: 1`, `shortlist: 2`, `interviewing: 3`, `offer: 4`, `hired: 5`, `rejected: 3`, `withdrawn: 0`.

### Task 5.4 — `(sweep)` tests (red → green)

- `src/api/__tests__/applications.test.ts`: `'REVIEWING'` → `'SCREENING'` and `status: 'reviewing'` → `'screening'`.
- `src/components/dashboard/__tests__/ApplicationCard.test.tsx`: `status: 'reviewing'` → `'screening'`.
- `src/components/dashboard/__tests__/HiringFlowModal.test.tsx`: `status: 'reviewing'` → `'screening'`; assert the modal renders a "Screening" stage.
- New `src/utils/__tests__/status.test.ts`: `canTransition('screening', 'interviewing') === true`, `canTransition('applied', 'offer') === false`, `STATUS_CONFIG` has all 8 keys.

Run `npm run test:run`, `npm run lint`, `npm run build` → green. Commit: `feat(frontend): expand application status types and centralize status config`.

---

## M6 — PostJobForm screening question editor

**File:** `src/components/post-job/PostJobForm.tsx` (+ existing `__tests__/PostJobForm.test.tsx` must stay green). Read the form first to learn its state shape and submit path (props vs internal API call).

