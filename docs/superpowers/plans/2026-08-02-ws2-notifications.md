# Plan: WS2 — In-app Notifications (bell + live toast)

Date: 2026-08-02
Repos: `hirehub-backend` (Express + Prisma + PostgreSQL, NOT committed) and
`hirehub-frontend` (React 19.2, Vite 8, TS ~6.0, React Router 7.18, Tailwind 3,
Vitest 4 + RTL, @radix-ui/react-dialog).
Backlog: `/home/jacobp/Desktop/Projecs/changes.md` item #2 — notify candidate
when their application status changes (approved scope: in-app bell + live toast
via SSE; NO email changes).
Execution: subagent-driven development (fresh implementer per task, TDD). Per
the user's instruction, skip per-task review; run spec review + code-quality
review collectively AFTER all tasks, then fix, verify, and commit on the
frontend repo.

## Ground rules

- Work on branch `feat/onboarding-wizard` in the frontend repo; leave untracked
  files (`errors.md`, existing plan docs) intact. Backend repo is read/write for
  implementation but must NOT be committed.
- TDD per task: write/run the failing test first, then implement, then green.
- Frontend verification: `npm run test:run` (unit), `npm run build`
  (`tsc -b && vite build`), `npm run lint`.
- Backend verification: `npm test` (vitest), `npm run build` (tsc).
- Frontend test conventions: `vi.mock('<module>', () => ...)` for api/context
  modules, wrap in `MemoryRouter` + `ToastProvider` + `AppProvider` as needed,
  mock `useApp`/`useToast`/`usePageMeta`. Tests live next to components in
  `__tests__/`. Global `describe/it/vi/expect` (vitest `globals: true`).
- Backend test conventions (`src/tests/notifications.test.ts`): register users
  via `POST /api/auth/register`, capture `data.accessToken`, use
  `.set('Authorization', \`Bearer ${token}\`)`, clean up created rows in
  `afterAll` with `prisma.<model>.deleteMany`. See `src/tests/applications.test.ts`.
- Commit style (frontend only): imperative, e.g. `feat(notifications): add bell and live toast`.
- Do NOT weaken `requireAuth` globally: the SSE stream token-via-query support
  is a separate middleware used only on the stream route.

## Key design decisions

1. **Notification model** (`prisma/schema.prisma`): `id` (cuid), `userId` (FK →
   User, cascade), `type` (enum `NotificationType`: `APPLICATION_STATUS`,
   `NEW_MESSAGE`, `SYSTEM`), `title`, `body`, `data` (Json?), `read` (Boolean
   default false), `createdAt`. `@@index([userId, createdAt])` and
   `@@index([userId, read])`. Add `notifications Notification[]` to the User model.
2. **Endpoints** (all `requireAuth`, on `notificationsRouter`):
   - `GET /api/notifications` → `{ success: true, data: { items, unreadCount } }`,
     items newest-first.
   - `POST /api/notifications/:id/read` → `success(res, notification)`.
   - `POST /api/notifications/read-all` → `success(res, { count })`.
   - `GET /api/notifications/stream` stays (SSE), but its auth switches to a new
     `requireAuthQuery` middleware (Bearer header OR `?token=` query param) so
     `EventSource` (which cannot send headers) can connect.
3. **`requireAuthQuery`** in `src/middleware/auth.ts`: identical to `requireAuth`
   but falls back to `req.query.token` when no Bearer header. Used ONLY on the
   stream route.
4. **Status-change hook**: in `ApplicationsService.updateStatus`
   (`src/modules/applications/applications.service.ts:42-56`), after
   `repo.updateStatus` succeeds, create a Notification for the candidate
   (`application.userId`) with `type: 'APPLICATION_STATUS'`, title
   `'Application status updated'`, body
   `Your application for ${application.job.title} is now ${status}.`, and
   `data: { applicationId, status, jobId }`, then push it over SSE via
   `sendToUser(userId, 'notification', notification)`. Notification creation
   must be fire-and-forget-safe (like the existing `.catch(() => {})` email) so
   a failure never fails the status update. Do NOT change the email call.
5. **SSE payload**: the created Notification row serialized by Prisma. Frontend
   listens for the `'notification'` event name.
6. **Frontend**:
   - `src/api/notifications.ts`: `listNotifications()`, `markNotificationRead(id)`,
     `markAllNotificationsRead()`. Types exported from `src/types/notification.ts`.
   - `src/context/NotificationsContext.tsx`: on user login (and on mount when a
     user exists) fetch the list; open an `EventSource` at
     `\`${API_BASE}/notifications/stream?token=${getAccessToken()}\``; on a
     `'notification'` event prepend it, increment unread, and
     `showToast('info', notification.title)`; expose `notifications`,
     `unreadCount`, `markRead`, `markAllRead`, `refresh`.
     API_BASE must be exported from `src/api/client.ts` (currently module-private).
   - Provider placement: `NotificationsProvider` goes INSIDE `ToastProvider` in
     `App.tsx` (so it can use both `useToast` and `useApp`; `AppProvider` sits
     above `<App/>` in `main.tsx`, so `useApp` is available there).
   - `src/components/layout/NotificationBell.tsx`: bell icon + unread badge;
     dropdown panel listing notifications (title/body/time, unread dot); clicking
     an item marks it read; a "Mark all read" button; empty state. Placed in the
     `Infobar` (dashboard chrome) and the logged-in section of `Navbar`
     (desktop + mobile).
   - Live events already existing (`new-message`) are left untouched.

## Backend tasks

### Task 1 — Notification model + migration

`hirehub-backend` only (no commit).

1. Add `enum NotificationType` and `model Notification` to
   `prisma/schema.prisma` (see Key design decisions #1). Add the `notifications`
   relation to `User`.
2. Run `npx prisma migrate dev --name add_notifications` (creates + applies the
   migration and regenerates the client) or `npx prisma db push` if a dev DB
   migration is inconvenient — implementer should pick what works in this repo
   (`prisma/migrations/` is used; prefer `migrate dev`). Verify
   `npx prisma generate` ran and `npm run build` is green.
3. No unit test needed for a schema-only change; gate = `npm run build` + prisma
   generate success.

### Task 2 — requireAuthQuery + notifications CRUD endpoints

TDD: `npm test -- src/tests/notifications.test.ts`.

1. `src/middleware/auth.ts` — add `export function requireAuthQuery(...)`.
2. `src/modules/notifications/notifications.service.ts` — add:
   - `createForUser(userId, { type, title, body, data })` → prisma create; if the
     recipient has an SSE client, `sendToUser(userId, 'notification', notification)`;
     return the row.
   - `listForUser(userId)` → findMany where userId, orderBy createdAt desc.
   - `markRead(id, userId)` → updateMany where {id, userId} set read true; throw
     NotFoundError if count 0; return updated row.
   - `markAllRead(userId)` → updateMany where {userId, read: false} set read true;
     return `{ count }`.
   Keep the existing `notifyNewMessage` unchanged.
3. `src/modules/notifications/notifications.controller.ts` — add
   `listNotifications`, `markNotificationRead`, `markAllNotificationsRead` using
   the `success` helper from `../../lib/response` (envelope `{ success, data }`).
   Use `req.user!.userId`.
4. `src/modules/notifications/notifications.routes.ts` — add the three routes;
   switch the stream route's middleware from `requireAuth` to `requireAuthQuery`.

Tests (`src/tests/notifications.test.ts`):
- Register a seeker + employer; employer creates a job; seeker applies;
  seed a notification via `prisma.notification.create` (or via the service).
- `GET /api/notifications` (seeker token) returns the item and `unreadCount`.
- `GET /api/notifications` with employer token returns `[]`/no cross-user leak.
- `POST /api/notifications/:id/read` flips `read` to true.
- `POST /api/notifications/read-all` clears unread; `unreadCount` becomes 0.
- `GET /api/notifications/stream` with `?token=` query param returns 200 (assert
  status + content-type `text/event-stream`; close/abort the request afterwards
  to avoid hanging — implementer should use a timeout/abort pattern). Also
  assert 401 without any token.

### Task 3 — Hook status changes into notifications

TDD: extend `src/tests/notifications.test.ts` with a flow test.

1. `src/modules/applications/applications.service.ts` `updateStatus` — after
   `repo.updateStatus` and alongside the existing email call, create a
   notification for `application.userId` (see Key design decisions #4). Wrap the
   create+SSE call in `.catch(() => {})` or try/catch so it never breaks the
   status update.

Test: employer updates the seeker's application status via
`PATCH /api/applications/:id/status` (body `{ status: 'REVIEWING' }`) → then
`GET /api/notifications` with the seeker token returns one notification with
`type: 'APPLICATION_STATUS'`, body containing the job title, `read: false`.

Gate: full `npm test` green, `npm run build` green.

## Frontend tasks

### Task 4 — api module + types

TDD: `npm run test:run`.

1. `src/api/client.ts` — export `API_BASE` (change `const` → `export const`).
2. `src/types/notification.ts` — `NotificationType`, `Notification` interface
   (`id, type, title, body, data?: unknown, read: boolean, createdAt: string`).
3. `src/api/notifications.ts` — `listNotifications`, `markNotificationRead`,
   `markAllNotificationsRead` using `apiGet`/`apiPost` from `./client`. Follow
   the `applications.ts` module pattern (return `{ ...res, data }`).
4. Export `./notifications` from `src/api/index.ts`.

Unit tests optional here (thin wrappers); if added, mock `./client`. Gate is
`npm run build`.

### Task 5 — NotificationsContext + live SSE toast

TDD: `npm run test:run -- NotificationsContext`.

1. `src/context/NotificationsContext.tsx` — provider + `useNotifications()` hook
   (mirror `ApplicationsContext` style: `createContext`, `useEffect` init,
   `useMemo` value, eslint-disable for the hook export). Behaviors per Key design
   decisions #6.
2. Mount `NotificationsProvider` inside `ToastProvider` in `App.tsx` wrapping the
   existing `<Suspense>...</Suspense>` content. Also wrap with it in tests.
3. SSE lifecycle: open `EventSource` only when a user is logged in; close on
   logout/unmount. On `error`, let native reconnection run; on reconnect re-read
   `getAccessToken()` (i.e., build the URL at open time and reopen if token
   changes — keep it simple: reopen on error with the current token).

Tests (`src/context/__tests__/NotificationsContext.test.tsx`):
- Mock `../api/notifications` (`listNotifications` resolves one unread item) and
  `../components/ui/Toast` `useToast` (`showToast: vi.fn()`); mock `useApp` to
  return a logged-in user. Render a consumer; assert the unread item is exposed.
- Mock the `EventSource` global (a tiny stub class capturing the URL + an
  `on<event>` map) → assert the URL contains `/notifications/stream?token=`;
  dispatch a synthetic `'notification'` event → assert `showToast` was called and
  the item is prepended/unreadCount updated.
- Assert logout/unmount closes the EventSource.

### Task 6 — NotificationBell component + wiring

TDD: `npm run test:run -- NotificationBell`.

1. `src/components/layout/NotificationBell.tsx` — per Key design decisions #6.
   Use `useNotifications()` + `useToast()`. Reuse the `motion`/`AnimatePresence`
   patterns from `Toast.tsx` and `@radix-ui/react-dialog` or plain state for the
   dropdown. Style with existing design tokens (`bg-surface-1`, `border-hairline`,
   `text-ink`, `text-accent`, etc.).
2. Add `<NotificationBell />` to `Infobar.tsx` (before `ThemeToggle`) and to the
   logged-in section of `Navbar.tsx` (desktop area and mobile menu).
3. Export from `src/components/layout/` index if one exists; otherwise direct
   imports.

Tests (`src/components/layout/__tests__/NotificationBell.test.tsx`):
- Mock `useNotifications` (items incl. one unread, `markRead`, `markAllRead` fns)
  and `useToast`. Render in `MemoryRouter` + `ToastProvider`.
- Bell shows the unread count badge; opening the panel lists titles; clicking an
  item calls `markRead(id)`; "Mark all read" calls `markAllRead`; empty state
  renders when no items.

### Task 7 — Final gate (both repos)

- Backend: `npm test` (all suites), `npm run build`.
- Frontend: `npm run test:run`, `npm run build`, `npm run lint`.
- Manual smoke (if servers up): employer changes an application status while the
  candidate is logged in → live toast appears and the bell badge increments;
  refreshing shows the notification in the bell with unread state; mark-read and
  mark-all-read persist.

## Review + commit (after all tasks)

Per user instruction: run ONE spec review and ONE code-quality review pass
collectively across all finished tasks, fix findings, re-run gates, then commit
on the frontend repo (backend not committed). Suggested commits:
1. `feat(notifications): add bell with unread badge and mark-read` (context +
   bell + api module + types).
2. `feat(notifications): live toast on application status changes` (SSE wiring,
   if cleanly separable — otherwise single commit).
