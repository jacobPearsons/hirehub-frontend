# Web Push Notifications — Design Spec

## Overview

Add real web push (browser) notifications to HireHub so candidates receive a system notification when their application status changes (e.g., moved to "Under review"), even when the tab is closed. Today HireHub already has in-app SSE notifications + Resend email; the FAQ over-claims "push notification" — this closes that gap end to end: backend subscription store + VAPID-signed sends, a frontend Service Worker, and a one-time permission prompt on login.

Reference: `changes.md` line 2.

## Goals

1. Candidate is asked for browser notification permission once, on login (auto-prompt when the browser permission is still undecided).
2. Every notification created via the backend notifications service also triggers a web push when the user has granted permission.
3. Clicking the notification opens the relevant dashboard surface (applications tab, or the specific conversation).
4. Stale subscriptions are cleaned up automatically on send failure.
5. FAQ claim becomes truthful ("browser push notification").
6. Graceful no-op when VAPID keys are not configured (dev default), matching the existing Resend pattern.

## Non-Goals

- In-app notification changes (SSE inbox already works — untouched).
- Sending pushes for arbitrary custom events beyond what `createForUser` already emits.
- iOS Safari push (not supported by Safari on iOS; the feature degrades gracefully — permission stays "unsupported").
- Notification preferences UI beyond a single enable/disable affordance.

## Constraints

- Backend: Express 4 (ESM) + Prisma 5 + PostgreSQL. Modules follow routes → controller → service with `requireAuth` and a barrel `index.ts`, registered in `src/app/app.ts`.
- Frontend: React + Vite + TS. Vite serves `public/` at root (a static `public/sw.js` needs no plugin). API client helpers in `src/api/client.ts`. SSE auth passes the JWT via `?token=` for `EventSource`.
- Web Push requires a secure context — HTTPS in production, `localhost` in dev. VAPID keys come from env.
- Best-effort sending: never fail the request that created the notification because a push failed.

---

## Backend

### Data model (Prisma)

Add to `prisma/schema.prisma` (link into the existing `User` model relations):

```prisma
model PushSubscription {
  id        String   @id @default(cuid())
  userId    String
  endpoint  String   @unique
  p256dh    String
  auth      String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

Add `pushSubscriptions PushSubscription[]` to `User`. Run one migration.

### New module `src/modules/push/`

**`push.service.ts`**
- `subscribe(userId, { endpoint, p256dh, auth })` — upsert keyed on `endpoint`.
- `unsubscribe(userId, endpoint)` — delete scoped to user.
- `sendPush(userId, { title, body, url })` — load the user's subscriptions; for each, `webPush.sendNotification(sub, JSON.stringify({ title, body, url }), { TTL: 86400 })`. On 404/410 delete the stale row; on other errors log and continue. Return early with a log when `VAPID_PRIVATE_KEY` is absent (no-op).
- VAPID config read once from `env.VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` (default `mailto:hello@hirehub.com`).

**`push.controller.ts`** + **`push.routes.ts`**
- `POST /api/push/subscribe` — `requireAuth`, zod-validate `{ endpoint, p256dh, auth }` (strings, non-empty).
- `DELETE /api/push/unsubscribe` — `requireAuth`, body `{ endpoint }`.

Register `pushRouter` in `src/app/app.ts`.

### Hook into notification creation

`src/modules/notifications/notifications.service.ts#createForUser` — after creating the Prisma row and calling `sendToUser(userId, 'notification', notification)`, fire:

```ts
pushService.sendPush(userId, {
  title: notification.title,
  body: notification.body,
  url: pushUrlFor(notification),
}).catch(() => {})
```

`pushUrlFor(notification)` derives the deep link:
- `APPLICATION_STATUS` → `/dashboard?tab=applications`
- `NEW_MESSAGE` with `data.conversationId` → `/dashboard?tab=messages&conv=<id>`
- default → `/dashboard`

### Config

- `.env.example`: add `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` with a comment (`npx web-push generate-vapid-keys`).
- Backend README: short "Push notifications" section.

---

## Frontend

### `public/sw.js`

Minimal service worker:
- `install` → `skipWaiting()`, `activate` → `clients.claim()`.
- `push` event → `self.registration.showNotification(title, { body, icon: '/favicon.svg' or existing mark, data: { url } })`.
- `notificationclick` → `clients.openWindow(url)` (or focus existing window) then close the notification.
- No offline caching (out of scope) — just intercept push/click.

### `src/lib/push.ts`

- `isPushSupported()` — `'serviceWorker' in navigator && 'PushManager' in window`.
- `registerPushServiceWorker()` — `navigator.serviceWorker.register('/sw.js')`, cache the registration module-level.
- `getVapidPublicKey()` — `import.meta.env.VITE_VAPID_PUBLIC_KEY` (may be `undefined`).
- `subscribeUserToPush()` — permission check; `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) })`; `POST /api/push/subscribe`. Skip (info log) if no VAPID key configured.
- `unsubscribeUserFromPush()` — find existing subscription, `unsubscribe()` + `DELETE /api/push/unsubscribe`.
- Helper `urlBase64ToUint8Array` (standard conversion, local util).

### Registration + auto-prompt on login

- `src/main.tsx`: on startup, if `isPushSupported()`, register the service worker (idempotent).
- In the auth/login success path (where the app sets the user after login): call `enablePushIfUndecided()`:
  - If `Notification.permission === 'default'` and supported → `subscribeUserToPush()` (this surfaces the browser prompt, satisfying "when prompted").
  - If `'denied'` → do nothing (never nag; browser retains the choice).
  - Wrap in try/catch; failures log silently — never break login.

### NotificationBell affordance

In `src/components/layout/NotificationBell.tsx` dropdown:
- Permission `default` + supported → button "Enable browser notifications" → `subscribeUserToPush()`.
- Permission `granted` → subtle "Notifications enabled" label (non-actionable).
- Unsupported or `denied` → no row.

### FAQ correction

`src/components/faq/faqData.ts` line 26 — keep the sentence (now true) but word it "browser push notification".

---

## Error handling

- Push send failures never throw into notification creation (wrapped in `.catch(() => {})` + logging).
- Stale subscription (404/410) → delete row, continue with remaining.
- Missing VAPID keys → no-op with one log line (dev default).
- Frontend subscribe failures → silent catch + info log; the bell affordance stays available for retry.
- Subscription endpoint zod validation rejects malformed payloads with 400.

## Testing

- Backend: focused test on `push.service.ts` — subscribe upsert, unsubscribe scoping, stale-subscription deletion on 404/410 (mock `webPush.sendNotification`), no-op without keys. Follow existing test runner used by the backend.
- Frontend: unit test `urlBase64ToUint8Array`; `src/lib/push.ts` helpers with mocked `pushManager`/`serviceWorker`. Manual E2E: grant permission → trigger a status change in the backend → system notification appears → click routes to applications tab.
- Full build + lint on both apps.

---

## File map

Backend:
- `prisma/schema.prisma` (+ migration)
- `src/modules/push/index.ts`, `push.routes.ts`, `push.controller.ts`, `push.service.ts`
- `src/modules/notifications/notifications.service.ts` (hook)
- `.env.example`, README

Frontend:
- `public/sw.js`
- `src/lib/push.ts`
- `src/main.tsx` (SW registration)
- auth/login success path (auto-prompt)
- `src/components/layout/NotificationBell.tsx`
- `src/components/faq/faqData.ts`
