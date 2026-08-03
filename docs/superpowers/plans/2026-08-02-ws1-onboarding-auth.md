# Plan: WS1 — Onboarding & Auth Fix (HireHub #8)

Date: 2026-08-02
Repo: `hirehub-frontend` (React 19.2, Vite 8, TS ~6.0, React Router 7.18,
Tailwind 3, Vitest 4 + RTL, @radix-ui/react-dialog)
Backlog: `/home/jacobp/Desktop/Projecs/changes.md` items #8 (onboarding skip
after completed once, any role). Apply-flow cover-letter-only modal (#13) is
WS4 scope and is NOT in this plan.
Execution: subagent-driven development (fresh implementer per task, spec
review + commit after each task).

## Ground rules

- Work on the current branch `feat/onboarding-wizard` (already checked out;
  keep untracked files like `errors.md` and existing plan docs intact).
- TDD per task: write/run the failing test first, then implement, then green.
- Verification commands: `npm run test:run` (unit), `npm run build`
  (`tsc -b && vite build`, the typecheck gate), `npm run lint`.
- Test conventions (follow exactly): `vi.mock('<module>', () => ...)` for
  api/context modules, wrap in `MemoryRouter` + `ToastProvider`, mock
  `../../../utils/usePageMeta`. Tests live in `src/components/auth/__tests__/`.
  Global `describe/it/vi/expect` (vitest `globals: true`, setup at
  `src/test/setup.ts`).
- Commit style: imperative, e.g. `fix(auth): propagate onboardingCompleted on login`.

## Root cause (#8)

`LoginPage.tsx:29-35` calls `setUser(...)` with a hand-built object that
omits `onboardingCompleted` (and several profile fields: skills, resumePath,
salary, etc.). SignupPage has the same partial mapping
(`SignupPage.tsx:38-45`). Because `setUser` overwrites the whole user in
`AuthContext`, an already-onboarded user who logs in has
`onboardingCompleted === undefined` in context → `ProtectedRoute.tsx:28`
sees `!user.onboardingCompleted` and redirects them back to `/onboarding`.

Additionally, `ProtectedRoute` only redirects users TO `/onboarding` when
incomplete; it never redirects AWAY from `/onboarding` when already complete,
so a completed user who lands on `/onboarding` directly still sees the wizard.

Fix:
1. Export the existing `mapApiUser` helper from `AuthContext` and use it in
   both `LoginPage` and `SignupPage` so the full profile (including
   `onboardingCompleted`) is mapped on login/register — one source of truth.
2. `ProtectedRoute`: when `user.onboardingCompleted === true` and the current
   path is `/onboarding`, redirect to the role home (`/dashboard`,
   `/employer/dashboard`, or `/admin`).

## Task 1 — Propagate full user (incl. onboardingCompleted) on login/register

TDD: `npm run test:run -- LoginPage` → add a failing test that asserts
`setUser` is called with `onboardingCompleted` from the login response.

1. `src/context/AuthContext.tsx` — change `function mapApiUser` →
   `export function mapApiUser` (line 36). No behavior change.
2. `src/components/auth/LoginPage.tsx` — replace the inline `setUser({...})`
   object (lines 29-35) with `setUser(mapApiUser(res.data.user))`; import
   `mapApiUser` from `../../context/AuthContext`. Keep the role-based
   `navigate(...)` unchanged.
3. `src/components/auth/SignupPage.tsx` — replace the inline `setUser({...})`
   object (lines 38-45) with `setUser(mapApiUser(res.data.user))`; import
   `mapApiUser` from `../../context/AuthContext`. Keep `navigate('/onboarding')`.

Tests (`src/components/auth/__tests__/LoginPage.test.tsx`):
- Add test: on successful login with a response user containing
  `onboardingCompleted: true`, `setUser` is called with an object where
  `onboardingCompleted === true`. Mock `login` to resolve
  `{ data: { user: { id, name, email, role: 'SEEKER', onboardingCompleted: true }, accessToken: 't' } }`.
  The existing `useApp` mock returns `setUser: vi.fn()` — capture that fn
  (hoist the mock fn at module scope) and assert `toHaveBeenCalledWith(expect.objectContaining({ onboardingCompleted: true }))`.
  Assert also that other fields (e.g. `name`) survive.

Verify: LoginPage tests green; `npm run build` green.
Commit: `fix(auth): map full user on login and signup`.

## Task 2 — Redirect completed users away from /onboarding

TDD: `npm run test:run -- ProtectedRoute` → add a failing test: user with
`onboardingCompleted: true` on `/onboarding` is redirected to `/dashboard`.

`src/components/auth/ProtectedRoute.tsx` — after the `allowedRoles` check and
before the existing incomplete-onboarding redirect (line 28), insert:

```tsx
const HOME_BY_ROLE: Record<string, string> = {
  seeker: '/dashboard',
  employer: '/employer/dashboard',
  admin: '/admin',
}
...
if (user && user.onboardingCompleted && location.pathname === '/onboarding') {
  return <Navigate to={HOME_BY_ROLE[user.role] ?? '/dashboard'} replace />
}
```

Tests (`src/components/auth/__tests__/ProtectedRoute.test.tsx`):
- Add `renderAt('/onboarding')` with a seeker user
  `{ role: 'seeker', onboardingCompleted: true }` → expect "Dashboard content"
  (redirect to `/dashboard`), and `queryByText('Onboarding page')` is null.
- Keep the existing "redirects to /onboarding when not completed" case green.

Verify: ProtectedRoute tests green; full `npm run test:run` (all suites);
`npm run build`.
Commit: `fix(auth): skip onboarding when already completed`.

## Task 3 — Final gate

- `npm run test:run` → all green.
- `npm run build` → green.
- `npm run lint` → green.
- Manual smoke (if dev servers running): log in with an onboarded account →
  lands on dashboard, not `/onboarding`; visiting `/onboarding` while logged
  in as a completed user redirects to the role dashboard; new signup still
  lands on `/onboarding`.
