# Task 8 Report — Employer steps + wizard employer branch

## Status: DONE

## What was implemented

TDD employer path for the onboarding wizard on the `feat/onboarding-wizard`
branch. Four employer step components + employer branch in the wizard shell.

### `EmployerCompanyStep.tsx` (new) — MANDATORY
RHF + zod: `name` (1–200, prefilled from `user.companyName`), `website`
(optional URL), `industry`, `size`. Submit →
`upsertCompany({ name, website, industry, size })` → `setUser({ ...user,
companyName: name })` → `onSaved()`. No Skip.

### `EmployerProfileStep.tsx` (new) — OPTIONAL
Logo file input (jpeg/png/webp, ≤2 MB, client-side validated) + `description`
(max 500 via Textarea maxLength) + `location`. Submit: if logo selected →
`uploadCompanyLogo(file)` → `res.data.logoUrl`; then
`upsertCompany({ name, description, location, ...(logo ? { logo } : {}) })` →
`onSaved()`. Skip available.
- **Deviation:** the plan's spec code called `upsertCompany` without `name`,
  but `CompanyInput.name` is required by the API layer. Added
  `name: user?.companyName ?? ''` (Company step is mandatory and precedes
  this step, so it is always set).

### `EmployerInviteStep.tsx` (new) — OPTIONAL
Textarea ("Team emails") for comma/newline-separated emails; parsed with
`split(/[\s,]+/)`; each validated with `z.string().email()`; first invalid →
error `Not a valid email: <x>`; caps at 20 invites; parsed emails shown as
removable chips. Submit → `inviteTeam(emails)` → `onSaved()`. Empty → `onSaved()`
(skip path). Skip available.

### `EmployerCompleteStep.tsx` (new)
Summary card (company name) + "Post your first job" →
`updateProfile({ onboardingCompleted: true })` → `setUser` →
`navigate('/post-job')`. Rendered outside the form footer.

### `OnboardingWizard.tsx`
Added `EMPLOYER_STEPS` (Company/Profile/Team/Done, same `StepDef` shape) and
`const steps = user?.role === 'employer' ? EMPLOYER_STEPS : SEEKER_STEPS`;
re-added `useApp`; imported the four employer components.

### `__tests__/OnboardingWizard.test.tsx`
Refactored the static `useApp` mock to `useApp: vi.fn()` with per-describe
`mockReturnValue` (seeker user / employer user), added
`vi.mock('../../../api/company')` (`upsertCompany`, `uploadCompanyLogo`,
`inviteTeam`), and an employer `describe` with 4 tests: renders "Step 1 of 4";
company name → `upsertCompany` + advances; invalid invite email → inline
error, valid submit → `inviteTeam(['alice@acme.com', 'bob@acme.com'])`;
final CTA → `updateProfile({ onboardingCompleted: true })`.

## TDD evidence

- RED: employer describe failed (wizard still seeker-only): 4 failed / 8 total.
- GREEN: onboarding suite 15/15; full suite `npm run test:run` → 86/86; build
  `npm run build` (`tsc -b && vite build`) → passes.

## Plan bugs found & fixed (with test evidence)

1. **Wizard Continue stuck disabled after validation failure.** The plan's
   Continue had `disabled={saving}` + `onClick={() => setSaving(true)}`, but
   `saving` was only reset on success (`handleSaved`). A failed validation
   (e.g. invalid invite email) left Continue permanently disabled — the test
   for retrying after an invalid email exposed it. Removed the wizard-level
   `saving` entirely; steps own their own saving/submitting state (RHF
   `isSubmitting` resets on failure; plain-form steps guard double-submits
   and reset on error paths).
2. **Prefilled input + typing appends.** Tests typed into the Company name
   field prefilled with `'Acme'` → `'AcmeAcme Inc'`. Tests now
   `user.clear()` first (component prefill behavior is correct).
3. **`getByText(...).not.toBeInTheDocument()`** throws when the element is
   absent — switched the absence assertion to `queryByText`.

## Files changed

- `src/components/onboarding/EmployerCompanyStep.tsx` (new)
- `src/components/onboarding/EmployerProfileStep.tsx` (new)
- `src/components/onboarding/EmployerInviteStep.tsx` (new)
- `src/components/onboarding/EmployerCompleteStep.tsx` (new)
- `src/components/onboarding/OnboardingWizard.tsx` (employer branch)
- `src/components/onboarding/__tests__/OnboardingWizard.test.tsx` (mock refactor + employer describe)

## Commit

- `1b7c601 feat(onboarding): employer wizard steps`

## Self-review

- Employer steps follow the same contract as seeker: `<form id="onboarding-step">`,
  own saving state, `onSaved()` on success, inline `role="alert"` on failure,
  no advance on failure.
- `upsertCompany` calls now always include `name` (API requirement).
- Full suite green (86), build green, output pristine.

## Concerns

- None. Task 9 (routing + gating wiring) is next.
