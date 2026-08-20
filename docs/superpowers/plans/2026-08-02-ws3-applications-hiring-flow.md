# WS3: Applications View Job + Candidate Hiring Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "View Job" button to each application card and a "Hiring Flow" button that shows the candidate the hiring stages with reassuring, data-backed messaging at each stage.

**Architecture:** `ApplicationCard.tsx` gains a footer with two actions: "View Job" (navigates to `/jobs/:jobId`) and "Hiring Flow" (opens a modal/drawer listing the hiring stages — Applied → Reviewing → Interviewing → Offer — with the candidate's current status highlighted, the interview details/offer details when present, and reassurance copy like "We'll update you here at every step"). A new `HiringFlowModal` component renders the stages. The stage source of truth is `application.status` plus `interviewDetails`/`offerDetails` already in the Application type.

**Tech Stack:** React 19, React Router 7, Tailwind CSS 3, Radix UI Dialog (already used in ApplyJobModal), Framer Motion, Lucide React.

## Global Constraints

- Follow HireHub DESIGN.md conventions: tokens via Tailwind, no `cn()`/`clsx()`, string concat ternaries
- Focus-visible rings on all interactive elements
- Button `type` defaults to `'button'`
- No box-shadow on cards — `border border-hairline`
- Existing dependencies only — no new npm packages
- Run `npm run test:run`, `npm run build`, `npm run lint` after each task

---

### Task 1: Add "View Job" button to ApplicationCard

**Files:**
- Modify: `src/components/dashboard/ApplicationCard.tsx`
- Test: `src/components/dashboard/__tests__/ApplicationCard.test.tsx` (create)

**Interfaces:**
- Consumes: `application.jobId`, `application.status` from the `Application` type
- Produces: `ApplicationCard` renders a footer with a `Link` to `/jobs/{jobId}` labeled "View Job"

- [ ] **Step 1: Read the Application type**

Run: `cat src/types/application.ts`

- [ ] **Step 2: Write the failing test**

Create `src/components/dashboard/__tests__/ApplicationCard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ApplicationCard } from '../ApplicationCard'

const app = {
  id: 'app-1',
  jobId: 'job-1',
  jobTitle: 'Frontend Engineer',
  company: 'Acme',
  companyLogo: '',
  status: 'reviewing',
  submittedAt: '2026-07-01T00:00:00Z',
  interviewDetails: null,
  offerDetails: null,
  preBoardingChecklist: null,
  orientationDetails: null,
} as never

describe('ApplicationCard', () => {
  it('renders a View Job button linking to the job detail page', () => {
    render(
      <MemoryRouter>
        <ApplicationCard application={app} />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /View Job/i })
    expect(link).toHaveAttribute('href', '/jobs/job-1')
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test:run -- src/components/dashboard/__tests__/ApplicationCard.test.tsx`
Expected: FAIL — no "View Job" link.

- [ ] **Step 4: Add the footer actions row**

At the bottom of the card (after the status-specific blocks), add:

```tsx
<div className="mt-4 pt-4 border-t border-hairline flex items-center gap-2">
  <Link
    to={`/jobs/${application.jobId}`}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-accent hover:text-accent/80 hover:bg-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 transition-colors"
  >
    <ExternalLink className="w-4 h-4" aria-hidden="true" />
    View Job
  </Link>
</div>
```

Import `ExternalLink` from `lucide-react` and `Link` from `react-router-dom`.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test:run -- src/components/dashboard/__tests__/ApplicationCard.test.tsx`
Expected: PASS

- [ ] **Step 6: Full gate**

Run: `npm run test:run && npm run build && npm run lint`
Expected: all pass

- [ ] **Step 7: Commit**

```bash
git add src/components/dashboard/ApplicationCard.tsx src/components/dashboard/__tests__/ApplicationCard.test.tsx
git commit -m "feat(applications): add View Job link to application cards"
```

---

### Task 2: Create HiringFlowModal

**Files:**
- Create: `src/components/dashboard/HiringFlowModal.tsx`
- Test: `src/components/dashboard/__tests__/HiringFlowModal.test.tsx`

**Interfaces:**
- Consumes: `Application` type, Radix `Dialog`, `useReducedMotion`
- Produces: Exported `HiringFlowModal({ application, open, onOpenChange })` showing a vertical stage timeline

- [ ] **Step 1: Define the stage model**

Create `src/components/dashboard/HiringFlowModal.tsx`:

```tsx
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Check, Clock, Calendar, FileText } from 'lucide-react'
import type { Application, ApplicationStatus } from '../../types/application'

const STAGES: { key: ApplicationStatus; label: string; description: string }[] = [
  { key: 'applied', label: 'Applied', description: 'Your application has been received by the employer.' },
  { key: 'reviewing', label: 'Under Review', description: 'The hiring team is reviewing your profile and resume.' },
  { key: 'interviewing', label: 'Interviewing', description: 'Selected candidates move on to interviews.' },
  { key: 'offer', label: 'Offer', description: 'The employer has extended an offer.' },
]

const STATUS_ORDER: Record<ApplicationStatus, number> = {
  applied: 0,
  reviewing: 1,
  interviewing: 2,
  rejected: 2,
  offer: 3,
}

interface HiringFlowModalProps {
  application: Application
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HiringFlowModal({ application, open, onOpenChange }: HiringFlowModalProps) {
  const currentIdx = STATUS_ORDER[application.status] ?? 0

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 bg-black/50 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-surface-1 rounded-xl p-6 w-full max-w-lg shadow-xl border border-hairline max-h-[85vh] overflow-y-auto"
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.96 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title className="text-lg font-semibold text-ink">
                      Hiring Flow — {application.jobTitle}
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button
                        className="p-1 rounded-md text-ink-tertiary hover:text-ink hover:bg-surface-2 transition-colors"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <p className="text-sm text-ink-muted mb-6">
                    We’ll keep you updated here at every stage of the process. No chasing required.
                  </p>

                  <ol className="space-y-0">
                    {STAGES.map((stage, i) => {
                      const isReached = i <= currentIdx
                      const isCurrent = i === currentIdx && application.status !== 'rejected'
                      return (
                        <li key={stage.key} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <span
                              className={`flex items-center justify-center w-8 h-8 rounded-full border transition-colors ${
                                isReached
                                  ? 'bg-accent/10 border-accent text-accent'
                                  : 'border-hairline text-ink-tertiary'
                              }`}
                            >
                              {isReached ? <Check className="w-4 h-4" aria-hidden="true" /> : <Clock className="w-4 h-4" aria-hidden="true" />}
                            </span>
                            {i < STAGES.length - 1 && (
                              <span className={`w-px flex-1 min-h-6 ${isReached ? 'bg-accent/30' : 'bg-hairline'}`} />
                            )}
                          </div>
                          <div className="pb-6">
                            <p className={`text-sm font-medium ${isCurrent ? 'text-accent' : isReached ? 'text-ink' : 'text-ink-muted'}`}>
                              {stage.label}
                              {isCurrent && <span className="ml-2 text-xs text-accent">Current</span>}
                            </p>
                            <p className="text-xs text-ink-muted mt-0.5">{stage.description}</p>
                          </div>
                        </li>
                      )
                    })}
                  </ol>

                  {application.status === 'rejected' && (
                    <p className="mt-2 text-sm text-error bg-error/10 px-3 py-2 rounded-md">
                      This application was not advanced. We encourage you to keep applying — new roles are posted weekly.
                    </p>
                  )}

                  {application.status === 'interviewing' && application.interviewDetails && (
                    <div className="mt-2 pt-4 border-t border-hairline">
                      <p className="flex items-center gap-1.5 text-sm font-medium text-ink mb-2">
                        <Calendar className="w-4 h-4 text-accent" aria-hidden="true" /> Upcoming interview
                      </p>
                      <InterviewDetails details={application.interviewDetails} />
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
```

Note: import `InterviewDetails` from `../interview/InterviewDetails` only if the modal should surface interview data; otherwise drop that block.

- [ ] **Step 2: Write the modal test**

Create `src/components/dashboard/__tests__/HiringFlowModal.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { HiringFlowModal } from '../HiringFlowModal'

const app = {
  id: 'app-1',
  jobId: 'job-1',
  jobTitle: 'Frontend Engineer',
  company: 'Acme',
  companyLogo: '',
  status: 'reviewing',
  submittedAt: '2026-07-01T00:00:00Z',
  interviewDetails: null,
  offerDetails: null,
  preBoardingChecklist: null,
  orientationDetails: null,
} as never

describe('HiringFlowModal', () => {
  it('renders all hiring stages', () => {
    render(<HiringFlowModal application={app} open onOpenChange={jest.fn()} />)
    expect(screen.getByText('Applied')).toBeInTheDocument()
    expect(screen.getByText('Under Review')).toBeInTheDocument()
    expect(screen.getByText('Interviewing')).toBeInTheDocument()
    expect(screen.getByText('Offer')).toBeInTheDocument()
  })

  it('marks the current stage', () => {
    render(<HiringFlowModal application={app} open onOpenChange={jest.fn()} />)
    expect(screen.getByText('Current')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run test to verify it passes**

Run: `npm run test:run -- src/components/dashboard/__tests__/HiringFlowModal.test.tsx`
Expected: PASS

- [ ] **Step 4: Full gate**

Run: `npm run test:run && npm run build && npm run lint`
Expected: all pass

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/HiringFlowModal.tsx src/components/dashboard/__tests__/HiringFlowModal.test.tsx
git commit -m "feat(applications): add hiring flow modal with stage reassurance"
```

---

### Task 3: Wire Hiring Flow button into ApplicationCard

**Files:**
- Modify: `src/components/dashboard/ApplicationCard.tsx`
- Modify: `src/components/dashboard/__tests__/ApplicationCard.test.tsx`

**Interfaces:**
- Consumes: `HiringFlowModal` (Task 2)
- Produces: `ApplicationCard` manages `flowOpen` state and renders "Hiring Flow" button + modal

- [ ] **Step 1: Add state and button to ApplicationCard**

```tsx
const [flowOpen, setFlowOpen] = useState(false)
```

In the footer actions row, next to "View Job":

```tsx
<button
  type="button"
  onClick={() => setFlowOpen(true)}
  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-ink hover:text-ink-muted hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 transition-colors"
>
  <Workflow className="w-4 h-4" aria-hidden="true" />
  Hiring Flow
</button>
```

Add at the end of the card:

```tsx
<HiringFlowModal application={application} open={flowOpen} onOpenChange={setFlowOpen} />
```

Import `useState` from react, `Workflow` from `lucide-react`, and `HiringFlowModal`.

- [ ] **Step 2: Extend the test**

```tsx
import userEvent from '@testing-library/user-event'

it('opens the hiring flow modal', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <ApplicationCard application={app} />
    </MemoryRouter>,
  )
  await user.click(screen.getByRole('button', { name: /Hiring Flow/i }))
  expect(screen.getByText(/Hiring Flow — Frontend Engineer/i)).toBeInTheDocument()
})
```

- [ ] **Step 3: Run tests to verify they pass**

Run: `npm run test:run -- src/components/dashboard/__tests__/ApplicationCard.test.tsx`
Expected: PASS

- [ ] **Step 4: Full gate**

Run: `npm run test:run && npm run build && npm run lint`
Expected: all pass

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/ApplicationCard.tsx src/components/dashboard/__tests__/ApplicationCard.test.tsx
git commit -m "feat(applications): open hiring flow modal from application cards"
```

---

## Validation and Acceptance

1. Each application card has a "View Job" link to its job detail page
2. Each application card has a "Hiring Flow" button that opens a stage timeline modal
3. The current stage is highlighted; interview details show when interviewing; rejection shows reassuring copy
4. Modal is accessible (Radix dialog, focus ring, Escape close)
5. All frontend gates pass
