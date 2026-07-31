# Task 7 Report — Seeker onboarding steps + wizard shell

## Status: DONE

## What was implemented

TDD seeker path for the onboarding wizard on the `feat/onboarding-wizard`
branch. Four step components + complete step + wizard shell.

### `src/components/onboarding/OnboardingWizard.tsx` (new)
- Default-exported wizard. Renders `OnboardingProgress` header, step title
  block, current step, and a sticky bottom bar with Back / Skip (optional
  steps only) / Continue + "Saved" indicator.
- Continue submits via `form="onboarding-step"`; `handleSaved` advances the
  step (`setStepIndex(i+1)`), flashes the Saved check, and clears the saving
  state.
- The final step (SeekerCompleteStep) is rendered outside the form footer.
- **Plan deviation (bug fix):** the plan's verbatim `handleSaved` never
  advanced the step index, so no step could move forward — contradicting the
  plan's own spec ("entering a headline and continuing calls updateProfile and
  advances to Step 2 of 5"). Added `setStepIndex((i) => Math.min(i + 1, steps.length - 1))`
  inside `handleSaved`.
- The seeker-only branch destructures no `user` yet (role routing is Task 8);
  the `useApp`/`useNavigate` imports are intentionally absent until then to
  keep `tsc -b` clean.

### `SeekerBasicsStep.tsx` (new)
- RHF + zod schema (`name` 1–100, `headline` max 120, `location` max 100),
  prefilled from `user`. Submit → `updateProfile` → `setUser` → `onSaved()`.
  API failure → inline `role="alert"` error, no advance.

### `SeekerResumeStep.tsx` (new)
- Hidden PDF-only file input (≤10 MB) with a dashed "Choose a resume" picker.
- No file → `onSaved()` (skip path). With file → `apiUpload('/upload/resume',
  formData)` → `updateProfile({ resumePath, resumeFileName })` → `setUser` →
  `onSaved()`. Matches verified backend contract (`POST /api/upload/resume`,
  requireRole('SEEKER'), returns `{ resumePath, resumeFileName }`).

### `SeekerSkillsStep.tsx` (new)
- Uses `SkillInput`. <3 skills → "Add at least 3 skills"; >15 → "Add at most 15
  skills"; then `updateProfile({ skills })` → `setUser` → `onSaved()`.
- Removed `error` pass-through to `SkillInput` — the step-level alert and
  SkillInput's own error text rendered the same string twice (duplicate
  `role="alert"`, a11y regression); the step keeps the single alert.

### `SeekerPreferencesStep.tsx` (new)
- RHF + zod: `remoteOnly` checkbox, `salaryMin`/`salaryMax` (optional, ≥0 via
  `z.preprocess` empty→undefined), `currency` (USD/EUR/GBP), `employmentType`
  (Full-time/Part-time/Contract/Internship). Only set fields are sent.
- **Typing fix:** `z.preprocess` makes `z.input` yield `unknown`, so the RHF
  `Resolver` generic disagreed with `z.infer` (numbers). Switched to
  `type PreferencesFormData = z.input<typeof preferencesSchema>` and narrowed
  with `typeof data.salaryMin === 'number'` before writing the payload.

### `SeekerCompleteStep.tsx` (new)
- Summary card of entered profile (headline / location / skills / remote-only)
  + primary "Go to job board" → `updateProfile({ onboardingCompleted: true })`
  → `setUser` → `navigate('/jobs')`. Rendered outside the form footer.

### `__tests__/OnboardingWizard.test.tsx` (new, RED→GREEN)
- 4 seeker tests per plan spec: renders Step 1 of 5; headline → updateProfile
  called + advances; Skills <3 → inline error, no advance; final CTA →
  updateProfile with `{ onboardingCompleted: true }`.
- AppContext mocked via `vi.mock('../../../context/AppContext')` overriding
  `useApp` only (existing repo pattern).

## TDD evidence

- RED: wizard test failed resolving `../OnboardingWizard` (component absent).
- GREEN after writing components: onboarding suite 11/11
  (`npx vitest run src/components/onboarding/`).
- Full suite: `npm run test:run` → 82 passed / 0 failed.
- Build: `npm run build` (`tsc -b && vite build`) → passes (no unused imports,
  no unused destructures).

## Test fixes made during GREEN

1. Plan's `handleSaved` bug (see above) — wizard could not advance.
2. `/continue/i` query matched the Resume picker's copy
   ("Optional — continue without one to skip.") → tightened test to exact
   `{ name: 'Continue' }`; the wizard and copy are correct.
3. Duplicate "Add at least 3 skills" (step alert + SkillInput error) → removed
   `error` prop pass-through to SkillInput.
4. Build-time unused `FormEvent` imports / unused `user`; z.input typing for
   preprocess fields.

## Files changed

- `src/components/onboarding/OnboardingWizard.tsx` (new)
- `src/components/onboarding/SeekerBasicsStep.tsx` (new)
- `src/components/onboarding/SeekerResumeStep.tsx` (new)
- `src/components/onboarding/SeekerSkillsStep.tsx` (new)
- `src/components/onboarding/SeekerPreferencesStep.tsx` (new)
- `src/components/onboarding/SeekerCompleteStep.tsx` (new)
- `src/components/onboarding/__tests__/OnboardingWizard.test.tsx` (new)

## Commit

- `51127fa feat(onboarding): seeker wizard steps`

## Self-review

- All steps follow the contract: `<form id="onboarding-step">`, own saving
  state, `onSaved()` on success, inline `role="alert"` error on API failure,
  no advance on failure.
- Full suite green (82), build green, output pristine.

## Concerns

- None. Task 8 (employer steps + employer wizard branch) is next.
