# HireHub Frontend — Application RBAC Permissions (employer grant-driven UI + admin grant console)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the confirmed E2E break and make the employer pipeline permission-gated, driven by the backend's `requirePermission` RBAC:

1. `ApplicationsContext` currently calls `GET /api/applications` with no params → 400 for EMPLOYERs. Fix: branch to `GET /api/applications/employer/me` for employers, and re-fetch when the logged-in user changes (waiting for auth to resolve so the branch is correct).
2. `AuthContext` must surface the backend's new `permissions: string[]` (from `getMe`/`login`/`register`) so the UI can gate actions per-user.
3. Employer pipeline actions (`Mark reviewing`, `Schedule Interview`, `Make offer`, `Reject` + the same buttons inside `CandidateDetailDrawer`) render **only when the employer has `application:update`** (admin always). Otherwise the applicants surface is view-only.
4. New admin **Employer Permissions Dialog** on the admin Employers tab: grant/revoke role bindings and edit the `employer` role's capabilities via the existing RBAC endpoints.

## Global Constraints

- Repo: `hirehub-frontend`, branch `main`. Commit directly; never create/switch branches, never worktree.
- **Never run `git add -A` / `git add .`** — the working tree contains pre-existing uncommitted artifacts (modified `.superpowers/sdd/*`, 2 modified components + their tests, untracked plan docs and assets). Stage only the exact files each task names.
- Verify from `hirehub-frontend/`: `npm run test:run`, `npm run lint` (0 errors), `npm run build`.
- Role strings are lowercase on the frontend (`'seeker' | 'employer' | 'admin'`); backend returns UPPERCASE. `mapApiUser` lowercases the role; `permissions` passes through verbatim (lowercase capability strings like `application:update`).
- `AuthProvider` wraps `ApplicationsProvider` in `src/context/AppContext.tsx`, so `ApplicationsContext` may safely call `useAuth()`.
- The dialog must preserve unknown capabilities when saving (a save must never drop capabilities the catalog doesn't know about).
- Wire statuses are lowercase on the frontend (`applied|reviewing|interviewing|rejected|offer`).
- Backend counterpart plan: `hirehub-backend/docs/superpowers/plans/2026-08-05-applications-rbac-permissions.md`. The frontend must be merged after the backend's `permissions` field + permission-gated routes are in place. (They can be implemented in parallel; E2E verification requires both.)

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/api/types.ts` | Modify | `permissions?: string[]` on `ApiUser` + `AuthUser` |
| `src/context/AuthContext.tsx` | Modify | `AppUser.permissions` + `mapApiUser` pass-through |
| `src/utils/permissions.ts` | Create | `canManageApplications(user)` helper |
| `src/utils/__tests__/permissions.test.ts` | Create | helper unit tests |
| `src/context/ApplicationsContext.tsx` | Modify | employer branch + user-change refetch + auth-loading gate |
| `src/components/candidate/CandidateDetailDrawer.tsx` | Modify | `readOnly?: boolean` prop (hide Actions + modals) |
| `src/components/candidate/__tests__/CandidateDetailDrawer.test.tsx` | Modify | readOnly case |
| `src/components/employer-dashboard/ApplicantsTab.tsx` | Modify | permission-gate action buttons/modals, `readOnly` drawer |
| `src/components/employer-dashboard/__tests__/ApplicantsTab.test.tsx` | Modify | canManage true/false cases + AuthContext mock |
| `src/api/admin.ts` | Modify | Role/RoleBinding API functions + types |
| `src/components/admin/EmployerPermissionsDialog.tsx` | Create | grant/revoke bindings + capability editor |
| `src/components/admin/__tests__/EmployerPermissionsDialog.test.tsx` | Create | dialog tests |
| `src/components/admin/AdminPage.tsx` | Modify | "Manage permissions" button per employer row |

---

### Task B1: Permissions plumbing (`permissions` on user types + `canManageApplications` helper)

**Files:**
- Modify: `src/api/types.ts`
- Modify: `src/context/AuthContext.tsx`
- Create: `src/utils/permissions.ts`
- Create: `src/utils/__tests__/permissions.test.ts`

**Interfaces:**
- `ApiUser` (UPPERCASE role) and `AuthUser` (lowercase role) in `src/api/types.ts` both gain `permissions?: string[]`.
- `AppUser` in `AuthContext.tsx` gains `permissions?: string[]`; `mapApiUser`'s input param type gains `permissions?: string[]` and its returned object forwards `permissions: user.permissions`.
- New pure helper `canManageApplications(user: { role: string; permissions?: string[] } | null): boolean` in `src/utils/permissions.ts`:
  - `null` → `false`
  - `user.role === 'admin'` → `true`
  - else `true` iff `permissions` contains `'*:*'`, `'application:*'`, or `'application:update'`.

- [ ] **Step 1: `src/api/types.ts`** — add `permissions?: string[]` to both `ApiUser` (after `role` at line 13) and `AuthUser` (after `role` at line 35).
- [ ] **Step 2: `src/context/AuthContext.tsx`** —
  - Add `permissions?: string[]` to the `AppUser` interface (after `role` line 9).
  - Add `permissions?: string[]` to `mapApiUser`'s param type (after `role: string` line 41).
  - Add `permissions: user.permissions,` to the returned object (after the `role:` mapping line 62).
  - No other changes; `init()` already calls `getMe()` → `mapApiUser(res.data)` so permissions flow into `user` automatically.
- [ ] **Step 3: Create `src/utils/permissions.ts`:**
  ```ts
  export function canManageApplications(user: { role: string; permissions?: string[] } | null): boolean {
    if (!user) return false
    if (user.role === 'admin') return true
    const permissions = user.permissions ?? []
    if (
      permissions.includes('*:*') ||
      permissions.includes('application:*') ||
      permissions.includes('application:update')
    ) {
      return true
    }
    return false
  }
  ```
- [ ] **Step 4: Create `src/utils/__tests__/permissions.test.ts`** (check the existing `src/utils/__tests__/` files for the vitest conventions; import the helper directly):
  - `canManageApplications(null)` → false
  - admin without permissions → true
  - employer with `['application:update']` → true
  - employer with `['application:*']` → true
  - employer with `['*:*']` → true
  - employer with `['job:create']` → false
  - employer with no permissions array → false
- [ ] **Step 5: Verify.** `npm run test:run`, `npm run lint`, `npm run build`.
- [ ] **Step 6: Commit.** `git add src/api/types.ts src/context/AuthContext.tsx src/utils/permissions.ts src/utils/__tests__/permissions.test.ts`; message `feat(rbac): surface user permissions and add canManageApplications helper`.

---

### Task B2: `ApplicationsContext` — employer branch + refetch on user change

**Files:**
- Modify: `src/context/ApplicationsContext.tsx`

**Why:** `listApplications()` → `GET /applications` → backend `list()` requires `jobId` for EMPLOYERs → 400. The employer endpoint is `GET /applications/employer/me` (`listEmployerApplications` in `src/api/applications.ts`).

**Interfaces:**
- Consumes: `useAuth` from `./AuthContext` (safe — `AuthProvider` wraps `ApplicationsProvider`), `listEmployerApplications` from `../api/applications`.
- Behavior: the init effect waits for auth to resolve (`loading === false`), then:
  - `user?.role === 'employer'` → `listEmployerApplications()`
  - else → `listApplications()`
- The effect re-runs when the user changes (login/logout/role switch) and on auth loading transitions. This also fixes the stale-applications-after-login problem.

- [ ] **Step 1: Change the code.** In `src/context/ApplicationsContext.tsx`:
  - Update imports (line 2):
    ```ts
    import { listApplications, listEmployerApplications, updateHiringData, updateApplicationStatus as apiUpdateStatus } from '../api/applications'
    ```
    and add `import { useAuth } from './AuthContext'`.
  - In `ApplicationsProvider`, before the state line:
    ```ts
    const { user, loading: authLoading } = useAuth()
    ```
  - Replace the init effect (lines 23-38) with:
    ```ts
    useEffect(() => {
      const controller = new AbortController()

      async function init() {
        if (authLoading) return
        if (!getAccessToken() || !user) return
        try {
          const res =
            user.role === 'employer'
              ? await listEmployerApplications()
              : await listApplications()
          if (!controller.signal.aborted) {
            setApplications(res.data)
          }
        } catch { /* intentionally empty */ }
      }

      init()
      return () => controller.abort()
    }, [authLoading, user?.id])
    ```
  - Do not change the provider methods or the context value shape.
- [ ] **Step 2: Verify.** `npm run test:run` (existing consumers that mock `useApplications` are unaffected — they mock the hook, not the provider), `npm run lint`, `npm run build`.
- [ ] **Step 3: Commit.** `git add src/context/ApplicationsContext.tsx`; message `fix(applications): load employer applications via employer endpoint and refetch on user change`.

---

### Task B3: `CandidateDetailDrawer` `readOnly` prop

**Files:**
- Modify: `src/components/candidate/CandidateDetailDrawer.tsx`
- Modify: `src/components/candidate/__tests__/CandidateDetailDrawer.test.tsx`

**Interfaces:**
- Props gain `readOnly?: boolean` (default `false`). When `readOnly`:
  - Do NOT render the `<Section title="Actions">` block (the status/modal-opening buttons, currently lines 219-249).
  - Do NOT mount `InterviewScheduleModal` / `OfferLetterModal` (the two `{interviewOpen && …}` / `{offerOpen && …}` blocks at lines 259-274).
  - Everything else (profile header, Contact, Skills, About, Job Preferences, Cover Letter, Hiring Progress) renders unchanged.
- `handleStatusChange` and the `useApplications()` hook stay as-is (they're only reachable via the hidden buttons).

- [ ] **Step 1: Failing test.** In `CandidateDetailDrawer.test.tsx` add a `readOnly` render helper (pass `readOnly={true}`) and a case:
  - After candidate loads: `Mark reviewing`, `Schedule Interview`, `Make offer`, and `Reject` buttons are NOT in the document, while `Jane Doe` (header) and the cover letter text are still present.
  - Existing helper `renderDrawer` gains an optional `readOnly` param defaulting to `false` so the existing two tests stay green.
- [ ] **Step 2: Implement.** In `CandidateDetailDrawer.tsx`:
  - Add `readOnly = false` to the destructured props (line 42-47).
  - Wrap the Actions Section: `{!readOnly && (<Section title="Actions"> … </Section>)}`.
  - Wrap the two modals: `{!readOnly && interviewOpen && (…)}` and `{!readOnly && offerOpen && (…)}`.
- [ ] **Step 3: Verify.** `npm run test:run`, `npm run lint`, `npm run build`.
- [ ] **Step 4: Commit.** `git add src/components/candidate/CandidateDetailDrawer.tsx src/components/candidate/__tests__/CandidateDetailDrawer.test.tsx`; message `feat(candidate): add readOnly mode to CandidateDetailDrawer`.

---

### Task B4: `ApplicantsTab` — permission-gated actions

**Files:**
- Modify: `src/components/employer-dashboard/ApplicantsTab.tsx`
- Modify: `src/components/employer-dashboard/__tests__/ApplicantsTab.test.tsx`

**Interfaces:**
- Consumes: `useAuth` from `../../context/AuthContext`, `canManageApplications` from `../../utils/permissions`.
- `const canManage = canManageApplications(user)`.
- The four mutation buttons (`Mark reviewing`, `Schedule Interview`, `Make offer`, `Reject`, lines 107-138) each gain a `canManage &&` guard.
- The two modals (lines 157-172) each gain a `canManage &&` guard.
- `CandidateDetailDrawer` gets `readOnly={!canManage}`.
- `View profile` and `Portfolio →` remain always visible.
- `handleStatusChange`/`updateContextStatus` stay (referenced by the gated buttons) so there is no unused-variable lint error.

- [ ] **Step 1: Failing tests.** In `ApplicantsTab.test.tsx`:
  - Add a `useAuth` mock. The tab now calls `useAuth()`; the test must provide it. Add at top:
    ```ts
    vi.mock('../../../context/AuthContext', () => ({
      useAuth: vi.fn(),
    }))
    ```
    and import `useAuth` from `'../../../context/AuthContext'` so it can be overridden with `vi.mocked(useAuth).mockReturnValue(...)`.
  - Extend the existing `vi.mocked(useApplications).mockReturnValue(...)` objects with whatever fields `ApplicantsTab` destructures (currently `applications`, `updateApplicationStatus` — keep those).
  - Default `useAuth` in a helper to `{ user: { role: 'employer', permissions: [] } }` so the existing three tests stay green (no action buttons expected there).
  - New case A (canManage true): `useAuth` → `{ user: { role: 'employer', permissions: ['application:update'] } }`; assert `Mark reviewing` button is present.
  - New case B (canManage false): `useAuth` → `{ user: { role: 'employer', permissions: [] } }`; assert `Mark reviewing` and `Make offer` are NOT present but `View profile` IS present.
- [ ] **Step 2: Implement.** In `ApplicantsTab.tsx`:
  - Add imports and `const { user } = useAuth()` + `const canManage = canManageApplications(user)`.
  - Add `canManage &&` guards to the four buttons and the two modals.
  - Add `readOnly={!canManage}` to `CandidateDetailDrawer`.
- [ ] **Step 3: Verify.** `npm run test:run`, `npm run lint`, `npm run build`.
- [ ] **Step 4: Commit.** `git add src/components/employer-dashboard/ApplicantsTab.tsx src/components/employer-dashboard/__tests__/ApplicantsTab.test.tsx`; message `feat(employers): gate pipeline actions on application:update permission`.

---

### Task B5: Admin API layer + `EmployerPermissionsDialog`

**Files:**
- Modify: `src/api/admin.ts`
- Create: `src/components/admin/EmployerPermissionsDialog.tsx`
- Create: `src/components/admin/__tests__/EmployerPermissionsDialog.test.tsx`

**Interfaces (all in `src/api/admin.ts`, using `apiGet/apiPut/apiPost/apiDelete` from `./client`):**
- Types:
  - `Role { id: string; name: string; description: string | null; capabilities: string[] }`
  - `RoleBinding { id: string; roleId: string; userId: string; contextType: string; contextId: string | null; expiresAt: string | null; createdAt: string; role?: Role }`
- Functions:
  - `listRoles(): Promise<Role[]>` — `GET /roles`
  - `listRoleBindings(): Promise<RoleBinding[]>` — `GET /roles/bindings` (backend returns all; the dialog filters by `userId`)
  - `updateRoleCapabilities(roleId: string, capabilities: string[]): Promise<Role>` — `PUT /roles/${roleId}` with `{ capabilities }`
  - `createRoleBinding(roleId: string, userId: string): Promise<RoleBinding>` — `POST /roles/${roleId}/bindings` with `{ userId }`
  - `deleteRoleBinding(bindingId: string): Promise<void>` — `DELETE /roles/bindings/${bindingId}`
- The response envelope is `{ success, data }` (see `apiFetch`), so each function returns `res.data` (e.g., `const res = await apiGet<Role[]>('/roles'); return res.data`).

**Dialog spec (`EmployerPermissionsDialog.tsx`):**
- Props: `{ employer: AdminEmployer; open: boolean; onOpenChange: (open: boolean) => void }`.
- Mirror the admin modal conventions used elsewhere in the app (Radix Dialog + framer-motion AnimatePresence, like `CandidateDetailDrawer`'s overlay/content), plus `useToast` for success/error feedback and loading/error states.
- On `open`, load `listRoles()` + `listRoleBindings()` in parallel (Promise.all). Filter bindings to `employer.id`.
- **Bindings list**: for each binding of the employer, render the role `name` + capability list + a Remove button → `deleteRoleBinding(bindingId)` then refetch. Empty state text when none.
- **Grant role**: a `<select>` of roles from `listRoles()` **excluding** `admin`, plus a Bind button → `createRoleBinding(roleId, employer.id)` then refetch. Disable Bind when no role selected.
- **Employer role capabilities** (only render when the employer has the `employer` role bound): a checkbox list over the catalog constant:
  ```ts
  const EMPLOYER_CAPABILITIES = [
    'job:create', 'job:read', 'job:update', 'job:delete', 'job:list',
    'application:create', 'application:read', 'application:update', 'application:delete', 'application:list',
    'user:read',
  ]
  ```
  Also render any capability on the role not in the catalog (as checked, non-editable or editable — but ALWAYS included in the save payload) so a save never drops unknown caps. Save → `updateRoleCapabilities(roleId, selected)` then refetch.
- After every mutation: refetch roles + bindings.

- [ ] **Step 1: API layer.** Implement the five functions + two types in `src/api/admin.ts`. Do NOT remove `listAdminApplications`/`listAdminEmployers`/`AdminEmployer`.
- [ ] **Step 2: Dialog component.** Implement `EmployerPermissionsDialog.tsx` per the spec.
- [ ] **Step 3: Tests** (`EmployerPermissionsDialog.test.tsx`). Mock `../../api/admin` (path from `src/components/admin/__tests__/` → `../../api/admin`). Render within a `ToastProvider`. Cases:
  - renders the employer's current bindings (role name) and the grant role select
  - grant flow: select a role, click Bind → `createRoleBinding` called with `(roleId, employer.id)`
  - remove flow: click Remove on a binding → `deleteRoleBinding` called with the binding id
  - capability save: toggle a capability, click Save → `updateRoleCapabilities` called with `(roleId, [...])` preserving the unknown capability
  - refetch after mutation: assert `listRoles`/`listRoleBindings` invoked again after a grant/remove/save
- [ ] **Step 4: Verify.** `npm run test:run`, `npm run lint`, `npm run build`.
- [ ] **Step 5: Commit.** `git add src/api/admin.ts src/components/admin/EmployerPermissionsDialog.tsx src/components/admin/__tests__/EmployerPermissionsDialog.test.tsx`; message `feat(admin): employer permission management dialog + RBAC admin API`.

---

### Task B6: Wire the dialog into the admin Employers tab

**Files:**
- Modify: `src/components/admin/AdminPage.tsx`

**Interfaces:**
- `AdminEmployersList` gains a `permissionsEmployer: AdminEmployer | null` state and a "Manage permissions" button on each employer row (next to the `{emp._count.jobListings} jobs` badge area), opening `EmployerPermissionsDialog` for that employer.
- Render `{permissionsEmployer && <EmployerPermissionsDialog employer={permissionsEmployer} open={!!permissionsEmployer} onOpenChange={(open) => { if (!open) setPermissionsEmployer(null) }} />}`.
- Keep `AdminApplicationsList` untouched. No admin `AdminPage.test.tsx` exists — do not create one unless needed; the dialog test covers the component behavior.

- [ ] **Step 1: Change the code.** Add the import, state, button, and dialog rendering to `AdminEmployersList` in `AdminPage.tsx`.
- [ ] **Step 2: Verify.** `npm run test:run`, `npm run lint`, `npm run build`.
- [ ] **Step 3: Commit.** `git add src/components/admin/AdminPage.tsx`; message `feat(admin): add Manage permissions action to employer rows`.

---

## Task B7: Final whole-branch review + status

- [ ] **Step 1:** Run full verification: `npm run test:run`, `npm run lint`, `npm run build` from `hirehub-frontend/`.
- [ ] **Step 2:** Dispatch an independent final reviewer (subagent-driven-development review template) over the diff of Tasks B1-B6 with this plan as spec. Reviewer verifies: employer `ApplicationsContext` uses the employer endpoint and refetches on user change; `canManageApplications` matches the backend's `application:update` semantics (admin always true); all employer mutation affordances (tab + drawer) are gated; drawer `readOnly` hides Actions + modals only; admin dialog hits the correct endpoints and preserves unknown capabilities; no `git add -A` used; only named files in commits.
- [ ] **Step 3:** Triage findings; fix blocking ones in follow-up commits.
- [ ] **Step 4:** Update `.superpowers/sdd/progress.md` with a section for this plan (after each task, not just at the end).

## Wrap-Up

Per-feature commits as specified per task. No `git add -A` anywhere. E2E behavior depends on the backend plan being deployed in lockstep (backend exposes `permissions` + `application:update`-gated routes; frontend consumes them). The admin grant UI is the control surface that lets an admin decide whether an employer may act on applications.
