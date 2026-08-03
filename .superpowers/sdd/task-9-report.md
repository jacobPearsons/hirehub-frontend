# Task 9 Report — Routing + gating wiring

## Status: DONE

## What was implemented

TDD wiring of the `/onboarding` route and the onboarding-completion gate on
the `feat/onboarding-wizard` branch.

### `src/components/auth/ProtectedRoute.tsx`
Added `useLocation()` and, after the role check:
```tsx
if (user && !user.onboardingCompleted && location.pathname !== '/onboarding') {
  return <Navigate to="/onboarding" replace />
}
```
- The `location.pathname !== '/onboarding'` guard prevents a redirect loop
  when the user is already viewing the wizard (per plan).
- Ordering note: the role check runs before the onboarding gate, so an
  employer with `allowedRoles={['employer']}` still hits the role redirect
  first — matches plan intent.

### `src/App.tsx`
Added lazy import `const OnboardingWizard = lazy(() => import('./components/onboarding/OnboardingWizard'))`
and route:
```tsx
<Route path="/onboarding" element={
  <ProtectedRoute><ErrorBoundary><OnboardingWizard /></ErrorBoundary></ProtectedRoute>
} />
```

### `src/components/auth/SignupPage.tsx`
- `setUser` now includes `onboardingCompleted: res.data.user.onboardingCompleted`.
- Final navigation changed to `navigate('/onboarding')` for both roles (was
  role-based dashboard redirect). Existing `SignupPage.test.tsx` does not
  assert navigation, so it stays green.

### `__tests__/ProtectedRoute.test.tsx` (new, RED→GREEN)
5 tests per plan spec: loading spinner (`Loader2`), no user → `/login`,
`onboardingCompleted: false` on `/dashboard` → `/onboarding`, completed →
renders children, disallowed role → `/`. Mocked `useApp` via
`vi.mock('../../../context/AppContext')`, wrapped in `MemoryRouter` + `Routes`.

## TDD evidence

- RED: 1 failed / 5 (onboarding-gate test only — gate absent).
- GREEN: 5/5 after implementation.
- Full suite: `npm run test:run` → 91 passed / 0 failed.
- Build: `npm run build` (`tsc -b && vite build`) → passes.
- Lint: `npm run lint` → 0 errors. Fixed 2 errors I had introduced (unused
  `_props` params in `SeekerCompleteStep`/`EmployerCompleteStep` — removed the
  parameter and the now-unused prop interfaces). Remaining 3 warnings are
  pre-existing RHF `watch` "incompatible library" notes in
  ApplyJobForm.tsx / InterviewScheduleModal.tsx / ProfilePage.tsx — untouched.

## Files changed

- `src/components/auth/ProtectedRoute.tsx`
- `src/components/auth/SignupPage.tsx`
- `src/App.tsx`
- `src/components/auth/__tests__/ProtectedRoute.test.tsx` (new)
- `src/components/onboarding/SeekerCompleteStep.tsx` (lint fix)
- `src/components/onboarding/EmployerCompleteStep.tsx` (lint fix)

## Commit

- `b28fbe5 feat(auth): gate incomplete users to onboarding`

## Self-review

- Incomplete users are redirected from every protected route to `/onboarding`
  (including `/dashboard/profile` and `/post-job`); the wizard's own landing
  and the completion redirects (`/jobs`, `/post-job`) are unaffected because
  `onboardingCompleted` is set before navigating.
- Both roles land on `/onboarding` after signup.
- Lint/build/tests all green.

## Concerns

- None. Task 10 (final whole-branch gate) is next.
