# WS3: File Upload State Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the selected file (and its name/size) when a user uploads during onboarding or apply flow — surviving step navigation and re-opening the modal, and pre-filling from the already-uploaded resume when present.

**Architecture:** In `SeekerResumeStep`, initialize the local `file` state from `user.resumeFileName` so returning users see their existing resume; in `ApplyJobForm`, when the user already has a `resumePath`/`resumeFileName`, skip the upload control (per backlog: "once the user has uploaded a resume already there is no need to show that"). Lifting file state up in the apply modal is unnecessary if the form already reads from context.

**Tech Stack:** React 19, React Hook Form, existing `apiUpload`/`updateProfile` API.

## Global Constraints

- Follow HireHub DESIGN.md conventions
- Existing dependencies only — no new npm packages
- Run `npm run test:run`, `npm run build`, `npm run lint` after each task

---

### Task 1: SeekerResumeStep shows existing resume as already uploaded

**Files:**
- Modify: `src/components/onboarding/SeekerResumeStep.tsx:14-30, 70-112`

**Interfaces:**
- Consumes: `useApp().user` (`resumeFileName`, `resumePath`)
- Produces: A `file` state seeded from existing resume; upload control renders "Resume already uploaded" state

- [ ] **Step 1: Write the failing test**

Create `src/components/onboarding/__tests__/SeekerResumeStep.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { SeekerResumeStep } from '../SeekerResumeStep'

jest.mock('../../../context/AppContext', () => ({
  useApp: () => ({
    user: { resumeFileName: 'sarah-cv.pdf', resumePath: '/uploads/sarah-cv.pdf' },
    setUser: jest.fn(),
  }),
}))

jest.mock('../../../api/auth', () => ({ updateProfile: jest.fn() }))
jest.mock('../../../api/client', () => ({ apiUpload: jest.fn() }))

describe('SeekerResumeStep', () => {
  it('shows the existing resume file name', () => {
    render(<SeekerResumeStep onSaved={jest.fn()} />)
    expect(screen.getByText('sarah-cv.pdf')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/components/onboarding/__tests__/SeekerResumeStep.test.tsx`
Expected: FAIL — file state is empty so no file name renders.

- [ ] **Step 3: Seed state from existing resume**

```tsx
const { user } = useApp()
const [file, setFile] = useState<File | null>(null)
const [existingResume] = useState(() => user?.resumeFileName ?? null)
```

Then render the existing-resume pill when `existingResume` is set and no new `file` is chosen:

```tsx
{file ? (
  /* existing chosen-file block unchanged */
) : existingResume ? (
  <div className="flex items-center justify-between gap-3 p-3 rounded-md border border-hairline bg-surface-1">
    <div className="flex items-center gap-3 min-w-0">
      <FileText className="w-5 h-5 text-accent shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink truncate">{existingResume}</p>
        <p className="text-xs text-ink-muted">Resume already uploaded — choose a new file to replace it.</p>
      </div>
    </div>
  </div>
) : (
  /* existing dropzone block unchanged */
)}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/components/onboarding/__tests__/SeekerResumeStep.test.tsx`
Expected: PASS

- [ ] **Step 5: Full gate**

Run: `npm run test:run && npm run build && npm run lint`
Expected: all pass

- [ ] **Step 6: Commit**

```bash
git add src/components/onboarding/SeekerResumeStep.tsx src/components/onboarding/__tests__/SeekerResumeStep.test.tsx
git commit -m "feat(onboarding): persist and show existing resume upload state"
```

---

### Task 2: ApplyJobForm skips resume upload when user already has one

**Files:**
- Modify: `src/components/apply/ApplyJobForm.tsx` (find via glob `src/components/apply/*`)

**Interfaces:**
- Consumes: `useApp().user` (`resumePath`, `resumeFileName`)
- Produces: Hidden/disabled resume field + note when `user.resumePath` exists

- [ ] **Step 1: Read the current ApplyJobForm**

Run: `cat src/components/apply/ApplyJobForm.tsx`

- [ ] **Step 2: Write the failing test**

Create `src/components/apply/__tests__/ApplyJobForm.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { ApplyJobForm } from '../ApplyJobForm'

jest.mock('../../../context/AppContext', () => ({
  useApp: () => ({
    user: { resumePath: '/uploads/sarah-cv.pdf', resumeFileName: 'sarah-cv.pdf' },
  }),
}))

describe('ApplyJobForm with existing resume', () => {
  it('does not render a file input when user already uploaded a resume', () => {
    render(<ApplyJobForm job={{} as never} onSuccess={jest.fn()} />)
    expect(screen.queryByLabelText(/resume/i)).not.toBeInTheDocument()
    expect(screen.getByText(/sarah-cv\.pdf/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test:run -- src/components/apply/__tests__/ApplyJobForm.test.tsx`
Expected: FAIL — file input still renders.

- [ ] **Step 4: Gate the resume field on user.resumePath**

Wrap the file input (and its label) so it only renders when `!user?.resumePath`. When a resume exists, render an informational line with the file name and pass `user.resumePath`/`user.resumeFileName` into the application payload so no re-upload is required.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test:run -- src/components/apply/__tests__/ApplyJobForm.test.tsx`
Expected: PASS

- [ ] **Step 6: Full gate**

Run: `npm run test:run && npm run build && npm run lint`
Expected: all pass

- [ ] **Step 7: Commit**

```bash
git add src/components/apply/ApplyJobForm.tsx src/components/apply/__tests__/ApplyJobForm.test.tsx
git commit -m "feat(apply): reuse existing resume instead of re-uploading"
```

---

## Validation and Acceptance

1. Returning users see their uploaded resume name in the onboarding resume step
2. Users with a resume on file don't see a resume upload field in the apply modal
3. Applying without a resume still allows skipping; replacing a resume works
4. All frontend gates pass
