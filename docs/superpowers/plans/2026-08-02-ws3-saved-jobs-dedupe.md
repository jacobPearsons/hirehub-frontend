# WS3: Saved Job Dedupe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Block users from saving the same job twice, frontend and backend.

**Architecture:** The backend `SavedJob` model already has `@@unique([userId, jobId])` (`prisma/schema.prisma:177`), so the DB rejects duplicates. Add a clear frontend guard so `saveJob` never fires for an already-saved job, and make the backend return a graceful 409 instead of a 500 when the unique constraint trips.

**Tech Stack:** Express, Prisma, React 19, existing API client.

## Global Constraints

- Follow existing module structure: controller → service in `src/modules/*`
- Use existing `success`/`created`/`error` helpers from `src/lib/response`
- Backend changes are NOT committed (repo policy) — only frontend commits
- Run frontend `npm run test:run`, `npm run build`, `npm run lint`; backend `npm test`, `npm run build`

---

### Task 1: Backend returns 409 on duplicate save (no commit)

**Files:**
- Modify: `src/modules/saved-jobs/saved-jobs.service.ts` (find via glob `src/modules/saved-jobs/*`)
- Modify: `src/modules/saved-jobs/saved-jobs.controller.ts`
- Test: `src/tests/saved-jobs.test.ts` (create)

**Interfaces:**
- Consumes: existing `create`/`list`/`remove` methods in saved-jobs service
- Produces: `saveJobForUser` throwing `{ status: 409 }` or a named error caught by controller

- [ ] **Step 1: Read the existing saved-jobs module**

Run: `cat src/modules/saved-jobs/saved-jobs.service.ts && cat src/modules/saved-jobs/saved-jobs.controller.ts`

- [ ] **Step 2: Write the failing test**

Append to `src/tests/saved-jobs.test.ts` (or create, mirroring the registered-user pattern in `src/tests/notifications.test.ts`):

```ts
describe('POST /api/saved-jobs duplicate', () => {
  it('returns 409 when saving the same job twice', async () => {
    const { token } = await registerTestUser()
    const job = await createTestJob()

    await api.post('/api/saved-jobs').send({ jobId: job.id }).set('Authorization', `Bearer ${token}`).expect(201)
    const dup = await api.post('/api/saved-jobs').send({ jobId: job.id }).set('Authorization', `Bearer ${token}`)
    expect(dup.status).toBe(409)
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- saved-jobs`
Expected: FAIL — duplicate save returns 500.

- [ ] **Step 4: Make the service throw a 409 on unique violation**

In `saveJobForUser`, catch the Prisma unique-constraint error (code `P2002`) and rethrow a domain error the controller maps to 409. Example:

```ts
import { Prisma } from '@prisma/client'

async saveJobForUser(userId: string, jobId: string) {
  try {
    return await this.prisma.savedJob.create({ data: { userId, jobId } })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const error = new Error('Job already saved') as Error & { status?: number }
      error.status = 409
      throw error
    }
    throw err
  }
}
```

- [ ] **Step 5: Map the 409 in the controller/error middleware**

Verify the central error handler (e.g. `src/lib/errorHandler`) uses `err.status` if present; if not, extend it so `status`-carrying errors respond with that status instead of 500.

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- saved-jobs`
Expected: PASS

- [ ] **Step 7: Full backend gate (no commit)**

Run: `npm test && npm run build`
Expected: all pass. Do NOT commit backend changes.

---

### Task 2: Frontend guards against double-save

**Files:**
- Modify: `src/context/SavedJobsContext.tsx:52-70`
- Modify: `src/components/jobs/SaveButton.tsx:17-32`

**Interfaces:**
- Consumes: `optimisticSavedIds`/`isSaved` from `useApp()`
- Produces: `toggleSaveJob` early-returns when the job is already saved or already being saved

- [ ] **Step 1: Write the failing test**

Create `src/context/__tests__/SavedJobsContext.test.tsx`:

```tsx
import { renderHook, act, waitFor } from '@testing-library/react'
import { SavedJobsProvider, useSavedJobs } from '../SavedJobsContext'

jest.mock('../../api/savedJobs', () => ({
  listSavedJobs: jest.fn().mockResolvedValue({ data: [] }),
  saveJob: jest.fn().mockResolvedValue({ data: {} }),
  removeSavedJob: jest.fn().mockResolvedValue({ data: {} }),
}))

describe('SavedJobsContext', () => {
  it('does not double-add the same job id', async () => {
    const { result } = renderHook(() => useSavedJobs(), { wrapper: SavedJobsProvider })

    await act(async () => {
      result.current.toggleSaveJob('job-1')
    })
    await waitFor(() => expect(result.current.savedJobIds).toContain('job-1'))

    await act(async () => {
      result.current.toggleSaveJob('job-1')
    })
    // optimistic state already contains job-1, so second call should remove it (toggle semantics)
    expect(result.current.savedJobIds).not.toContain('job-1')
  })
})
```

- [ ] **Step 2: Run test to verify it fails/passes to establish baseline**

Run: `npm run test:run -- src/context/__tests__/SavedJobsContext.test.tsx`
Note: because `toggleSaveJob` is toggle-semantics, this may pass today. The real gap is `SaveButton` racing; continue to Task 2 steps 3-5.

- [ ] **Step 3: Harden toggleSaveJob against double-fire**

In `SavedJobsContext.tsx`, guard against a race where `saveJob` fires twice for the same id before state settles. Introduce a pending set:

```tsx
const [pendingIds, setPendingIds] = useState<string[]>([])

const toggleSaveJob = useCallback(async (jobId: string) => {
  if (pendingIds.includes(jobId)) return
  const isCurrentlySaved = optimisticSavedIds.includes(jobId)
  setPendingIds((prev) => [...prev, jobId])
  setOptimisticSavedIds({ jobId, action: isCurrentlySaved ? 'remove' : 'add' })
  try {
    if (isCurrentlySaved) {
      await removeSavedJob(jobId)
      setSavedJobIds((prev) => prev.filter((id) => id !== jobId))
    } else {
      await saveJob(jobId)
      setSavedJobIds((prev) => (prev.includes(jobId) ? prev : [...prev, jobId]))
    }
  } catch {
    setSavedJobIds((prev) => (isCurrentlySaved ? [...prev, jobId] : prev.filter((id) => id !== jobId)))
  } finally {
    setPendingIds((prev) => prev.filter((id) => id !== jobId))
  }
}, [pendingIds, optimisticSavedIds, setOptimisticSavedIds])
```

- [ ] **Step 4: Add test asserting the pending guard**

```tsx
it('ignores a second toggle while the first is in flight', async () => {
  let resolveFirst!: () => void
  ;(saveJob as jest.Mock).mockImplementationOnce(
    () => new Promise((res) => { resolveFirst = () => res({ data: {} }) }),
  )

  const { result } = renderHook(() => useSavedJobs(), { wrapper: SavedJobsProvider })
  await act(async () => { result.current.toggleSaveJob('job-1') }) // starts, hangs
  await act(async () => { result.current.toggleSaveJob('job-1') }) // should no-op
  await act(async () => { resolveFirst() })

  await waitFor(() => expect(result.current.savedJobIds).toEqual(['job-1']))
  expect(saveJob).toHaveBeenCalledTimes(1)
})
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test:run -- src/context/__tests__/SavedJobsContext.test.tsx`
Expected: PASS

- [ ] **Step 6: Full frontend gate**

Run: `npm run test:run && npm run build && npm run lint`
Expected: all pass

- [ ] **Step 7: Commit (frontend only)**

```bash
git add src/context/SavedJobsContext.tsx src/context/__tests__/SavedJobsContext.test.tsx
git commit -m "fix(saved-jobs): guard against duplicate saves"
```

---

## Validation and Acceptance

1. Backend returns 409 (not 500) when the same user saves the same job twice
2. Frontend never fires a duplicate `saveJob` for an in-flight save
3. Saved-jobs list still updates optimistically and survives a failed save
4. Frontend gates pass; backend gate passes but backend is not committed
