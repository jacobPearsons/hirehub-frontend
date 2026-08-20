# WS3: Payment Modal → Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** From `PricingSection` (`src/components/employers/PricingSection.tsx`), a "Get Started" / "Start Free Trial" click opens a payment modal; on success it creates (or reuses) a conversation with the HireHub team/admin and opens the chat so the employer can be onboarded/supported.

**Architecture:** The backend already has a full messages module (`src/modules/messages/`) with `createOrGetConversation(employerId, candidateId, jobId)` and `sendMessage`. Frontend has NO messages API client or chat UI yet — this plan adds both. The paying employer is the `employer` side; the HireHub team is the `candidate` side (represented by the first `ADMIN` user). Payment is mocked (no Stripe) — a local modal that simulates a successful checkout; wire real Stripe later.

**Participant (confirmed):** HireHub team/admin.

**Tech Stack:** Express, Prisma, React 19, existing `apiPost`/`apiGet` client, Radix Dialog (pattern from `ApplyJobModal.tsx`).

## Global Constraints

- Follow existing module structure: controller → service in `src/modules/*`
- Backend changes are NOT committed (repo policy) — only frontend commits
- Run frontend `npm run test:run`, `npm run build`, `npm run lint`; backend `npm test`, `npm run build`
- No new npm packages; use existing dependencies
- DESIGN.md conventions: tokens, no `cn()`/`clsx()`, `focus-visible:ring-2 focus-visible:ring-ink/30`, buttons default `type="button"`
- Keep backend behavior backward compatible — `createOrGetConversation` stays as-is

---

### Task 1: Backend support-conversation endpoint (no commit)

**Files:**
- Modify: `src/modules/messages/messages.service.ts`
- Modify: `src/modules/messages/messages.controller.ts`
- Modify: `src/modules/messages/messages.routes.ts`
- Test: `src/tests/messages.test.ts` (create — there is no existing test)

**Interfaces:**
- Consumes: existing `createOrGetConversation` + `sendMessage`
- Produces: `openSupportConversation(userId)` that finds the first `ADMIN` user, creates/reuses the conversation, sends a welcome message, returns the conversation

- [ ] **Step 1: Read the existing messages module**

Run: `cat src/modules/messages/messages.service.ts && cat src/modules/messages/messages.routes.ts`

- [ ] **Step 2: Write the failing test**

Create `src/tests/messages.test.ts` mirroring the registered-user pattern from `src/tests/notifications.test.ts` (register an ADMIN and a SEEKER in `beforeAll`):

```ts
describe('POST /api/conversations/support', () => {
  it('creates a conversation with an admin and sends a welcome message', async () => {
    const res = await request(app)
      .post('/api/conversations/support')
      .set('Authorization', `Bearer ${employerToken}`)
      .expect(200)

    expect(res.body.data.employerId).toBe(employerUserId)
    expect(res.body.data.candidateId).toBe(adminUserId)
  })

  it('reuses an existing support conversation instead of creating duplicates', async () => {
    const first = await request(app).post('/api/conversations/support').set('Authorization', `Bearer ${employerToken}`)
    const second = await request(app).post('/api/conversations/support').set('Authorization', `Bearer ${employerToken}`)
    expect(first.body.data.id).toBe(second.body.data.id)
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- messages`
Expected: FAIL — route doesn't exist (404).

- [ ] **Step 4: Add service method**

In `messages.service.ts`:

```ts
async openSupportConversation(userId: string) {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) throw new NotFoundError('Admin')
  const conversation = await this.createOrGetConversation(userId, admin.id)
  const existing = await prisma.message.count({ where: { conversationId: conversation.id } })
  if (existing === 0) {
    await this.sendMessage(conversation.id, admin.id, 'Welcome to HireHub! ...')
  }
  return conversation
}
```

Import `prisma` and `NotFoundError` as needed (check current imports).

- [ ] **Step 5: Add controller + route**

Controller:
```ts
export async function openSupportConversation(req: Request, res: Response, next: NextFunction) {
  try {
    const conversation = await messagesService.openSupportConversation(req.user!.userId)
    success(res, conversation)
  } catch (error) {
    next(error)
  }
}
```

Route:
```ts
router.post('/conversations/support', requireAuth, messagesController.openSupportConversation)
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- messages`
Expected: PASS

- [ ] **Step 7: Full gate**

Run: `npm test && npm run build`
Expected: all pass

---

### Task 2: Frontend messages API client

**Files:**
- Create: `src/api/messages.ts`
- Create: `src/types/message.ts` (types for `Conversation`, `Message`, `Sender`)

**Interfaces:**
- Consumes: `apiGet`/`apiPost` from `./client`
- Produces: `listConversations`, `openSupportConversation`, `getMessages`, `sendMessage`

- [ ] **Step 1: Write the failing test**

Create `src/api/__tests__/messages.test.ts` mirroring the vi.mock pattern used in `src/api/__tests__` (check an existing API test, e.g. `notifications.test.ts`, for the mock shape):

```ts
import { openSupportConversation } from '../messages'

describe('openSupportConversation', () => {
  it('posts to /conversations/support and returns the conversation', async () => {
    const conversation = await openSupportConversation()
    expect(conversation.data.id).toBe('conv-1')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/api/__tests__/messages.test.ts`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement types**

`src/types/message.ts`:

```ts
export interface ChatSender { id: string; name: string; avatarUrl?: string | null }
export interface ChatMessage { id: string; conversationId: string; senderId: string; sender: ChatSender; content: string; createdAt: string }
export interface Conversation {
  id: string
  employerId: string
  candidateId: string
  job?: { id: string; title: string } | null
  employer: ChatSender
  candidate: ChatSender
  messages: ChatMessage[]
  updatedAt: string
}
```

- [ ] **Step 4: Implement the API client**

`src/api/messages.ts`:

```ts
import { apiGet, apiPost } from './client'
import type { Conversation, ChatMessage } from '../types/message'

export async function listConversations() {
  return apiGet<Conversation[]>('/conversations')
}

export async function openSupportConversation() {
  return apiPost<Conversation>('/conversations/support')
}

export async function getMessages(conversationId: string) {
  return apiGet<ChatMessage[]>(`/conversations/${conversationId}/messages`)
}

export async function sendMessage(conversationId: string, content: string) {
  return apiPost<ChatMessage>('/messages', { conversationId, content })
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test:run -- src/api/__tests__/messages.test.ts`
Expected: PASS

- [ ] **Step 6: Full gate**

Run: `npm run test:run && npm run build && npm run lint`
Expected: all pass

- [ ] **Step 7: Commit**

```bash
git add src/api/messages.ts src/types/message.ts src/api/__tests__/messages.test.ts
git commit -m "feat(api): messages client for conversations and chat"
```

---

### Task 3: Payment modal in PricingSection

**Files:**
- Create: `src/components/employers/PaymentModal.tsx`
- Modify: `src/components/employers/PricingSection.tsx`

**Interfaces:**
- Consumes: `PricingTier` (prop), `openSupportConversation`, `useAuth`/`useApp` for user + redirect
- Produces: mock checkout form; on success calls `openSupportConversation` and invokes `onPaid(conversationId)`

- [ ] **Step 1: Write the failing test**

Create `src/components/employers/__tests__/PaymentModal.test.tsx` (mirror the vi.mock + MemoryRouter + ToastProvider pattern from existing component tests):

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PaymentModal } from '../PaymentModal'
import type { PricingTier } from '../../../data/pricing'

const tier: PricingTier = { tier: 'Pro', price: 299, period: 'month', description: 'x', features: ['a'], ctaText: 'Start Free Trial', featured: true }

describe('PaymentModal', () => {
  it('submits a mock payment and calls openSupportConversation', async () => {
    const user = userEvent.setup()
    const onPaid = vi.fn()
    render(<PaymentModal tier={tier} open onOpenChange={() => {}} onPaid={onPaid} />)

    await user.type(screen.getByLabelText(/card number/i), '4242 4242 4242 4242')
    await user.click(screen.getByRole('button', { name: /pay/i }))

    expect(await screen.findByText(/thank you/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/components/employers/__tests__/PaymentModal.test.tsx`
Expected: FAIL — component doesn't exist.

- [ ] **Step 3: Implement PaymentModal**

Follow the Radix Dialog + AnimatePresence pattern from `src/components/apply/ApplyJobModal.tsx`. Two states:
- **Form:** tier summary (`tier.tier`, `$price`), mock fields — Card number, Expiry, CVC (no real validation, or minimal). `Pay $X` submit button calls `openSupportConversation()` then shows success state.
- **Success:** "Thank you for choosing {tier.tier}!" + "Start chatting with the HireHub team" button that calls `onPaid(conversationId)`.

Handle the unauthenticated case: if `useAuth().user` is null, the modal shows a "Sign in required" state with a link to `/login` instead of the form (avoids a backend 401). Check `src/api/client.ts:64` — a 401 triggers an automatic redirect to `/login`; prefer explicit UI state.

- [ ] **Step 4: Wire into PricingSection**

Replace the static Button with an `onClick={() => setSelectedTier(tier)}` and render the modal. After `onPaid`, navigate to `/dashboard?tab=messages` (or emit via callback up to `EmployersPage`). Use `useNavigate`.

```tsx
const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null)
// ...
<Button variant={tier.featured ? 'accent' : 'primary'} size="lg" className="w-full" type="button" onClick={() => setSelectedTier(tier)}>{tier.ctaText}</Button>
// ...
<PaymentModal tier={selectedTier!} open={!!selectedTier} onOpenChange={(o) => !o && setSelectedTier(null)} onPaid={() => navigate('/dashboard?tab=messages')} />
```

Note: the navigation target `/dashboard?tab=messages` is added in Task 4; until then, navigate to `/dashboard` is fine as the tab will be wired in the next task.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test:run -- src/components/employers/__tests__/PaymentModal.test.tsx`
Expected: PASS

- [ ] **Step 6: Full gate**

Run: `npm run test:run && npm run build && npm run lint`
Expected: all pass

- [ ] **Step 7: Commit**

```bash
git add src/components/employers/PaymentModal.tsx src/components/employers/PricingSection.tsx src/components/employers/__tests__/PaymentModal.test.tsx
git commit -m "feat(employers): payment modal initiates HireHub chat"
```

---

### Task 4: Chat UI in the dashboard

**Files:**
- Create: `src/components/dashboard/MessagesTab.tsx`
- Modify: `src/components/dashboard/DashboardPage.tsx` (add `messages` tab)

**Interfaces:**
- Consumes: `listConversations`, `getMessages`, `sendMessage`, `useApp().user`
- Produces: a conversation list + message thread with a composer, scoped to the current user

- [ ] **Step 1: Write the failing test**

Create `src/components/dashboard/__tests__/MessagesTab.test.tsx` (mirror `DashboardPage.test.tsx` mock pattern — it likely mocks `listApplications`/`listSavedJobs`; mock the messages API too):

```tsx
import { render, screen } from '@testing-library/react'
import { MessagesTab } from '../MessagesTab'

describe('MessagesTab', () => {
  it('renders conversations and opens a thread on click', async () => {
    render(<MessagesTab />)
    expect(await screen.findByText('HireHub Team')).toBeInTheDocument()
    await userEvent.click(screen.getByText('HireHub Team'))
    expect(await screen.findByText(/welcome to hirehub/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/components/dashboard/__tests__/MessagesTab.test.tsx`
Expected: FAIL — component doesn't exist.

- [ ] **Step 3: Implement MessagesTab**

Two-pane layout (stacks on mobile): left = conversation list (name, last message snippet, `updatedAt`), right = thread. On thread open, call `getMessages`; composer uses `sendMessage` and appends optimistically. Determine the "other party" label:

```tsx
const isEmployerSide = (c: Conversation) => c.employerId === user?.id
const displayName = (c: Conversation) => {
  const other = isEmployerSide(c) ? c.candidate : c.employer
  return other.role && other.role === 'ADMIN' ? 'HireHub Team' : other.name
}
```

If `ChatSender` lacks a `role` field, update `src/types/message.ts` to include `role?: string` (backend `User` select in `messages.service.ts:12-13` doesn't return role — see Task 5).

Follow existing dashboard styling: `border border-hairline`, `bg-surface-1`, `text-ink-muted`, focus rings.

- [ ] **Step 4: Add the tab to DashboardPage**

Add `{ id: 'messages', label: 'Messages' }` to the `tabs` array and `{activeTab === 'messages' && <MessagesTab />}`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test:run -- src/components/dashboard/__tests__/MessagesTab.test.tsx && npm run test:run -- src/components/dashboard/__tests__/DashboardPage.test.tsx`
Expected: PASS

- [ ] **Step 6: Full gate**

Run: `npm run test:run && npm run build && npm run lint`
Expected: all pass

- [ ] **Step 7: Commit**

```bash
git add src/components/dashboard/MessagesTab.tsx src/components/dashboard/DashboardPage.tsx src/components/dashboard/__tests__/MessagesTab.test.tsx
git commit -m "feat(dashboard): chat messages tab"
```

---

### Task 5: Backend returns sender role for chat labels (no commit)

**Files:**
- Modify: `src/modules/messages/messages.service.ts`

**Interfaces:**
- Consumes: existing conversation/message queries
- Produces: `role` on the sender objects so the UI can label "HireHub Team"

- [ ] **Step 1: Update the user selects**

In both `listConversations` and `getMessages`, add `role: true` to the `select` for employer, candidate, and sender.

- [ ] **Step 2: Run backend tests**

Run: `npm test && npm run build`
Expected: all pass (no new tests needed — existing message tests still pass)

---

## Validation and Acceptance

1. Clicking a pricing CTA opens the payment modal; unauthenticated users see a sign-in state
2. Successful mock payment creates/reuses a conversation with an ADMIN user and sends a welcome message
3. Conversation is reused — no duplicate support conversations per employer
4. The employer sees the conversation in `/dashboard?tab=messages` and can send/receive messages
5. Backend remains uncommitted; frontend commits land cleanly
6. All frontend gates pass; backend tests + build pass
