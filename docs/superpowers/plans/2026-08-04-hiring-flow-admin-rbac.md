# Hiring-Flow ADMIN Restriction + Admin-Managed Employer Permissions

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restrict all hiring-flow *mutations* (status changes, interview/offer data) to HireHub admins (ADMIN) — employers become view-only on their applicants — and give admins the ability to manage employer permissions through the existing RBAC machinery (role bindings + employer-role capabilities).

**Architecture:** Two repos change in lockstep. Backend: `PATCH /applications/:id/status` becomes ADMIN-only at the route level; `updateHiringData` (interview/offer/preboarding/orientation) keeps SEEKER-own self-service but denies EMPLOYER; the `GET /roles` + `GET /roles/:id` RBAC read routes get auth/admin gating. Frontend: the employer `ApplicantsTab` becomes read-only (no review/interview/offer/reject buttons; `CandidateDetailDrawer` gains a `readOnly` prop), and the admin applications view keeps full action power. A new admin "Manage permissions" dialog on the Employers tab uses the existing RBAC endpoints (`GET/PUT /roles`, `POST /roles/:id/bindings`, `DELETE /roles/bindings/:bindingId`, `GET /roles/bindings`) to grant/revoke employer role bindings and edit the employer role's capabilities.

**Tech Stack:** Express 4 + Prisma + zod (backend), React 18 + TypeScript + Radix Dialog + framer-motion + Vitest + RTL (frontend).

## Global Constraints

- Backend on branch `feat/onboarding-wizard`, frontend on branch `main`. Commit directly in each repo; never create/switch branches, never worktree.
- **Never run `git add -A` / `git add .`** — both working trees contain pre-existing uncommitted agent artifacts. Stage only the exact files each task names.
- Backend test command (from `hirehub-backend/`): `npm test` (vitest run). Frontend gates (from `hirehub-frontend/`): `npm run lint` (0 errors), `npm run test:run` (all pass), `npm run build`.
- Wire statuses are UPPERCASE (`APPLIED`, `REVIEWING`, `INTERVIEWING`, `REJECTED`, `OFFER`); the frontend lowercases them via `normalizeApplication` in `src/api/applications.ts`.
- Authorization errors are 403 (`AuthorizationError`), missing tokens 401 (`AuthenticationError`), missing records 404 (`NotFoundError`).
- `applications.service.ts` currently has **pre-existing uncommitted changes** (notificationsService call in `updateStatus`). Preserve them; only touch the auth-guard lines this plan names.
- Frontend role strings lowercase (`'seeker'|'employer'|'admin'`); backend UPPERCASE. Backend also has an RBAC layer (`src/modules/rbac/*`) where roles are `admin`/`employer`/`seeker` lowercase rows with `capabilities[]`; role **bindings** are per-user grants. Seed employer capabilities: `job:create/read/update/delete/list`, `application:read/update/list`, `user:read`.
- `requirePermission(action)` (`src/middleware/permission.ts`) is async and exists but is **currently unused by any route**. Decision: do NOT adopt it for this plan (routes use `requireRole('ADMIN')` which is simpler and matches the existing role-seed model). Capability editing via the admin UI mutates the `employer` role row that `requireRole`/JWT role checks do not read today — it is configuration surface for future permission-gated features, and its primary usable effect is the role bindings (which users must have been granted an ADMIN binding for; admins are ADMIN by `role` column).

---

### Task 3: Backend — hiring-flow mutations ADMIN-only

**Files:**
- Modify: `hirehub-backend/src/modules/applications/applications.routes.ts` (~line 28)
- Modify: `hirehub-backend/src/modules/applications/applications.service.ts` (updateStatus guard ~line 42, updateHiringData guard ~line 70)
- Modify: `hirehub-backend/src/tests/applications-hiring-flow.test.ts` (existing; has an employer-status-update test and candidate-GET tests, but no hiring-data tests yet — those are added here)

**Interfaces:**
- Consumes: existing `requireAuth`, `requireRole` from `src/middleware/auth.ts`; `AuthorizationError`.
- Produces: `PATCH /api/applications/:id/status` now `requireRole('ADMIN')` only (was `requireRole('EMPLOYER','ADMIN')`). `ApplicationsService.updateStatus(id, status, userId, userRole)` guard tightened to `if (userRole !== 'ADMIN') throw new AuthorizationError(...)` — keep the `(id, status, userId, userRole)` signature (userId stays, now unused) to avoid controller churn. `ApplicationsService.updateHiringData(userId, applicationId, data, userRole)` branch changed: SEEKER path keeps the own-application check; every non-SEEKER, non-ADMIN caller gets 403 (EMPLOYER now denied).

- [ ] **Step 1: Write/update the failing tests**
  - In `applications-hiring-flow.test.ts`, the existing test that asserts an owning EMPLOYER may update application status must be flipped to assert **403** (owning employer now forbidden). Rename to reflect "forbids the owning EMPLOYER".
  - Add cases in the same file's hiring-data describe block:
    - owning EMPLOYER updating hiring data → 403
    - non-owning EMPLOYER updating hiring data → 403
    - SEEKER updating own hiring data → 200 (self-service onboarding preserved)
    - ADMIN updating any application's status + hiring data → 200
    - unauthenticated status update → 401
- [ ] **Step 2: Route change** — `applications.routes.ts`: `router.patch('/applications/:id/status', requireAuth, requireRole('ADMIN'), ...)`.
- [ ] **Step 3: Service guard changes** (see Interfaces above). Do not touch anything else in the file (there are uncommitted pre-existing changes).
- [ ] **Step 4: Verify** — `npm test` from `hirehub-backend/` (all pass, including the flipped + new cases). `npx tsc --noEmit` clean.
- [ ] **Step 5: Commit** — `git add` exactly the three files; message `feat(auth): restrict hiring-flow status + hiring-data mutations to ADMIN`.

---

### Task 4: Frontend — employer applicants view-only

**Files:**
- Modify: `hirehub-frontend/src/components/candidate/CandidateDetailDrawer.tsx`
- Modify: `hirehub-frontend/src/components/candidate/__tests__/CandidateDetailDrawer.test.tsx`
- Modify: `hirehub-frontend/src/components/employer-dashboard/ApplicantsTab.tsx`

**Interfaces:**
- `CandidateDetailDrawer` gains optional `readOnly?: boolean` (default `false`). When `readOnly`:
  - do NOT render the `<Section title="Actions">` block (the status buttons);
  - do NOT mount `InterviewScheduleModal` / `OfferLetterModal` (remove the buttons that open them);
  - everything else (profile, resume, hiring-progress read-only) renders unchanged.
- `ApplicantsTab` passes `readOnly` to the drawer. Remove the `Mark reviewing`, `Schedule Interview`, `Make offer`, `Reject` buttons and the now-unused `updateApplicationStatus` / modal wiring. Keep the `View profile` affordance.

- [ ] **Step 1: Failing tests** — extend `CandidateDetailDrawer.test.tsx` with a `readOnly` case: no action buttons rendered, other sections still present. Update `ApplicantsTab.test.tsx` only if it referenced removed buttons (existing test does not — it asserts applicant rows and empty state, keep those green; the `useApplications` mock may drop `updateApplicationStatus` if the tab no longer consumes it).
- [ ] **Step 2: Implement** `readOnly` prop + ApplicantsTab changes.
- [ ] **Step 3: Verify** — `npm run test:run`, `npm run lint`, `npm run build` from `hirehub-frontend/`.
- [ ] **Step 4: Commit** — `git add` exactly the three files; message `feat(employers): make applicants tab view-only (mutations stay with admin)`.

---

### Task 5: Admin-managed employer permissions (RBAC UI)

**Files (frontend):**
- Modify: `hirehub-frontend/src/api/admin.ts` (add role/binding API layer)
- Modify: `hirehub-frontend/src/components/admin/AdminPage.tsx` (Employers tab: "Manage permissions" per employer)
- Create: `hirehub-frontend/src/components/admin/EmployerPermissionsDialog.tsx` (modal: bindings + role-capability editor)
- Create: `hirehub-frontend/src/components/admin/__tests__/EmployerPermissionsDialog.test.tsx`
- Possibly: `hirehub-frontend/src/components/admin/__tests__/AdminPage.test.tsx` (only if it asserts Employers tab content that changes; keep existing tests green otherwise)

**Files (backend):**
- Modify: `hirehub-backend/src/modules/rbac/rbac.routes.ts` — add `requireAuth, requireRole('ADMIN')` to `GET /roles` and `GET /roles/:id`
- Create: `hirehub-backend/src/tests/rbac-gating.test.ts` (small: unauth GET /roles → 401; seeker/employer GET /roles → 403; admin GET /roles → 200)

**Interfaces (frontend, all in `src/api/admin.ts`, using existing `apiGet/apiPut/apiPost/apiDelete` from `src/api/client.ts`):**
- `Role { id: string; name: string; description: string | null; capabilities: string[] }`
- `RoleBinding { id: string; roleId: string; userId: string; contextType: string; contextId: string | null; expiresAt: string | null; createdAt: string; role?: Role }`
- `listRoles(): Promise<Role[]>`
- `listRoleBindings(): Promise<RoleBinding[]>` — backend `GET /roles/bindings` returns all; filter by `userId` client-side.
- `updateRoleCapabilities(roleId: string, capabilities: string[]): Promise<Role>`
- `createRoleBinding(roleId: string, userId: string): Promise<RoleBinding>` — `POST /roles/${roleId}/bindings` with `{ userId }`.
- `deleteRoleBinding(bindingId: string): Promise<void>`

**Dialog spec (`EmployerPermissionsDialog`):**
- Opened from a "Manage permissions" button on each row of the admin Employers tab; modal pattern matches existing admin dialogs (Radix Dialog + framer-motion + toast + loading/error states).
- Shows the employer's current bindings (from `listRoleBindings()`, filtered to `userId`): role name + capability list per binding, with a Remove control per binding (DELETE). Empty state text when none.
- "Grant role" section: a `<select>` of roles from `listRoles()` (exclude admin), Bind button → `createRoleBinding`.
- "Employer role capabilities" section (only when the employer has the `employer` role bound): checkbox list over a catalog constant of known capabilities — `job:create`, `job:read`, `job:update`, `job:delete`, `job:list`, `application:read`, `application:update`, `application:list`, `application:delete`, `application:create`, `user:read` — plus any capabilities on the role not in the catalog (render them too, so a save never drops unknown caps). Save → `updateRoleCapabilities`.
- After every mutation, refetch roles + bindings.

- [ ] **Step 1: Backend gating + tests** — gate the two read routes; write `rbac-gating.test.ts`; run `npm test` + `npx tsc --noEmit` in `hirehub-backend/`. Commit exactly the two backend files (message `feat(rbac): gate role read routes to ADMIN`).
- [ ] **Step 2: Frontend API layer** — `admin.ts` additions; no tests required here beyond the dialog test.
- [ ] **Step 3: Dialog component + tests** — implement `EmployerPermissionsDialog`; test: renders bindings + roles, grant flow calls `createRoleBinding`, remove flow calls `deleteRoleBinding`, capability save calls `updateRoleCapabilities` (mock the `api/admin` module).
- [ ] **Step 4: Wire into AdminPage** — "Manage permissions" button per employer row; dialog opens with employer info; keep existing AdminPage tests green.
- [ ] **Step 5: Verify + commit** — frontend `npm run test:run`, `npm run lint`, `npm run build`; commit frontend files as one commit (message `feat(admin): employer permission management via RBAC`).

---

### Task 6: Final whole-branch review + `changes.md` status report

- [ ] **Step 1:** Run full verification on both repos (frontend `test:run` + `lint` + `build`; backend `npm test` + `tsc --noEmit`).
- [ ] **Step 2:** Dispatch an independent final reviewer over the full diff of this plan's branch-spanning work (backend `feat/onboarding-wizard`, frontend `main`) using the subagent-driven-development review template, with this plan as the spec. Reviewer verifies: every mutation route is ADMIN-only; employer applicants surface is view-only with no residual mutation affordances; admin retains full actions; RBAC admin UI performs binding grant/revoke + capability edit against the correct endpoints; no `git add -A` was used; only planned files are in the commits.
- [ ] **Step 3:** Triage any findings; fix blocking ones in follow-up commits.
- [ ] **Step 4:** Write the per-item `changes.md` report — one line per `changes.md` item, status (`Done`/`Done (partial)`/`Deferred` + short note), referencing commits and the blog/PNG follow-ups.

## Wrap-Up

Per-feature commits as specified per task. No `git add -A` anywhere. Update `.superpowers/sdd/progress.md` with a section for this plan after each task. Note in the final report: employer capability edits via the UI update the `employer` role row for future permission-gated features; role bindings are the immediately effective admin-grant mechanism; the 5 blog cover PNGs from Task 2's prompts still need generating into `public/`.
