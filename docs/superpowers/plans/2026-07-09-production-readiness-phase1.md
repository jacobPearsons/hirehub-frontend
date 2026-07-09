# HireHub Community — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect frontend to backend API, implement forgot/reset password on backend, add backend tests, and add cursor-based pagination.

**Architecture:** Frontend gets a proper API client layer with JWT refresh interceptor. Auth pages become functional. Static data is replaced with API calls. Backend gets forgot/reset password (Resend), enhanced health check, and test suite.

**Tech Stack:** Vite + React 19 + TypeScript 6 (frontend); Express 4.21 + Prisma + PostgreSQL + vitest + supertest (backend); Resend for email

---

## File Inventory

### New Files
| File | Purpose |
|------|---------|
| `src/api/client.ts` | Fetch wrapper with JWT refresh interceptor |
| `src/api/auth.ts` | Auth API functions |
| `src/api/jobs.ts` | Jobs API functions |
| `src/api/applications.ts` | Applications API functions |
| `src/api/savedJobs.ts` | Saved jobs API functions |
| `src/api/blog.ts` | Blog API functions |
| `src/api/pricing.ts` | Pricing API functions |
| `src/api/contact.ts` | Contact API functions |
| `src/api/types.ts` | Shared API response types |
| `hirehub-api/src/services/email.ts` | Resend email service |
| `hirehub-api/src/tests/auth.test.ts` | Auth route tests |
| `hirehub-api/src/tests/jobs.test.ts` | Jobs route tests |
| `hirehub-api/src/tests/applications.test.ts` | Applications route tests |
| `hirehub-api/src/tests/setup.ts` | Test setup + teardown |

### Modified Files
| File | Change |
|------|--------|
| `src/context/AppContext.tsx` | Async actions, token storage, API sync |
| `src/components/auth/LoginPage.tsx` | Call API on submit |
| `src/components/auth/SignupPage.tsx` | Call API on submit |
| `src/components/auth/ForgotPasswordPage.tsx` | Call API on submit |
| `src/components/auth/ResetPasswordPage.tsx` | Call API on submit |
| `src/components/jobs/JobBoardPage.tsx` | Fetch from API, add pagination |
| `src/components/jobs/JobDetailPage.tsx` | Fetch single job from API |
| `src/components/blog/BlogPage.tsx` | Fetch from API |
| `src/components/blog/BlogPostPage.tsx` | Fetch single post from API |
| `src/components/employers/PricingSection.tsx` | Fetch from API |
| `src/components/contact/ContactPage.tsx` | Submit via API |
| `src/components/dashboard/DashboardPage.tsx` | Fetch from API |
| `src/components/dashboard/ApplicationsTab.tsx` | Fetch from API |
| `src/components/dashboard/SavedJobsTab.tsx` | Fetch from API |
| `src/components/employer-dashboard/EmployerDashboardPage.tsx` | Fetch from API |
| `src/components/employer-dashboard/ApplicantsTab.tsx` | Fetch from API |
| `src/components/apply/ApplyJobModal.tsx` | Submit via API |
| `src/components/layout/Navbar.tsx` | Auth-aware nav |
| `hirehub-api/prisma/schema.prisma` | Add ResetToken model |
| `hirehub-api/src/modules/auth/auth.service.ts` | Implement forgot/reset |
| `hirehub-api/src/modules/auth/auth.controller.ts` | Unstub forgot/reset |
| `hirehub-api/src/modules/auth/auth.routes.ts` | No changes needed |
| `hirehub-api/src/app/app.ts` | Enhanced health check |
| `hirehub-api/package.json` | Add Resend dependency |

---

## Task Breakdown

### Task 1: API Client Layer

**Files:**
- Create: `src/api/client.ts`
- Create: `src/api/types.ts`
- Create: `src/api/auth.ts`
- Create: `src/api/jobs.ts`
- Create: `src/api/applications.ts`
- Create: `src/api/savedJobs.ts`
- Create: `src/api/blog.ts`
- Create: `src/api/pricing.ts`
- Create: `src/api/contact.ts`

Create a fetch-based API client. The client stores the JWT access token in memory and the refresh token in an httpOnly cookie (set by the backend). On 401 responses, it attempts a silent refresh via `POST /api/auth/refresh` before retrying. If refresh fails, it clears auth state and redirects to login.

**client.ts structure:**
```ts
const API_BASE = 'http://localhost:4000/api'

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

interface ApiResponse<T> {
  success: boolean
  data: T
  pagination?: { total: number; cursor: string | null }
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  let res = await fetch(url, { ...options, headers, credentials: 'include' })

  if (res.status === 401 && accessToken) {
    const refreshed = await attemptRefresh()
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`
      res = await fetch(url, { ...options, headers, credentials: 'include' })
    } else {
      setAccessToken(null)
      window.location.href = '/login'
      throw new Error('Session expired')
    }
  }

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.error || 'Request failed')
  }

  return json
}

async function attemptRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!res.ok) return false
    const json = await res.json()
    setAccessToken(json.data.accessToken)
    return true
  } catch {
    return false
  }
}
```

**apiFetch variants:**
```ts
export function apiGet<T>(endpoint: string) {
  return apiFetch<T>(endpoint)
}

export function apiPost<T>(endpoint: string, body?: unknown) {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

export function apiPatch<T>(endpoint: string, body?: unknown) {
  return apiFetch<T>(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  })
}

export function apiDelete(endpoint: string) {
  return apiFetch<void>(endpoint, { method: 'DELETE' })
}
```

**Module API files** just wrap endpoints:
- `auth.ts`: `login(email, password)`, `register(data)`, `logout()`, `getMe()`, `forgotPassword(email)`, `resetPassword(token, password)`
- `jobs.ts`: `list(params)`, `getById(id)`
- `applications.ts`: `create(data)`, `list(params)`, `updateStatus(id, status)`
- `savedJobs.ts`: `list()`, `save(jobId)`, `remove(jobId)`
- `blog.ts`: `list(params)`, `getBySlug(slug)`
- `pricing.ts`: `list()`
- `contact.ts`: `submit(data)`

---

### Task 2: Backend — Forgot/Reset Password

**Files:**
- Modify: `hirehub-api/prisma/schema.prisma` (add ResetToken model)
- Create: `hirehub-api/src/services/email.ts`
- Modify: `hirehub-api/src/modules/auth/auth.service.ts`
- Modify: `hirehub-api/src/modules/auth/auth.controller.ts`

**Steps:**

1. Add ResetToken model to Prisma schema:
```prisma
model ResetToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([token])
}
```

2. Create email service using Resend:
```ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  await resend.emails.send({
    from: 'HireHub <noreply@hirehub.community>',
    to: email,
    subject: 'Reset your HireHub password',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`,
  })
}
```

3. Implement `forgotPassword` in auth service:
- Generate crypto.randomUUID as reset token
- Store in ResetToken with 1hr expiry
- Send email with reset URL containing the token

4. Implement `resetPassword` in auth service:
- Find valid (non-expired) ResetToken
- Hash and update user password
- Delete the token

5. Update controller to remove try/catch (rely on `express-async-errors`)

---

### Task 3: Enhanced Health Endpoint

**Files:**
- Modify: `hirehub-api/src/app/app.ts`

Replace simple health check with one that pings the database:
```ts
import { prisma } from '../lib/prisma'

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ success: true, data: { status: 'ok', database: 'connected', timestamp: new Date().toISOString() } })
  } catch {
    res.status(503).json({ success: false, error: 'Database unavailable' })
  }
})
```

---

### Task 4: Backend Tests

**Files:**
- Create: `hirehub-api/src/tests/setup.ts`
- Create: `hirehub-api/src/tests/auth.test.ts`
- Create: `hirehub-api/src/tests/jobs.test.ts`
- Create: `hirehub-api/src/tests/applications.test.ts`

Use vitest + supertest. Set up a test database or mock Prisma.

**setup.ts:**
```ts
import { beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

beforeAll(async () => {
  // Ensure DB is available
})

afterAll(async () => {
  await prisma.$disconnect()
})
```

**Auth tests:**
- POST /api/auth/register — success, duplicate email, missing fields
- POST /api/auth/login — success, wrong password, non-existent user
- GET /api/auth/me — with valid token, without token
- POST /api/auth/refresh — with valid cookie, without cookie

**Jobs tests:**
- GET /api/jobs — returns paginated list
- GET /api/jobs/:id — returns job, 404 for non-existent
- POST /api/jobs — requires EMPLOYER role

**Applications tests:**
- POST /api/applications — requires SEEKER, valid job
- GET /api/applications — returns user's applications
- PATCH /api/applications/:id/status — requires EMPLOYER

---

### Task 5: Connect Auth Pages

**Files:**
- Modify: `src/components/auth/LoginPage.tsx`
- Modify: `src/components/auth/SignupPage.tsx`
- Modify: `src/components/auth/ForgotPasswordPage.tsx`
- Modify: `src/components/auth/ResetPasswordPage.tsx`
- Modify: `src/context/AppContext.tsx` (token storage + user state)

Update each auth page to call the API instead of being UI-only. Update AppContext to store access token and user data.

**Login flow:**
1. User submits form
2. `apiPost('/auth/login', { email, password })`
3. On success: `setAccessToken(token)`, update AppContext user
4. Redirect to `/dashboard` (seeker) or `/employer/dashboard` (employer)

**Signup flow:**
1. User submits form
2. `apiPost('/auth/register', { name, email, password, role })`
3. On success: `setAccessToken(token)`, update AppContext user
4. Redirect to onboarding or dashboard

**Logout:**
1. `apiPost('/auth/logout')`
2. `setAccessToken(null)`, clear user in AppContext
3. Redirect to `/`

---

### Task 6: Replace Static Data with API Calls

**Files:**
- Modify: `src/components/jobs/JobBoardPage.tsx`
- Modify: `src/components/jobs/JobDetailPage.tsx`
- Modify: `src/components/blog/BlogPage.tsx`
- Modify: `src/components/blog/BlogPostPage.tsx`
- Modify: `src/components/employers/PricingSection.tsx`
- Modify: `src/components/contact/ContactPage.tsx`
- Modify: `src/components/dashboard/DashboardPage.tsx`
- Modify: `src/components/dashboard/ApplicationsTab.tsx`
- Modify: `src/components/dashboard/SavedJobsTab.tsx`
- Modify: `src/components/employer-dashboard/EmployerDashboardPage.tsx`
- Modify: `src/components/employer-dashboard/ApplicantsTab.tsx`
- Modify: `src/components/apply/ApplyJobModal.tsx`

Each component that currently reads from `src/data/*` should be updated to call the API instead. Add loading/error states.

**Pattern:**
```tsx
const [data, setData] = useState<T[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  apiGet<T[]>('/endpoint')
    .then(res => setData(res.data))
    .catch(err => setError(err.message))
    .finally(() => setLoading(false))
}, [])
```

Keep the static data files as fallbacks for development when the API is not running.

---

### Task 7: Cursor-Based Pagination

**Files:**
- Modify: `src/components/jobs/JobBoardPage.tsx`
- Modify: `src/components/jobs/JobCardGrid.tsx`

The API already supports cursor-based pagination (`?cursor=xxx&take=12`). Add a "Load more" button at the bottom of the job grid.

**Implementation:**
```tsx
const [jobs, setJobs] = useState<Job[]>([])
const [cursor, setCursor] = useState<string | null>(null)
const [total, setTotal] = useState(0)
const [loading, setLoading] = useState(false)

async function loadJobs(reset = false) {
  setLoading(true)
  const params = new URLSearchParams()
  if (!reset && cursor) params.set('cursor', cursor)
  params.set('take', '12')
  // ... apply filters ...
  const res = await apiGet<Job[]>(`/jobs?${params}`)
  setJobs(prev => reset ? res.data : [...prev, ...res.data])
  setCursor(res.pagination?.cursor ?? null)
  setTotal(res.pagination?.total ?? 0)
  setLoading(false)
}
```

---

### Task 8: Update AppContext

**Files:**
- Modify: `src/context/AppContext.tsx`

Update AppContext to:
- Store `accessToken` and sync with `api/client.ts`
- Initialize user from `GET /api/auth/me` on app load (if token exists)
- Fetch saved jobs and applications from API when user is logged in
- Async action helpers for API calls
- Remove demo user from initial state (start with `null`)

---

## Execution Order

```
Task 2: Forgot/Reset Password (backend) ─┐
Task 3: Health Endpoint (backend) ───────┤
Task 4: Backend Tests ───────────────────┤  Can run in parallel
                                         │  (different concerns)
Task 1: API Client Layer (frontend) ─────┘
     │
     ▼
Task 5: Connect Auth Pages ────────────── Sequential (depends on Task 1)
     │
     ▼
Task 8: Update AppContext ─────────────── Sequential (depends on Task 1, 5)
     │
     ▼
Task 6: Replace Static Data ───────────── Sequential (depends on Task 1, 8)
     │
     ▼
Task 7: Cursor Pagination ─────────────── Sequential (depends on Task 6)
     │
     ▼
Final: Verify build + tests
```
