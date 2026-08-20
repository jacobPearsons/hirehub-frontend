# Plan: HireHub Onboarding Wizard — Frontend

Date: 2026-07-31
Spec: `docs/superpowers/specs/2026-07-31-hirehub-onboarding-wizard.md`
Repo: `hirehub-frontend` (React 19.2, Vite 8, TS ~6.0, React Router 7.18,
TanStack Query, RHF 7.81, zod 4.4, Tailwind 3, framer-motion, Vitest 4 + RTL)
Execution: subagent-driven development (fresh implementer per task, review +
commit after each task). Backend plan: `hirehub-backend/docs/superpowers/plans/2026-07-31-onboarding-wizard-backend.md`
(must be merged first — frontend types/API assume the new PATCH fields and the
new company endpoints exist).

## Ground rules

- Start from `feat/onboarding-wizard` branch (created in place, `git checkout
  -b` — preserves untracked files like `errors.md`).
- Baseline: `npm run test:run` = **55 passed / 16 failed** in 6 files. This plan
  fixes all 16 (Tasks 1–4) plus adds the wizard (5–10).
- TDD per task: write/run the failing test first, then implement, then green.
- Verification commands: `npm run test:run` (unit), `npm run build`
  (`tsc -b && vite build`, the typecheck gate), `npm run lint`.
- Existing test conventions (follow exactly): `vi.mock('<module>', () => ...)`
  for api/context modules, wrap in `MemoryRouter` + `ToastProvider`, mock
  `../../../utils/usePageMeta`. Tests use global `describe/it/vi/expect`
  (vitest `globals: true`, setup at `src/test/setup.ts`).
- Commit style: imperative, e.g. `fix: polyfill IntersectionObserver for tests`.

## Task 1 — Fix 6 failing suite files (IntersectionObserver)

Root cause: `Reveal.tsx` uses framer-motion `whileInView`, which needs
`IntersectionObserver`; jsdom doesn't provide it. This actually caused only 4
of the 16 failures (`BlogPage` 2 + `JobBoardPage` 2). The polyfill was
committed (`76f3505`) and the suite re-verified: **12 failed / 59 passed**
across 5 files. The 10 remaining failures are genuine pre-existing test bugs
that were unmasked once rendering worked; they are fixed in Task 2. Task 1
here documents the polyfill that was shipped.

TDD: `npm run test:run` → confirm 16 fail. Implement:

`src/test/setup.ts` — append a no-op polyfill:

```ts
class IntersectionObserverMock {
  root: Element | null = null
  rootMargin = ''
  thresholds: ReadonlyArray<number> = []
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] { return [] }
}
globalThis.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver
```

`npm run test:run` → those 14 pass (16 → 2 remaining). Also run `npm run build`
to be safe (type-only change).

Commit: `fix(test): polyfill IntersectionObserver in vitest setup`.

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

## Task 3 — Fix ForgotPasswordPage (duplicate heading + inline hook)

TDD: `npm run test:run -- ForgotPasswordPage` → the "shows success state"
test fails (`getByText('Check your email')` matches 2 nodes: `AuthCard` title
`<h1>` and the `<h2>` at line 37).

`src/components/auth/ForgotPasswordPage.tsx`:
- Remove the `<h2 className="text-xl font-medium text-ink mb-2">Check your email</h2>`
  (AuthCard already renders the title as the heading).
- Fix line 16: `{usePageMeta({...})}` → `const meta = usePageMeta({...})` and
  render `{meta}` in the JSX (matches `SignupPage` pattern; currently the inline
  call is silently dropped).

Verify: ForgotPasswordPage test green; full `npm run test:run` (2 → 0 remaining
after F3 or before).
Commit: `fix(auth): dedupe ForgotPassword success heading and page meta`.

## Task 4 — Fix ContactInfo form accessible name

TDD: `npm run test:run -- ContactInfo` → "renders the contact form" fails
(`getByRole('form')` needs an accessible name).

`src/components/contact/ContactForm.tsx` line ~39 — add `aria-label="Contact form"`:

```tsx
<form aria-label="Contact form" ...>
```

Verify: ContactInfo test green; full `npm run test:run` = **71 passed / 0 failed**.
Commit: `fix(contact): add accessible name to contact form`.

## Task 5 — Types + API layer + context

Not unit-testable (type layer). TDD gate = `npm run build` (tsc) after edits.

1. `src/api/client.ts` — add and export `apiPut`:

```ts
export function apiPut<T>(endpoint: string, body?: unknown) {
  return apiFetch<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  })
}
```

2. `src/api/index.ts` — export `apiPut` in the client line and add
   `export * from './company'`.
3. `src/api/types.ts` — extend `ApiUser` with the new optional fields
   (mirror backend `User`): `headline?`, `location?`, `skills?: string[]`,
   `resumePath?`, `resumeFileName?`, `salaryMin?`, `salaryMax?`, `currency?`,
   `remoteOnly?`, `employmentType?`, `onboardingCompleted?`.
4. `src/api/auth.ts` — extend `ProfileUpdate` with the same optional fields.
5. `src/context/AuthContext.tsx` — extend `AppUser` and `mapApiUser` with the
   same optional fields (all nullable `?: string | null` except
   `skills?: string[]`, `remoteOnly?: boolean | null`,
   `onboardingCompleted?: boolean`).
6. `src/api/company.ts` (new):

```ts
import { apiGet, apiPost, apiPut, apiUpload } from './client'

export interface CompanyInput {
  name: string
  website?: string
  industry?: string
  size?: string
  description?: string
  location?: string
}

export interface Company {
  id: string
  name: string
  website?: string | null
  industry?: string | null
  size?: string | null
  description?: string | null
  location?: string | null
  logo?: string | null
}

export interface CompanyInvite {
  id: string
  companyId: string
  email: string
  status: string
}

export function getCompany() {
  return apiGet<Company>('/company')
}

export function upsertCompany(input: CompanyInput) {
  return apiPut<Company>('/company', input)
}

export function uploadCompanyLogo(file: File) {
  const formData = new FormData()
  formData.append('logo', file)
  return apiUpload<{ logoUrl: string }>('/company/logo', formData)
}

export function inviteTeam(emails: string[]) {
  return apiPost<{ invites: CompanyInvite[] }>('/company/invites', { emails })
}
```

Verify: `npm run build` green.
Commit: `feat(api): add onboarding fields, company API client, and apiPut`.

## Task 6 — Shared wizard components (OnboardingProgress, SkillInput)

TDD: write tests first.

`src/components/onboarding/__tests__/OnboardingProgress.test.tsx` (repo convention: tests live in `__tests__/`):
- renders "Step 1 of 5" and current label at 0-based index 0.
- renders "0% complete" at step 0 and "100% complete" on last step.

`src/components/onboarding/OnboardingProgress.tsx`:

```tsx
interface OnboardingProgressProps {
  current: number
  total: number
  labels: string[]
}

export function OnboardingProgress({ current, total, labels }: OnboardingProgressProps) {
  const pct = Math.round((current / Math.max(total - 1, 1)) * 100)
  return (
    <div className="sticky top-0 z-10 bg-canvas/95 backdrop-blur border-b border-hairline">
      <div className="mx-auto max-w-3xl px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-ink">Step {current + 1} of {total} — {labels[current]}</span>
          <span className="text-sm text-ink-muted">{pct}% complete</span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden" aria-hidden="true">
          <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  )
}
```

`src/components/onboarding/__tests__/SkillInput.test.tsx` (repo convention: tests live in `__tests__/`):
- adds a skill on Enter and renders it as a chip.
- removes a chip via its remove button.
- clicking a suggestion adds it.
- prevents > max skills.
- shows an error message when provided.

`src/components/onboarding/SkillInput.tsx`:

```tsx
import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'

const SUGGESTIONS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'Go', 'Rust',
  'SQL', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'CI/CD',
  'GraphQL', 'REST APIs', 'Figma', 'Agile', 'Communication', 'UI/UX', 'Testing', 'Git',
]

interface SkillInputProps {
  value: string[]
  onChange: (skills: string[]) => void
  max?: number
  error?: string
}

export function SkillInput({ value, onChange, max = 15, error }: SkillInputProps) {
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)

  const addSkill = (raw: string) => {
    const skill = raw.trim().replace(/,$/, '')
    if (!skill || value.includes(skill) || value.length >= max) return
    onChange([...value, skill])
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill(text)
      setText('')
    } else if (e.key === 'Backspace' && !text && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  const matches = SUGGESTIONS.filter(
    (s) => s.toLowerCase().includes(text.toLowerCase()) && !value.includes(s),
  )

  return (
    <div>
      <div className={`flex flex-wrap gap-2 p-3 rounded-md border bg-surface-1 ${error ? 'border-error' : 'border-hairline'}`}>
        {value.map((skill) => (
          <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-sm font-medium bg-accent/10 text-ink">
            {skill}
            <button
              type="button"
              onClick={() => onChange(value.filter((s) => s !== skill))}
              aria-label={`Remove ${skill}`}
              className="text-ink-muted hover:text-ink"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
        <input
          className="flex-1 min-w-[140px] bg-transparent outline-none text-sm text-ink placeholder:text-ink-tertiary"
          placeholder={value.length ? 'Add another skill…' : 'Type a skill and press Enter'}
          value={text}
          onChange={(e) => { setText(e.target.value); setOpen(true) }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          aria-label="Skills"
        />
      </div>
      {text && matches.length > 0 && open && (
        <ul className="mt-2 border border-hairline rounded-md bg-surface-1 overflow-hidden shadow-sm" role="listbox">
          {matches.map((s) => (
            <li key={s}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-surface-2"
                onMouseDown={(e) => { e.preventDefault(); addSkill(s); setText(''); }}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-1 text-sm text-error" role="alert">{error}</p>}
      <p className="mt-2 text-xs text-ink-muted">{value.length} of {max} — add at least 3</p>
    </div>
  )
}
```

Verify: both new tests green; `npm run build` green.
Commit: `feat(onboarding): add progress indicator and skill input`.

## Task 7 — Seeker steps + wizard (seeker path)

TDD: `src/components/onboarding/__tests__/OnboardingWizard.test.tsx` seeker `describe`
written first (see below).

Steps (each `<form id="onboarding-step">`, error state shown inline on API
failure, success calls `onSaved()` which advances + shows "Saved" indicator):

`src/components/onboarding/SeekerBasicsStep.tsx` — RHF + zod. Fields:
`name` (min 1, max 100), `headline` (max 120), `location` (max 100). Prefill
from `useApp().user`. Submit → `updateProfile({ name, headline, location })` →
`setUser({ ...user, name, headline, location } as AppUser)` → `onSaved()`.
This step is mandatory; the wizard does not render Skip for it.

`src/components/onboarding/SeekerResumeStep.tsx` — file input (PDF only, ≤ 10 MB)
+ preview of chosen file name. Submit with no file → `onSaved()` (skip-by-
continue). With file: `formData.append('resume', file)`,
`apiUpload('/upload/resume', formData)` → `updateProfile({ resumePath:
res.data.resumePath, resumeFileName: res.data.resumeFileName })` → setUser →
`onSaved()`. Validate client-side: non-PDF → error "Please upload a PDF file";
> 10 MB → error "Resume must be under 10 MB".

`src/components/onboarding/SeekerSkillsStep.tsx` — `SkillInput`, prefill from
`user.skills`. Submit: `skills.length < 3` → inline error "Add at least 3
skills"; `> 15` → "Add at most 15 skills"; else
`updateProfile({ skills })` → setUser → `onSaved()`.

`src/components/onboarding/SeekerPreferencesStep.tsx` — RHF. Checkbox
`remoteOnly`; `salaryMin` / `salaryMax` (number, min 0, optional); `currency`
select (USD/EUR/GBP); `employmentType` select (Full-time/Part-time/Contract/
Internship). Submit builds payload with only defined values →
`updateProfile(payload)` → setUser → `onSaved()`.

`src/components/onboarding/SeekerCompleteStep.tsx` — summary card (headline,
location, skills count, remote/salary if set) + primary Button "Go to job
board": `updateProfile({ onboardingCompleted: true })` → `setUser({ ...user,
onboardingCompleted: true } as AppUser)` → `navigate('/jobs')`.

`src/components/onboarding/OnboardingWizard.tsx`:

```tsx
import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Button } from '../ui/Button'
import { OnboardingProgress } from './OnboardingProgress'
import { SeekerBasicsStep } from './SeekerBasicsStep'
import { SeekerResumeStep } from './SeekerResumeStep'
import { SeekerSkillsStep } from './SeekerSkillsStep'
import { SeekerPreferencesStep } from './SeekerPreferencesStep'
import { SeekerCompleteStep } from './SeekerCompleteStep'

interface StepDef {
  title: string
  optional: boolean
  component: (props: { onSaved: () => void }) => ReactNode
}

const SEEKER_STEPS: StepDef[] = [
  { title: 'Basics', optional: false, component: SeekerBasicsStep },
  { title: 'Resume', optional: true, component: SeekerResumeStep },
  { title: 'Skills', optional: true, component: SeekerSkillsStep },
  { title: 'Preferences', optional: true, component: SeekerPreferencesStep },
  { title: 'Done', optional: false, component: SeekerCompleteStep },
]

export default function OnboardingWizard() {
  const { user } = useApp()
  const [stepIndex, setStepIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const steps = SEEKER_STEPS
  const step = steps[stepIndex]
  const StepComponent = step.component
  const isLast = stepIndex === steps.length - 1

  const handleSaved = () => {
    setSaving(false)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0))
  const goNext = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1))

  return (
    <div className="min-h-screen bg-canvas">
      <OnboardingProgress current={stepIndex} total={steps.length} labels={steps.map((s) => s.title)} />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-ink mb-1">Let's get your profile ready</h1>
        <p className="text-sm text-ink-muted mb-8">{step.optional ? 'Optional — skip any time.' : 'A few details help employers find you.'}</p>
        {isLast ? (
          <StepComponent onSaved={handleSaved} />
        ) : (
          <>
            <StepComponent onSaved={handleSaved} />
            <div className="sticky bottom-0 mt-8 -mx-6 px-6 py-4 bg-canvas/95 backdrop-blur border-t border-hairline flex items-center gap-3">
              {stepIndex > 0 && (
                <Button variant="ghost" size="md" onClick={goBack}>Back</Button>
              )}
              {step.optional && (
                <Button variant="ghost" size="md" onClick={goNext}>Skip</Button>
              )}
              <span className="flex-1" />
              {saved && (
                <span className="inline-flex items-center gap-1 text-sm text-success">
                  <CheckCircle className="w-4 h-4" /> Saved
                </span>
              )}
              <Button
                variant="primary"
                size="md"
                type="submit"
                form="onboarding-step"
                disabled={saving}
                onClick={() => setSaving(true)}
              >
                Continue
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
```

`OnboardingWizard.test.tsx` (seeker describe):
- mocks: `vi.mock('../../api/auth')` (`updateProfile: vi.fn()`),
  `vi.mock('../../api/client')` (`apiUpload: vi.fn()`),
  `vi.mock('../../context/AppContext')` (`useApp` → seeker user, no
  onboardingCompleted), `vi.mock('../../../utils/usePageMeta')`. Wrap in
  `MemoryRouter` + `ToastProvider`. Note the component path from the test dir is
  `../../context/AppContext`, `../../api/auth` (test lives next to the wizard).
- Tests: renders progress "Step 1 of 5"; entering headline + Continue calls
  `updateProfile` and advances to "Step 2 of 5"; Skills step blocks Continue
  below 3 skills with the inline error; completing the flow (final step CTA)
  calls `updateProfile({ onboardingCompleted: true })`.

Verify: seeker tests green; `npm run build` green.
Commit: `feat(onboarding): seeker wizard steps`.

## Task 8 — Employer steps + wizard employer branch

TDD: extend `OnboardingWizard.test.tsx` with an employer `describe` (mock
`useApp` → employer user, `api/company` mocked via `vi.mock('../../api/company')`).

Steps:

`src/components/onboarding/EmployerCompanyStep.tsx` — RHF + zod. Fields:
`name` (min 1, max 200, prefill `user.companyName`), `website` (optional URL),
`industry`, `size`. Submit → `upsertCompany(values)` → setUser companyName →
`onSaved()`. Mandatory (no Skip).

`src/components/onboarding/EmployerProfileStep.tsx` — logo file input
(jpeg/png/webp ≤ 2 MB, validates client-side) + `description` (max 500) +
`location`. Submit: if logo selected, `uploadCompanyLogo(file)` →
`upsertCompany({ description, location, ...(logoUrl ? { logo: logoUrl } : {}) })`
→ `onSaved()`. Optional (Skip).

`src/components/onboarding/EmployerInviteStep.tsx` — textarea for
comma/newline-separated emails; parse, validate each with a zod `z.string().email()`
trimmed; invalid ones shown as error "Not a valid email: X"; up to 20; chips of
parsed emails with remove buttons. Submit → `inviteTeam(emails)` →
`onSaved()`. Optional (Skip). Test asserts invalid email shows the error and
valid submit calls `inviteTeam`.

`src/components/onboarding/EmployerCompleteStep.tsx` — summary + Button "Post
your first job": `updateProfile({ onboardingCompleted: true })` → setUser →
`navigate('/post-job')`.

`src/components/onboarding/OnboardingWizard.tsx` — add `EMPLOYER_STEPS` array
(Company/Profile/Team/Done, same `StepDef` shape) and pick
`const steps = user?.role === 'employer' ? EMPLOYER_STEPS : SEEKER_STEPS`.
Import the four employer step components.

Verify: employer tests green; `npm run build` green.
Commit: `feat(onboarding): employer wizard steps`.

## Task 9 — Routing + gating wiring

TDD: `src/components/auth/__tests__/ProtectedRoute.test.tsx` first (mock
`../../../context/AppContext` via `useApp`):
- `loading` → spinner (`Loader2`).
- no user → redirects to `/login`.
- user with `onboardingCompleted: false` on `/dashboard` → redirects to
  `/onboarding`.
- user with `onboardingCompleted: true` → renders children.
- employer without allow → redirects to `/`.

Implement:
1. `src/components/auth/ProtectedRoute.tsx` — add `useLocation`; after the
   role check insert:

```tsx
const location = useLocation()
...
if (user && !user.onboardingCompleted && location.pathname !== '/onboarding') {
  return <Navigate to="/onboarding" replace />
}
```

2. `src/App.tsx` — add lazy import `const OnboardingWizard = lazy(() => import('./components/onboarding/OnboardingWizard'))`
   and route:

```tsx
<Route path="/onboarding" element={<ProtectedRoute><ErrorBoundary><OnboardingWizard /></ErrorBoundary></ProtectedRoute>} />
```

3. `src/components/auth/SignupPage.tsx` — include
   `onboardingCompleted: res.data.user.onboardingCompleted` in the `setUser`
   object and change the final `navigate(...)` to `navigate('/onboarding')`
   (both roles). The existing `SignupPage.test.tsx` does not assert navigation,
   so it stays green.

Verify: ProtectedRoute tests green; full `npm run test:run`; `npm run build`.
Commit: `feat(auth): gate incomplete users to onboarding`.

## Task 10 — Final frontend gate

- `npm run test:run` → all green (was 71, now + wizard/ProtectedRoute/Progress/
  SkillInput tests).
- `npm run build` → green.
- `npm run lint` → green.
- Manual smoke (if dev servers running): register → land on `/onboarding` →
  complete → dashboard reachable; incomplete user hitting `/dashboard` is
  redirected.
