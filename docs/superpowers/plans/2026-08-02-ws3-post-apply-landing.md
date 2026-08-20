# WS3: Post-Apply Landing + Cover-Letter-Only Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After a successful application, show a landing experience that routes the user onward — create an account (unauthenticated) or go to the dashboard (authenticated). And for authenticated users applying to a subsequent job, only show the cover letter (in the modal) — not name/email/resume they've already provided.

**Backlog refs:** `changes.md` line 5 (post-apply landing) + line 13 (cover-letter-only modal).

**Architecture:** `ApplyJobModal` currently always renders the full `ApplyJobForm` (name, email, cover letter, resume) then `ApplySuccess` inside the modal. Two behaviors to add:
1. **Post-apply landing:** replace the inline `ApplySuccess` with a richer `ApplyLanding` component rendered *inside* the modal (stays a modal per backlog "still as a modal"). If `user` is null → show "Create an account to track your applications" (link to `/signup`) + "Browse more jobs" (`/jobs`); if authenticated → "Go to dashboard" (`/dashboard`).
2. **Cover-letter-only modal:** when the current user is authenticated AND has a resume on file (`user.resumeFileName`/`resumePath`), the apply form collapses to just the cover letter. Name/email come from `user`; resume upload is skipped entirely.

**Tech Stack:** React 19, Radix Dialog (existing pattern in `ApplyJobModal.tsx`), `react-hook-form` + zod schema (existing).

## Global Constraints

- Keep the existing `ApplyJobForm` public surface usable; add the cover-letter-only mode via an internal switch, not a second form component
- No new npm packages
- DESIGN.md conventions: tokens, no `cn()`/`clsx()`, focus-visible rings
- Backend NOT touched in this plan (no backend changes)
- Run frontend `npm run test:run`, `npm run build`, `npm run lint`
- Follow the vi.mock + MemoryRouter + ToastProvider pattern from existing tests (see `src/components/jobs/__tests__/*`)

---

### Task 1: Cover-letter-only mode in ApplyJobForm

**Files:**
- Modify: `src/components/apply/ApplyJobForm.tsx`
- Modify: `src/components/apply/ApplyJobModal.tsx` (pass the flag)
- Test: `src/components/apply/__tests__/ApplyJobForm.test.tsx` (create if missing)

**Interfaces:**
- Consumes: `useApp().user`
- Produces: when authenticated + has resume, renders only the cover letter field and uses `user.name`/`user.email` as the applicant

- [ ] **Step 1: Read the current ApplyJobForm + check for an existing test**

Run: `cat src/components/apply/ApplyJobForm.tsx` and `ls src/components/apply/__tests__/`

- [ ] **Step 2: Write the failing test**

Create `src/components/apply/__tests__/ApplyJobForm.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApplyJobForm } from '../ApplyJobForm'
import type { Job } from '../../../data/jobs'

const job: Job = {
  id: 'job-1', title: 'Frontend Dev', company: 'Acme', companyLogo: '', location: 'Remote',
  remote: true, salaryMin: 1, salaryMax: 2, currency: 'USD', tags: [], category: 'Engineering',
  seniority: 'mid', description: 'x', requirements: [], responsibilities: [], postedDate: '2026-01-01', featured: false,
}

describe('ApplyJobForm cover-letter-only mode', () => {
  it('hides name/email/resume fields when the user has a resume on file', async () => {
    vi.mock('../../../context/AppContext', () => ({
      useApp: () => ({
        user: { id: 'u1', name: 'Jane', email: 'jane@x.com', resumePath: 'r.pdf', resumeFileName: 'r.pdf', role: 'seeker' },
        addApplication: vi.fn(),
      }),
    }))

    render(<ApplyJobForm job={job} onSuccess={vi.fn()} />)

    expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/upload resume/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/cover letter/i)).toBeInTheDocument()
  })

  it('shows the full form when unauthenticated', () => {
    vi.mock('../../../context/AppContext', () => ({ useApp: () => ({ user: null, addApplication: vi.fn() }) }))
    render(<ApplyJobForm job={job} onSuccess={vi.fn()} />)
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/cover letter/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test:run -- src/components/apply/__tests__/ApplyJobForm.test.tsx`
Expected: FAIL — fields still render in both cases.

- [ ] **Step 4: Implement cover-letter-only mode**

```tsx
const hasResume = Boolean(user?.resumeFileName || user?.resumePath)
const coverOnly = Boolean(user && hasResume)
```

- When `coverOnly`, do NOT render the `fullName`/`email`/`resume` fields; default `fullName: user?.name ?? ''`, `email: user?.email ?? ''` already come from `user` (existing defaultValues).
- `onSubmit` stays the same — it already reads `data.fullName`/`data.email` and passes `resumePath`/`resumeFileName` only when a file was uploaded; for cover-only, `resumeFile` is null so no upload happens, matching "no need to show that".
- Keep the schema validation — name/email still resolve from defaults (non-empty for a logged-in user).

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test:run -- src/components/apply/__tests__/ApplyJobForm.test.tsx`
Expected: PASS

- [ ] **Step 6: Full gate**

Run: `npm run test:run && npm run build && npm run lint`
Expected: all pass

- [ ] **Step 7: Commit**

```bash
git add src/components/apply/ApplyJobForm.tsx src/components/apply/__tests__/ApplyJobForm.test.tsx
git commit -m "feat(apply): cover-letter-only apply for returning seekers"
```

---

### Task 2: Post-apply landing experience

**Files:**
- Create: `src/components/apply/ApplyLanding.tsx`
- Modify: `src/components/apply/ApplyJobModal.tsx` (render `ApplyLanding` instead of `ApplySuccess`)
- Test: `src/components/apply/__tests__/ApplyLanding.test.tsx` (create)

**Interfaces:**
- Consumes: `job`, `resumeFileName?`, `useApp().user`
- Produces: success header + role-appropriate CTAs (Create account / Browse jobs, or Go to dashboard)

- [ ] **Step 1: Write the failing test**

Create `src/components/apply/__tests__/ApplyLanding.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ApplyLanding } from '../ApplyLanding'
import type { Job } from '../../../data/jobs'

const job: Job = { id: 'job-1', title: 'Frontend Dev', company: 'Acme', companyLogo: '', location: 'Remote', remote: true, salaryMin: 1, salaryMax: 2, currency: 'USD', tags: [], category: 'Engineering', seniority: 'mid', description: 'x', requirements: [], responsibilities: [], postedDate: '2026-01-01', featured: false }

describe('ApplyLanding', () => {
  it('shows account-creation CTAs for unauthenticated users', () => {
    render(
      <MemoryRouter>
        <ApplyLanding job={job} user={null} />
      </MemoryRouter>,
    )
    expect(screen.getByText(/create an account/i)).toBeInTheDocument()
    expect(screen.getByText(/browse more jobs/i)).toBeInTheDocument()
  })

  it('shows a go-to-dashboard CTA for authenticated users', () => {
    render(
      <MemoryRouter>
        <ApplyLanding job={job} user={{ id: 'u1', name: 'Jane', email: 'j@x.com', role: 'seeker' } as never} />
      </MemoryRouter>,
    )
    expect(screen.getByText(/go to dashboard/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/components/apply/__tests__/ApplyLanding.test.tsx`
Expected: FAIL — component doesn't exist.

- [ ] **Step 3: Implement ApplyLanding**

Reuse the `ApplySuccess` visual language (CheckCircle, background image `/apply-success-bg.png`). Props: `{ job: Job; user: AppUser | null; resumeFileName?: string }`. CTAs:

```tsx
{user ? (
  <Link to="/dashboard"><Button variant="accent" size="lg">Go to dashboard</Button></Link>
) : (
  <div className="flex flex-col sm:flex-row gap-3">
    <Link to="/signup"><Button variant="accent" size="lg">Create an account</Button></Link>
    <Link to="/jobs"><Button variant="primary" size="lg">Browse more jobs</Button></Link>
  </div>
)}
```

Note: an authenticated seeker who just applied can also "Browse more jobs" — keep it as a secondary text link for authenticated users for parity.

- [ ] **Step 4: Swap ApplySuccess → ApplyLanding in ApplyJobModal**

Replace the `<ApplySuccess … />` branch with `<ApplyLanding job={job} user={user} resumeFileName={resumeFileName} />`. Keep the existing success/reset state flow. Update the `ApplySuccess` import (remove if unused) and import `useApp`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test:run -- src/components/apply/__tests__/ApplyLanding.test.tsx`
Expected: PASS

- [ ] **Step 6: Full gate**

Run: `npm run test:run && npm run build && npm run lint`
Expected: all pass

- [ ] **Step 7: Commit**

```bash
git add src/components/apply/ApplyLanding.tsx src/components/apply/ApplyJobModal.tsx src/components/apply/__tests__/ApplyLanding.test.tsx
git commit -m "feat(apply): post-apply landing with account or dashboard CTA"
```

---

## Validation and Acceptance

1. Unauthenticated user applying: after submit sees "Create an account" + "Browse more jobs"
2. Authenticated user applying: after submit sees "Go to dashboard" (+ secondary browse link)
3. Authenticated user with a resume on file sees ONLY the cover letter field in the apply modal
4. Unauthenticated users still see the full form (name, email, cover letter, resume)
5. Existing applications still post with correct applicant identity
6. All frontend gates pass
