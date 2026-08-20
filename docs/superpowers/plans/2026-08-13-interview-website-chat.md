# Website Chat Interview (replaces In-Person) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `in-person` interview type with a **website-chat** type hosted on HireHub's existing messaging system. When an employer schedules a website-chat interview, the frontend (a) updates the application's `interviewData` via `updateApplicationInterview`, (b) calls the new backend endpoint `POST /api/applications/:id/interview-conversation` (see sibling plan `2026-08-13-interview-conversation.md`) to create/reuse the Conversation and seed the screening questions as the interview, and (c) navigates to `?tab=messages&conv=<id>` so both parties chat on-site. `InterviewDetails` renders the conversation as the interview (badge + CTA linking to Messages tab) instead of a `meetingLink`.

**Architecture:** Frontend already has a Messages module (`src/components/dashboard/MessagesTab.tsx`) with deep-link support via `requestedConvIdRef = useRef(searchParams.get('conv'))` (L38), a working navigation pattern in `PricingSection.tsx` (`navigate(\`${base}?tab=messages&conv=${conversationId}\`)`, base by role), and `updateApplicationInterview(id, details: InterviewDetails)` in `ApplicationsContext.tsx:12`. `useJob(id)` returns the job incl. `screeningQuestions`. Backend plan adds the endpoint this plan calls.

**Participant (confirmed):** Employer (schedules) + Candidate (interviews in chat). Both roles already share the same `MessagesTab`.

**Tech Stack:** React 19, react-hook-form + zod (already in `InterviewScheduleModal.tsx`), existing `apiPost`/`apiGet` client, existing `useToast`, EmailJS for the existing ack email.

## Global Constraints

- Follow existing module structure and DESIGN.md conventions (tokens, no `cn()`, `focus-visible:ring-2 focus-visible:ring-ink/30`, buttons default `type="button"`)
- Run frontend `npm run test:run`, `npm run build`, `npm run lint`
- No new npm packages
- Keep `phone` and `video` behavior unchanged — only swap `in-person` → `website-chat`
- Backend endpoint is out of scope here (sibling plan); frontend can be merged after both land, but the api call must fail gracefully if 404 (no blocking navigation)

---

### Task 1: Update the types

**Files:**
- Modify: `src/types/hiring-flow.ts`

- [ ] **Step 1: Replace `in-person` with `website-chat`**

In `src/types/hiring-flow.ts`:

```ts
export type InterviewType = 'phone' | 'video' | 'website-chat'
```

- [ ] **Step 2: Extend `InterviewDetails`**

Add (keep `meetingLocation`/`meetingLink` optional for backward compat, or remove if nothing else reads them — verify first):

```ts
conversationId?: string
questions?: { id: string; prompt: string }[]
```

- [ ] **Step 3: Update the zod schema**

In `src/components/interview/InterviewScheduleModal.tsx` (schema L15-24):

```ts
z.enum(['phone', 'video', 'website-chat'])
```

- [ ] **Step 4: Update `typeBadgeConfig`**

In `src/components/interview/InterviewDetails.tsx` (L3-7): map `'website-chat'` → `{ label: 'Website Chat', ... }` (pick the badge style currently used for `in-person`, verify color choices against DESIGN.md).

- [ ] **Step 5: Run typecheck + tests**

Run: `npm run test:run` and `npm run build`
Expected: existing `HiringFlowModal.test.tsx` / `MessagesTab.test.tsx` still green (they may construct `InterviewDetails` — update fixtures if the type is narrowed).

### Task 2: InterviewScheduleModal submits the conversation

**Files:**
- Modify: `src/components/interview/InterviewScheduleModal.tsx`
- Modify: `src/api/messages.ts`

- [ ] **Step 1: Add the api client**

In `src/api/messages.ts` (mirror existing function style):

```ts
export async function openInterviewConversation(applicationId: string, _payload?: unknown) {
  return apiPost(`/applications/${applicationId}/interview-conversation`, {})
}
```

- [ ] **Step 2: Add the question checklist (website-chat only)**

In `InterviewScheduleModal.tsx`:
- Fetch `useJob(application.jobId)`; when the selected type is `website-chat` and `job?.screeningQuestions?.length`, render checkboxes for each `{ id, prompt }` (default all checked), storing selected prompts in form state.
- Gate: the interview-questions section only appears for `website-chat`.

- [ ] **Step 3: Submit flow branches on type**

In the submit handler:
- For `phone`/`video`: keep current behavior (send `updateApplicationInterview` + EmailJS, incl. `meetingLink`).
- For `website-chat`:
  - `await updateApplicationInterview(application.id, { type: 'website-chat', scheduledAt, notes, questions: selectedPrompts })` (no `meetingLink`/`meetingLocation`)
  - `await updateApplicationStatus(application.id, 'interviewing')`
  - `const { data } = await openInterviewConversation(application.id)`
  - `navigate(\`${base}?tab=messages&conv=${data.conversation.id}\`)` using the `PricingSection` role-based base pattern (`/employer/dashboard` vs `/dashboard`)
  - Wrap in try/catch → `useToast` error; do NOT navigate if the endpoint 404s (backend not deployed yet).

- [ ] **Step 4: Run the frontend suite**

Run: `npm run test:run`, `npm run build`, `npm run lint`
Expected: green. Fix any fixture in tests that passes `type: 'in-person'` (grep repo-wide for `'in-person'`).

### Task 3: InterviewDetails renders the conversation interview

**Files:**
- Modify: `src/components/interview/InterviewDetails.tsx`

- [ ] **Step 1: Badge + info for website-chat**

When `details.type === 'website-chat'`:
- Render the Website Chat badge and the scheduled date/time.
- Instead of `meetingLink` (video-only), render a "Open interview chat" CTA: `<Link to={MessagesPath(details.conversationId)}>` where MessagesPath is the role-based `?tab=messages&conv=` route (same base logic as Task 2).
- Render the routed questions list (`details.questions` prompts) if present.

- [ ] **Step 2: Add a small unit test**

Create/extend `src/components/interview/__tests__/InterviewDetails.test.tsx` (follow `MessagesTab.test.tsx` mock style: vi.mock ApplicationsContext, MemoryRouter): assert website-chat shows the chat CTA + questions; video still shows meetingLink.

- [ ] **Step 3: Run the frontend suite**

Run: `npm run test:run`, `npm run build`, `npm run lint`

### Task 4: Live chat updates (SSE `new-message`)

**Files:**
- Modify: `src/context/NotificationsContext.tsx`
- Modify: `src/components/dashboard/MessagesTab.tsx`

**Background:** `MessagesTab.tsx` currently does NOT subscribe to SSE (verified). Backend already pushes `new-message` to the recipient in `messages.service.ts:48`. The `NotificationsContext` declares `global EventSourceEventMap { notification: MessageEvent }` and exposes `subscribe(eventName, handler)` / `unsubscribe`.

- [ ] **Step 1: Extend the event map**

In `NotificationsContext.tsx`:

```ts
interface EventSourceEventMap {
  notification: MessageEvent
  'new-message': MessageEvent
}
```

- [ ] **Step 2: Subscribe in MessagesTab**

In `MessagesTab.tsx`, use the `subscribe` hook to listen for `'new-message'`; when received, refresh the active thread (if `message.conversationId === activeConversationId`) and the conversation list (invalidate the `listConversations` query). Ensure unsubscribe on unmount.

- [ ] **Step 3: Test**

Extend `MessagesTab.test.tsx` (or `NotificationsContext.test.tsx`): fire a `new-message` SSE event and assert the thread re-renders with the new message.

- [ ] **Step 4: Full suite**

Run: `npm run test:run`, `npm run build`, `npm run lint`

### Task 5: Repo-wide `in-person` sweep

- [ ] Grep for `in-person` / `in_person` / `inPerson` across `src/` — update `InterviewScheduleModal.tsx`, `InterviewDetails.tsx`, `types/hiring-flow.ts`, and any test fixtures
- [ ] Grep for `meetingLocation` — confirm nothing besides the modal reads it; if so, remove from `InterviewDetails` or keep optional (decide in Task 1 Step 2)
- [ ] Final: `npm run test:run && npm run build && npm run lint`
