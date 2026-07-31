# Task 8 Brief — Employer steps + wizard employer branch

## Objective
Complete the employer side of the onboarding wizard: four employer step
components + employer branch in the wizard shell, TDD against the existing
`OnboardingWizard.test.tsx` (new employer `describe`).

## Context
- Branch `feat/onboarding-wizard`, commit `51127fa` (Task 7 seeker path done).
- Plan Task 8 at docs/superpowers/plans/2026-07-31-onboarding-wizard-frontend.md:524.
- Company API (already committed in `2fd36f3`, `src/api/company.ts`):
  - `upsertCompany(input: CompanyInput)` → `{ data: Company }`
  - `uploadCompanyLogo(file)` → `{ data: { logoUrl } }`
  - `inviteTeam(emails: string[])` → `{ data: { invites } }`
  - `CompanyInput = { name, website?, industry?, size?, description?, location? }`
- `AppUser` has `role: 'seeker' | 'employer'` (mock `useApp` returns employer
  user in the employer describe).
- Wizard shell currently has no `useApp`/`useNavigate` (removed for tsc).
  Task 8 re-adds `useApp` for the role branch. `handleSaved` already advances
  the step (Task 7 fix) — employer steps call `onSaved()` the same way.

## Steps (each `<form id="onboarding-step">`, own saving state, inline
`role="alert"` on API failure, `onSaved()` on success)

### `EmployerCompanyStep.tsx` — MANDATORY (no Skip)
RHF + zod. Fields: `name` (min 1, max 200, prefill `user.companyName`),
`website` (optional, URL-validated), `industry`, `size`. Submit →
`upsertCompany({ name, website, industry, size })` → `setUser({ ...user,
companyName: name })` → `onSaved()`.

### `EmployerProfileStep.tsx` — OPTIONAL
Logo file input (jpeg/png/webp, ≤2 MB, client-side validated) + `description`
(max 500) + `location`. Submit: logo selected →
`uploadCompanyLogo(file)` → `upsertCompany({ description, location, ...(logoUrl ? { logo: logoUrl } : {}) })`
→ `onSaved()`. Skip available.

### `EmployerInviteStep.tsx` — OPTIONAL
Textarea for comma/newline-separated emails; parse + trim; validate each with
`z.string().email()`; invalid → error "Not a valid email: X"; max 20; chips of
parsed emails with remove buttons. Submit → `inviteTeam(emails)` → `onSaved()`.

### `EmployerCompleteStep.tsx`
Summary + Button "Post your first job": `updateProfile({ onboardingCompleted:
true })` → `setUser` → `navigate('/post-job')`. Rendered outside form footer.

### `OnboardingWizard.tsx`
Add `EMPLOYER_STEPS` (Company/Profile/Team/Done, same `StepDef` shape), pick
`const steps = user?.role === 'employer' ? EMPLOYER_STEPS : SEEKER_STEPS`,
re-add `useApp`, import the four employer step components.

## Tests (RED first)
Extend `src/components/onboarding/__tests__/OnboardingWizard.test.tsx` with an
employer `describe`. The existing `useApp` mock is a fixed object — refactor to
`useApp: vi.fn()` and set the return value per describe's `beforeEach`
(seeker user / employer user). Mock `vi.mock('../../../api/company')` with
`upsertCompany`, `uploadCompanyLogo`, `inviteTeam` as `vi.fn()`. Add
`vi.mock('../../../api/auth')` updateProfile (already present).
Tests:
- renders "Step 1 of 4" (Company) for an employer user.
- Company step: entering name + Continue calls `upsertCompany` and advances.
- Invite step: invalid email shows "Not a valid email: <x>"; valid submit calls
  `inviteTeam` with the parsed emails.
- completing the flow: final CTA calls `updateProfile({ onboardingCompleted: true })`.

## Gates
- `npx vitest run src/components/onboarding/` → GREEN (all seeker + employer).
- `npm run test:run` → 0 failed.
- `npm run build` (`tsc -b && vite build`) → passes (no unused imports).
- Commit: `feat(onboarding): employer wizard steps`.

## Notes
- Reuse the Input/Textarea/Button primitives; no new UI components.
- Employer user mock shape: `{ id, name, email, role: 'employer', companyName? }`.
- Keep seeker tests untouched except the mock refactor.
