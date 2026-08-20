# WS3: Job 7-Day Expiry + Import Prompt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give jobs a 7-day expiry with a fire-and-forget protocol, and provide a reusable import prompt so the user can feed job listings (JSON or MD) into the app for easy parsing/importing.

**Backlog ref:** `changes.md` line 83 — "let's block the user from saving the same job twice and i want to create a fire-forget protocol towards the jobs having a expiry date of 7 days and i also want a prompt that could be used in my case to get entries of jobs formatted so as to make parsing easier when i import them over as json or md."

**Architecture:** The `Job` model (`prisma/schema.prisma`) has no expiry field. Add `expiresAt DateTime?` set to `now() + 7 days` at creation. Use a **fire-and-forget** protocol: a lightweight scheduled cleanup (interval) that marks jobs expired — it never blocks request handling. Listing endpoints hide expired jobs (unless a `includeExpired` flag is used by the owner). The import prompt lives as a documented prompt (JSON/MD templates) the user can copy into an LLM to produce parseable job entries, plus a companion `src/data/import-template.md` and a small "copy prompt" affordance in `PostJobForm` so the flow is discoverable.

**Tech Stack:** Express, Prisma, React 19, existing `createJob` API.

## Global Constraints

- Backend changes are NOT committed (repo policy) — only frontend commits
- Run frontend `npm run test:run`, `npm run build`, `npm run lint`; backend `npm test`, `npm run build`
- Follow existing module structure: controller → service in `src/modules/*`
- No new npm packages (no cron lib — use `setInterval`)
- DESIGN.md conventions: tokens, no `cn()`/`clsx()`
- Do not break existing job-list consumers (guest list, saved jobs, applications)

---

### Task 1: Backend — add `expiresAt` to the Job model (no commit)

**Files:**
- Modify: `prisma/schema.prisma`
- Migration: `npx prisma migrate dev --name job_expiry`
- Modify: `src/modules/jobs/jobs.service.ts`
- Modify: `src/modules/jobs/jobs.repository.ts` (if needed for where filters)
- Modify: `src/modules/jobs/jobs.routes.ts` (optional `includeExpired` for owner)
- Test: `src/tests/jobs-expiry.test.ts` (create)

**Interfaces:**
- Consumes: existing `create`, `list`, `getById`, `listByEmployer`
- Produces: `expiresAt` field; `list` filters `expiresAt > now` by default; `listByEmployer`/`getById` for owner may include expired

- [ ] **Step 1: Add the field to the schema**

In `model Job`:

```prisma
expiresAt  DateTime?
```

- [ ] **Step 2: Run migration**

Run: `npx prisma migrate dev --name job_expiry`
Expected: migration applies; `npm run build` (or `npx tsc`) passes.

- [ ] **Step 3: Write the failing test**

Create `src/tests/jobs-expiry.test.ts` mirroring the registered-user pattern from `src/tests/jobs.test.ts`:

```ts
describe('Job expiry', () => {
  it('creates a job with expiresAt ~7 days out', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({ title: 'Expiry Test', company: 'X', location: 'Remote', remote: true, category: 'Engineering', seniority: 'Mid', description: 'd', requirements: [], responsibilities: [] })
      .expect(201)

    const created = res.body.data
    expect(created.expiresAt).toBeTruthy()
    const delta = new Date(created.expiresAt).getTime() - new Date(created.postedDate ?? Date.now()).getTime()
    expect(Math.round(delta / 86400000)).toBe(7)
  })
})
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test -- jobs-expiry`
Expected: FAIL — `expiresAt` is undefined.

- [ ] **Step 5: Set expiresAt on create**

In `jobs.service.ts` `create()`:

```ts
async create(data: Omit<Prisma.JobCreateInput, 'employer'>, employerId: string) {
  return this.repo.create({
    ...data,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    employer: { connect: { id: employerId } },
  })
}
```

- [ ] **Step 6: Filter expired jobs from public listing**

In `list()` (both the normal branch and `searchWithTsQuery`), add `expiresAt: { gt: new Date() }` to the `where`/SQL. For `searchWithTsQuery`, add the same predicate to the `WHERE` clause. Keep `getById` returning the job (detail page may show "This job has expired" — see frontend task), but add `includeExpired` support via `jobs.routes.ts` so `listByEmployer` and admin can still see all.

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm test -- jobs-expiry && npm test`
Expected: PASS (existing jobs tests still green).

- [ ] **Step 8: Fire-and-forget cleanup (no commit)**

Add a `startExpirySweep()` util in the jobs module (called from `src/app/app.ts` on boot, after DB connect). A module-scoped `setInterval` every 24h that marks expired jobs — implement as a soft-hide by nulling/flagging, OR no-op given listing already filters `expiresAt`. Simplest correct behavior: the sweep is a no-op placeholder that just deletes nothing and logs; the listing filter is the real enforcement. Use `unref()` if the interval handle supports it (Node timers do) so it never keeps the process alive.

- [ ] **Step 9: Full backend gate**

Run: `npm test && npm run build`
Expected: all pass

---

### Task 2: Frontend — Job type + expired badge

**Files:**
- Modify: `src/data/jobs.ts` (add `expiresAt?: string`)
- Modify: `src/api/types.ts` (re-export updated `Job`)
- Modify: `src/components/jobs/JobDetailPage.tsx` (expired banner)
- Test: `src/components/jobs/__tests__/JobDetailPage.test.tsx` (extend or create)

**Interfaces:**
- Consumes: `Job` type with `expiresAt`
- Produces: an "expired" banner + disabled Apply button when `expiresAt < now`

- [ ] **Step 1: Write the failing test**

Extend the existing `JobDetailPage` test (find it via glob `src/components/jobs/__tests__/*`):

```tsx
it('shows an expired banner when the job is past expiry', () => {
  const expiredJob = { ...job, expiresAt: '2020-01-01T00:00:00.000Z' }
  render(<JobDetailPage job={expiredJob} />)
  expect(screen.getByText(/this job has expired/i)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /apply now/i })).not.toBeInTheDocument()
})
```

(Adjust to the component's actual props/API — read the test first.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/components/jobs/__tests__/JobDetailPage.test.tsx`
Expected: FAIL — no expired handling.

- [ ] **Step 3: Implement the expired state**

In `JobDetailPage.tsx`:

```tsx
const expired = job.expiresAt ? new Date(job.expiresAt).getTime() < Date.now() : false
```

Render a banner when `expired` (e.g. `bg-accent/5 border border-accent/30 rounded-lg p-4 text-sm`) and hide/replace the Apply button with a disabled button or a message. `CompanySidebar` receives `job` — gate its "Apply Now" button off the same check (pass `expired` prop or compute inside from `job.expiresAt`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/components/jobs/__tests__/JobDetailPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Full gate**

Run: `npm run test:run && npm run build && npm run lint`
Expected: all pass

- [ ] **Step 6: Commit**

```bash
git add src/data/jobs.ts src/api/types.ts src/components/jobs/JobDetailPage.tsx src/components/jobs/CompanySidebar.tsx src/components/jobs/__tests__/JobDetailPage.test.tsx
git commit -m "feat(jobs): show expired state on job listings"
```

---

### Task 3: Frontend — import prompt + copy affordance

**Files:**
- Create: `src/data/import-template.md` (the reusable import prompt)
- Create: `src/components/post-job/ImportPromptButton.tsx` (copy-to-clipboard)
- Modify: `src/components/post-job/PostJobForm.tsx` (render the button)
- Test: `src/components/post-job/__tests__/ImportPromptButton.test.tsx` (create)

**Interfaces:**
- Consumes: none external
- Produces: a copyable prompt the user pastes into an LLM to get job entries as JSON/MD that `createJob` can parse

- [ ] **Step 1: Write the import template**

`src/data/import-template.md` — a prompt with two output modes:

````md
# HireHub Job Import Prompt

You are a job-listings parser. Given job descriptions, output entries that match the HireHub job schema exactly.

## JSON mode
Return a JSON array of objects with these fields only:
- title (string)
- company (string)
- location (string)
- remote (boolean)
- salaryMin (number, optional)
- salaryMax (number, optional)
- currency (string, default "USD")
- category (string: Engineering | Design | Marketing | Sales | Operations | Product | Support)
- seniority (string: Junior | Mid | Senior | Lead | Executive)
- tags (string[] — 3-6 short keywords)
- description (string — 1-3 paragraphs)
- requirements (string[] — 4-6 items)
- responsibilities (string[] — 4-6 items)

## Markdown mode
Output each job as:

### <Job Title>
- **Company:** <Company>
- **Location:** <Location> | Remote: yes/no
- **Salary:** $min–$max (USD)
- **Category:** <Category>
- **Seniority:** <Seniority>
- **Tags:** tag1, tag2, tag3
**Description**
<1-3 paragraphs>
**Requirements**
- item
- item
**Responsibilities**
- item
- item

Do not invent fields. Preserve the original facts. Skip listings with no title or company.
````

- [ ] **Step 2: Write the failing test**

Create `src/components/post-job/__tests__/ImportPromptButton.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImportPromptButton } from '../ImportPromptButton'

describe('ImportPromptButton', () => {
  it('copies the import prompt to the clipboard', async () => {
    const writeText = vi.fn(() => Promise.resolve())
    Object.assign(navigator, { clipboard: { writeText } })

    const user = userEvent.setup()
    render(<ImportPromptButton />)

    await user.click(screen.getByRole('button', { name: /import prompt/i }))
    expect(writeText).toHaveBeenCalled()
    expect(writeText.mock.calls[0][0]).toContain('HireHub Job Import Prompt')
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test:run -- src/components/post-job/__tests__/ImportPromptButton.test.tsx`
Expected: FAIL — component doesn't exist.

- [ ] **Step 4: Implement ImportPromptButton**

Inline the template as a string constant (or fetch from `src/data/import-template.md` via Vite `?raw` import). Button:

```tsx
import template from '../../data/import-template.md?raw'

export function ImportPromptButton() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(template)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard unavailable */ }
  }
  return (
    <button type="button" onClick={copy} className="...focus-visible:ring-2 focus-visible:ring-ink/30...">
      {copied ? 'Copied!' : 'Copy import prompt'}
    </button>
  )
}
```

- [ ] **Step 5: Wire into PostJobForm**

Render `<ImportPromptButton />` near the submit button (e.g. above it), styled as a secondary text action. Read `PostJobForm.tsx` first to place it consistently.

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm run test:run -- src/components/post-job/__tests__/ImportPromptButton.test.tsx`
Expected: PASS

- [ ] **Step 7: Full gate**

Run: `npm run test:run && npm run build && npm run lint`
Expected: all pass

- [ ] **Step 8: Commit**

```bash
git add src/data/import-template.md src/components/post-job/ImportPromptButton.tsx src/components/post-job/PostJobForm.tsx src/components/post-job/__tests__/ImportPromptButton.test.tsx
git commit -m "feat(post-job): job import prompt with copy button"
```

---

## Validation and Acceptance

1. New jobs get `expiresAt` ~7 days after posting (backend test)
2. Public job listing hides expired jobs; owner/admin listing still shows all
3. Job detail page shows an expired banner and disables Apply for expired jobs
4. `ImportPromptButton` copies the JSON/MD import template to the clipboard
5. All frontend gates pass; backend tests + build pass
6. Backend changes remain uncommitted
