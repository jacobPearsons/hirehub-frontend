# Admin & Employer Hiring-Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give admins full hiring powers (view candidate profile + resume, review, interview, offer, reject) and give employers a full candidate-profile + resume view, wiring the hiring process smoothly for both roles.

**Architecture:** Two repos change in lockstep. The backend opens its application-status route to `ADMIN`, adds a `GET /applications/:id/candidate` endpoint (role-gated: ADMIN always, EMPLOYER only for own jobs), and the frontend adds a `CandidateProfile` API layer plus a reusable `CandidateDetailDrawer` mounted in both the Admin applications list and the employer Applicants tab. The existing `InterviewScheduleModal` and `OfferLetterModal` are reused unchanged for both roles.

**Tech Stack:** Express 4 + Prisma + zod (backend), React 18 + TypeScript + Radix Dialog + framer-motion + Vitest + RTL (frontend).

## Global Constraints

- Both repos are on branch `feat/onboarding-wizard`. Commit directly in each repo; never create/switch branches, never worktree.
- Backend has unrelated uncommitted changes (`admin.*`, `seed.ts`, `applications-extended.test.ts`, etc.). **Never run `git add -A`.** Stage only the exact files each task names.
- Backend test command (from `hirehub-backend/`): `npm test` (vitest run). Frontend gates (from `hirehub-frontend/`): `npm run lint` (0 errors), `npm run test:run` (all pass), `npm run build`.
- Wire statuses are UPPERCASE (`APPLIED`, `REVIEWING`, `INTERVIEWING`, `REJECTED`, `OFFER`); the frontend lowercases them (`applied`…`offer`) via `normalizeApplication` in `src/api/applications.ts`. The `ApplicationStatus` frontend type is `'applied' | 'reviewing' | 'interviewing' | 'rejected' | 'offer'`.
- All API responses use the `{ success, data }` wrapper (backend `lib/response.ts`).
- Admin role is granted via the DB (`prisma.user.update({ where: { email }, data: { role: 'ADMIN' } })`), never via `POST /api/auth/register` (schema only allows SEEKER/EMPLOYER).
- Resumes are served statically by the backend at `GET /uploads/resumes/<fileName>` (server root, NOT under `/api`). Frontend API base is `import.meta.env.VITE_API_URL || 'http://localhost:4000/api'`.
- Frontend lint forbids calling setState synchronously inside `useEffect` body (`react-hooks/set-state-in-effect`). Async-callback setState inside `useEffect` is fine.
- Authorization errors are 403 (`AuthorizationError`), missing tokens 401 (`AuthenticationError`), missing records 404 (`NotFoundError`).

---

### Task 1: Backend — allow ADMIN on application status updates

**Files:**
- Modify: `hirehub-backend/src/modules/applications/applications.routes.ts:28`
- Modify: `hirehub-backend/src/modules/applications/applications.service.ts:42-54`
- Modify: `hirehub-backend/src/modules/applications/applications.controller.ts:35-49`
- Create: `hirehub-backend/src/tests/applications-hiring-flow.test.ts`

**Interfaces:**
- Consumes: existing `requireAuth`, `requireRole(...roles)` from `src/middleware/auth.ts`; `ApplicationsRepository.findById/updateStatus`; `sendApplicationStatusEmail` from `src/services/email`.
- Produces: `ApplicationsService.updateStatus(id: string, status: string, userId: string, userRole: string)` — 4th param added. `PATCH /api/applications/:id/status` now accepts `EMPLOYER` and `ADMIN`.

- [ ] **Step 1: Write the failing test**

Create `hirehub-backend/src/tests/applications-hiring-flow.test.ts` with this exact content (run from `hirehub-backend/`):

```ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../app/app'
import { prisma } from '../lib/prisma'

let adminToken = ''
let employerToken = ''
let otherEmployerToken = ''
let seekerToken = ''
let createdJobId = ''
let createdApplicationId = ''
const emails: string[] = []

async function register(name: string, role: string, prefix: string) {
  const email = `${prefix}-${Date.now()}@example.com`
  emails.push(email)
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name, email, password: 'password123', role })
  return res.body.data.accessToken as string
}

describe('Applications hiring-flow access', () => {
  beforeAll(async () => {
    const adminEmail = `flow-admin-${Date.now()}@example.com`
    emails.push(adminEmail)
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Flow Admin', email: adminEmail, password: 'password123' })
    await prisma.user.update({ where: { email: adminEmail }, data: { role: 'ADMIN' } })
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: adminEmail, password: 'password123' })
    adminToken = loginRes.body.data.accessToken

    employerToken = await register('Flow Employer', 'EMPLOYER', 'flow-emp')
    otherEmployerToken = await register('Flow Other', 'EMPLOYER', 'flow-other')
    seekerToken = await register('Flow Seeker', 'SEEKER', 'flow-seeker')

    const jobRes = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({
        title: 'Flow Test Job',
        company: 'Flow Corp',
        location: 'Remote',
        remote: true,
        category: 'Engineering',
        seniority: 'Junior',
        description: 'Test',
        requirements: ['Python'],
        responsibilities: ['Code'],
        tags: ['python'],
      })
    createdJobId = jobRes.body.data.id

    const appRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${seekerToken}`)
      .send({
        jobId: createdJobId,
        applicantName: 'Flow Seeker',
        applicantEmail: emails[emails.length - 1],
        coverLetter: 'Please consider me',
      })
    createdApplicationId = appRes.body.data.id
  }, 30_000)

  afterAll(async () => {
    if (createdApplicationId) {
      await prisma.application.deleteMany({ where: { id: createdApplicationId } })
    }
    if (createdJobId) {
      await prisma.job.deleteMany({ where: { id: createdJobId } })
    }
    await prisma.user.deleteMany({ where: { email: { in: emails } } })
  })

  describe('PATCH /api/applications/:id/status', () => {
    it('allows ADMIN to update status', async () => {
      const res = await request(app)
        .patch(`/api/applications/${createdApplicationId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'REVIEWING' })
        .expect(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe('REVIEWING')
    })

    it('allows the owning EMPLOYER to update status', async () => {
      const res = await request(app)
        .patch(`/api/applications/${createdApplicationId}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ status: 'INTERVIEWING' })
        .expect(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe('INTERVIEWING')
    })

    it('forbids non-owning EMPLOYER', async () => {
      await request(app)
        .patch(`/api/applications/${createdApplicationId}/status`)
        .set('Authorization', `Bearer ${otherEmployerToken}`)
        .send({ status: 'REJECTED' })
        .expect(403)
    })

    it('forbids SEEKER', async () => {
      await request(app)
        .patch(`/api/applications/${createdApplicationId}/status`)
        .set('Authorization', `Bearer ${seekerToken}`)
        .send({ status: 'REJECTED' })
        .expect(403)
    })

    it('forbids unauthenticated requests', async () => {
      await request(app)
        .patch(`/api/applications/${createdApplicationId}/status`)
        .send({ status: 'REJECTED' })
        .expect(401)
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `hirehub-backend/`): `npx vitest run src/tests/applications-hiring-flow.test.ts`
Expected: the `allows ADMIN to update status` test FAILS with 403 (ADMIN currently rejected by `requireRole('EMPLOYER')`). The owning-EMPLOYER test may pass; SEEKER/401 tests pass.

- [ ] **Step 3: Implement the minimal code**

Edit `hirehub-backend/src/modules/applications/applications.routes.ts:28` — replace the status route line:

```ts
router.patch('/applications/:id/status', requireAuth, requireRole('EMPLOYER', 'ADMIN'), validate(updateStatusSchema), applicationsController.updateStatus)
```

Edit `hirehub-backend/src/modules/applications/applications.service.ts` — replace the `updateStatus` method (lines 42-54):

```ts
  async updateStatus(id: string, status: string, userId: string, userRole: string) {
    const application = await this.repo.findById(id)
    if (!application) throw new NotFoundError('Application')
    if (userRole !== 'ADMIN' && application.job.employerId !== userId) {
      throw new AuthorizationError('You do not own this job')
    }
    const updated = await this.repo.updateStatus(id, status)
    sendApplicationStatusEmail(
      application.applicantEmail,
      application.applicantName,
      application.job.title,
      status,
    ).catch(() => {})
    return updated
  }
```

Edit `hirehub-backend/src/modules/applications/applications.controller.ts` — update the `updateStatus` call to pass the role:

```ts
export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const application = await applicationsService.updateStatus(
      req.params.id as string,
      req.body.status,
      req.user!.userId,
      req.user!.role,
    )
    success(res, application)
  } catch (error) {
    next(error)
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `hirehub-backend/`): `npx vitest run src/tests/applications-hiring-flow.test.ts`
Expected: all 5 tests PASS.

- [ ] **Step 5: Run full backend suite**

Run (from `hirehub-backend/`): `npm test`
Expected: all existing suites still pass (13+ files; the new file adds 5).

- [ ] **Step 6: Commit**

```bash
git add src/modules/applications/applications.routes.ts src/modules/applications/applications.service.ts src/modules/applications/applications.controller.ts src/tests/applications-hiring-flow.test.ts
git commit -m "feat(applications): allow ADMIN to update application status"
```

---

### Task 2: Backend — candidate profile endpoint

**Files:**
- Modify: `hirehub-backend/src/modules/applications/applications.routes.ts` (add one route)
- Modify: `hirehub-backend/src/modules/applications/applications.service.ts` (add `getCandidate`)
- Modify: `hirehub-backend/src/modules/applications/applications.controller.ts` (add `getCandidate`)
- Modify: `hirehub-backend/src/tests/applications-hiring-flow.test.ts` (add tests)

**Interfaces:**
- Consumes: `prisma` from `src/lib/prisma`; `ApplicationsRepository.findById`; `NotFoundError`/`AuthorizationError`; `success` from `src/lib/response`.
- Produces: `ApplicationsService.getCandidate(applicationId: string, userId: string, userRole: string)` → `{ application, candidate }` where `application` is the full Prisma application (with `job`), and `candidate` is the applicant `User` row with this exact selected shape: `{ id, name, email, phone, avatarUrl, headline, location, skills, bio, resumePath, resumeFileName, salaryMin, salaryMax, currency, remoteOnly, employmentType, onboardingCompleted, createdAt }`. Route: `GET /api/applications/:id/candidate`, roles `EMPLOYER` or `ADMIN`.

- [ ] **Step 1: Write the failing tests**

Append to `hirehub-backend/src/tests/applications-hiring-flow.test.ts` (inside the top-level `describe`, after the `PATCH .../status` describe block):

```ts
  describe('GET /api/applications/:id/candidate', () => {
    it('returns the candidate profile for ADMIN', async () => {
      const res = await request(app)
        .get(`/api/applications/${createdApplicationId}/candidate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.candidate).toHaveProperty('id')
      expect(res.body.data.candidate.email).toBe(emails[emails.length - 1])
      expect(res.body.data.candidate).toHaveProperty('skills')
      expect(res.body.data.candidate).toHaveProperty('resumePath')
      expect(res.body.data.application.id).toBe(createdApplicationId)
    })

    it('returns the candidate profile for the owning EMPLOYER', async () => {
      const res = await request(app)
        .get(`/api/applications/${createdApplicationId}/candidate`)
        .set('Authorization', `Bearer ${employerToken}`)
        .expect(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.candidate.email).toBe(emails[emails.length - 1])
    })

    it('forbids a non-owning EMPLOYER', async () => {
      await request(app)
        .get(`/api/applications/${createdApplicationId}/candidate`)
        .set('Authorization', `Bearer ${otherEmployerToken}`)
        .expect(403)
    })

    it('forbids SEEKER', async () => {
      await request(app)
        .get(`/api/applications/${createdApplicationId}/candidate`)
        .set('Authorization', `Bearer ${seekerToken}`)
        .expect(403)
    })

    it('returns 404 for a missing application', async () => {
      await request(app)
        .get('/api/applications/nonexistent-id/candidate')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404)
    })
  })
```

- [ ] **Step 2: Run tests to verify they fail**

Run (from `hirehub-backend/`): `npx vitest run src/tests/applications-hiring-flow.test.ts`
Expected: the new candidate tests FAIL — route returns 404 (`Cannot GET /api/applications/:id/candidate`).

- [ ] **Step 3: Implement the minimal code**

In `hirehub-backend/src/modules/applications/applications.service.ts`, add this method to `ApplicationsService` (after `updateStatus`):

```ts
  async getCandidate(applicationId: string, userId: string, userRole: string) {
    const application = await this.repo.findById(applicationId)
    if (!application) throw new NotFoundError('Application')
    if (userRole !== 'ADMIN' && application.job.employerId !== userId) {
      throw new AuthorizationError('Not authorized to view this candidate')
    }
    const candidate = await prisma.user.findUnique({
      where: { id: application.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        headline: true,
        location: true,
        skills: true,
        bio: true,
        resumePath: true,
        resumeFileName: true,
        salaryMin: true,
        salaryMax: true,
        currency: true,
        remoteOnly: true,
        employmentType: true,
        onboardingCompleted: true,
        createdAt: true,
      },
    })
    return { application, candidate }
  }
```

In `hirehub-backend/src/modules/applications/applications.controller.ts`, add after `updateStatus`:

```ts
export async function getCandidate(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await applicationsService.getCandidate(
      req.params.id as string,
      req.user!.userId,
      req.user!.role,
    )
    success(res, data)
  } catch (error) {
    next(error)
  }
}
```

In `hirehub-backend/src/modules/applications/applications.routes.ts`, add after the `employer/me` line (line 27):

```ts
router.get('/applications/:id/candidate', requireAuth, requireRole('EMPLOYER', 'ADMIN'), applicationsController.getCandidate)
```

- [ ] **Step 4: Run tests to verify they pass**

Run (from `hirehub-backend/`): `npx vitest run src/tests/applications-hiring-flow.test.ts`
Expected: all 10 tests PASS.

- [ ] **Step 5: Run full backend suite**

Run (from `hirehub-backend/`): `npm test`
Expected: all suites pass.

- [ ] **Step 6: Commit**

```bash
git add src/modules/applications/applications.routes.ts src/modules/applications/applications.service.ts src/modules/applications/applications.controller.ts src/tests/applications-hiring-flow.test.ts
git commit -m "feat(applications): add candidate profile endpoint for employer and admin"
```

---

### Task 3: Frontend — API layer additions

**Files:**
- Modify: `hirehub-frontend/src/api/applications.ts`
- Modify: `hirehub-frontend/src/api/__tests__/applications.test.ts`

**Interfaces:**
- Consumes: `apiGet` from `./client`; `normalizeApplication`, `BackendApplication` (both already in `src/api/applications.ts`).
- Produces: `CandidateProfile` interface, `CandidateResponse` interface, `getCandidateProfile(applicationId: string)` returning `{ ...res, data: { application: Application, candidate: CandidateProfile } }`, and `resumeFileUrl(resumePath: string): string` → `http://<host>/uploads/resumes/<encodeURIComponent(file)>`.

- [ ] **Step 1: Write the failing tests**

Append to `hirehub-frontend/src/api/__tests__/applications.test.ts`:

```ts
import { getCandidateProfile, resumeFileUrl } from '../applications'

describe('getCandidateProfile', () => {
  it('GETs the candidate endpoint and normalizes the nested application', async () => {
    const rawApplication = {
      id: 'app-1',
      jobId: 'job-1',
      job: { title: 'Senior Engineer', company: 'Acme' },
      applicantName: 'Jane Doe',
      applicantEmail: 'jane@example.com',
      coverLetter: 'Letter',
      status: 'APPLIED',
      submittedAt: '2026-07-01T00:00:00.000Z',
    }
    const candidate = {
      id: 'u1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      skills: ['Python', 'React'],
      createdAt: '2026-01-01T00:00:00.000Z',
    }
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { application: rawApplication, candidate } }),
    })))

    const res = await getCandidateProfile('app-1')
    expect(res.data.candidate.name).toBe('Jane Doe')
    expect(res.data.application.jobTitle).toBe('Senior Engineer')
    expect(res.data.application.status).toBe('applied')

    const [url] = vi.mocked(fetch).mock.calls[0] as [string]
    expect(url).toBe('http://localhost:4000/api/applications/app-1/candidate')
  })
})

describe('resumeFileUrl', () => {
  it('builds the URL from the API origin and encodes the filename', () => {
    expect(resumeFileUrl('1712345.pdf')).toBe('http://localhost:4000/uploads/resumes/1712345.pdf')
    expect(resumeFileUrl('resume one.pdf')).toBe('http://localhost:4000/uploads/resumes/resume%20one.pdf')
  })
})
```

Note: the existing import at the top of the test file is `import { normalizeApplication, createApplication, updateApplicationStatus, listApplications } from '../applications'`. Extend it to also import `getCandidateProfile, resumeFileUrl`.

- [ ] **Step 2: Run tests to verify they fail**

Run (from `hirehub-frontend/`): `npx vitest run src/api/__tests__/applications.test.ts`
Expected: compile/import error — `getCandidateProfile`/`resumeFileUrl` are not exported.

- [ ] **Step 3: Implement the minimal code**

Append to `hirehub-frontend/src/api/applications.ts`:

```ts
export interface CandidateProfile {
  id: string
  name: string
  email: string
  phone?: string | null
  avatarUrl?: string | null
  headline?: string | null
  location?: string | null
  skills?: string[]
  bio?: string | null
  resumePath?: string | null
  resumeFileName?: string | null
  salaryMin?: number | null
  salaryMax?: number | null
  currency?: string | null
  remoteOnly?: boolean | null
  employmentType?: string | null
  onboardingCompleted?: boolean
  createdAt: string
}

export interface CandidateResponse {
  application: BackendApplication
  candidate: CandidateProfile
}

export async function getCandidateProfile(applicationId: string) {
  const res = await apiGet<CandidateResponse>(`/applications/${applicationId}/candidate`)
  return {
    ...res,
    data: {
      ...res.data,
      application: normalizeApplication(res.data.application),
    },
  }
}

export function resumeFileUrl(resumePath: string) {
  const base = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:4000/api'
  const origin = base.replace(/\/+$/, '').replace(/\/api$/, '')
  return `${origin}/uploads/resumes/${encodeURIComponent(resumePath)}`
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run (from `hirehub-frontend/`): `npx vitest run src/api/__tests__/applications.test.ts`
Expected: all pass.

- [ ] **Step 5: Run frontend gates**

Run (from `hirehub-frontend/`): `npm run lint && npm run build`
Expected: lint 0 errors (3 pre-existing warnings), build green.

- [ ] **Step 6: Commit**

```bash
git add src/api/applications.ts src/api/__tests__/applications.test.ts
git commit -m "feat(applications): add candidate profile API and resume URL helper"
```

---

### Task 4: Frontend — CandidateDetailDrawer component

**Files:**
- Create: `hirehub-frontend/src/components/candidate/CandidateDetailDrawer.tsx`
- Create: `hirehub-frontend/src/components/candidate/index.ts`
- Create: `hirehub-frontend/src/components/candidate/__tests__/CandidateDetailDrawer.test.tsx`

**Interfaces:**
- Consumes: `Application` from `src/types/application`; `CandidateProfile`, `getCandidateProfile`, `resumeFileUrl` from `../../api/applications`; `useApplications` from `../../context/ApplicationsContext`; `useToast` from `../ui/Toast`; `InterviewScheduleModal` from `../interview`; `OfferLetterModal` from `../offer`; `Avatar`, `Button` from `../ui`.
- Produces: named export `CandidateDetailDrawer({ application, open, onOpenChange, onActionComplete }: { application: Application; open: boolean; onOpenChange: (open: boolean) => void; onActionComplete: () => void })`. Mounted by the parent only while open (parent controls `application`); internal state is fresh on every mount.

- [ ] **Step 1: Write the failing test**

Create `hirehub-frontend/src/components/candidate/__tests__/CandidateDetailDrawer.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../../../api/applications', () => ({
  getCandidateProfile: vi.fn().mockResolvedValue({
    data: {
      application: {},
      candidate: {
        id: 'u1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+1 555 0100',
        headline: 'Senior Engineer',
        location: 'Lisbon',
        skills: ['Python', 'React'],
        bio: 'Full-stack engineer with 6 years of experience.',
        resumePath: 'resume.pdf',
        resumeFileName: 'jane-resume.pdf',
        salaryMin: 50000,
        salaryMax: 70000,
        currency: 'EUR',
        employmentType: 'full-time',
        remoteOnly: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    },
  }),
  resumeFileUrl: (p: string) => `http://localhost:4000/uploads/resumes/${p}`,
}))

vi.mock('../../../context/ApplicationsContext', () => ({
  useApplications: vi.fn(() => ({
    updateApplicationStatus: vi.fn(),
  })),
}))

vi.mock('../../ui/Toast', () => ({
  useToast: vi.fn(() => ({ showToast: vi.fn() })),
}))

vi.mock('../../interview', () => ({
  InterviewScheduleModal: () => <div data-testid="interview-modal" />,
  InterviewDetails: () => <div data-testid="interview-details" />,
}))

vi.mock('../../offer', () => ({
  OfferLetterModal: () => <div data-testid="offer-modal" />,
}))

import { CandidateDetailDrawer } from '../CandidateDetailDrawer'
import type { Application } from '../../../types/application'

const application: Application = {
  id: 'app-1',
  jobId: 'job-1',
  jobTitle: 'Senior Engineer',
  company: 'Acme',
  companyLogo: '',
  applicantName: 'Jane Doe',
  applicantEmail: 'jane@example.com',
  coverLetter: 'I am a great fit for this role.',
  status: 'applied',
  submittedAt: '2026-07-01T00:00:00.000Z',
}

describe('CandidateDetailDrawer', () => {
  it('renders the candidate profile and application context', async () => {
    render(
      <CandidateDetailDrawer
        application={application}
        open
        onOpenChange={vi.fn()}
        onActionComplete={vi.fn()}
      />,
    )

    expect(await screen.findByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('Senior Engineer')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    expect(screen.getByText('+1 555 0100')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
    expect(screen.getByText('Full-stack engineer with 6 years of experience.')).toBeInTheDocument()
    expect(screen.getByText('Lisbon')).toBeInTheDocument()
    expect(screen.getByText('I am a great fit for this role.')).toBeInTheDocument()

    const resumeLink = screen.getByRole('link', { name: /open resume/i })
    expect(resumeLink).toHaveAttribute('href', 'http://localhost:4000/uploads/resumes/resume.pdf')
  })

  it('renders hiring action buttons', async () => {
    render(
      <CandidateDetailDrawer
        application={application}
        open
        onOpenChange={vi.fn()}
        onActionComplete={vi.fn()}
      />,
    )

    expect(await screen.findByRole('button', { name: /schedule interview/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /make offer/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mark reviewing/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `hirehub-frontend/`): `npx vitest run src/components/candidate/__tests__/CandidateDetailDrawer.test.tsx`
Expected: module-not-found error — `src/components/candidate/CandidateDetailDrawer.tsx` does not exist.

- [ ] **Step 3: Implement the component**

Create `hirehub-frontend/src/components/candidate/CandidateDetailDrawer.tsx`:

```tsx
import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { X, FileText, Mail, Phone, Globe, MapPin, Calendar } from 'lucide-react'
import { Avatar, Button } from '../ui'
import { useToast } from '../ui/Toast'
import { getCandidateProfile, resumeFileUrl, type CandidateProfile } from '../../api/applications'
import { useApplications } from '../../context/ApplicationsContext'
import { InterviewScheduleModal, InterviewDetails } from '../interview'
import { OfferLetterModal } from '../offer'
import type { Application } from '../../types/application'

interface CandidateDetailDrawerProps {
  application: Application
  open: boolean
  onOpenChange: (open: boolean) => void
  onActionComplete: () => void
}

function DetailRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <span className="text-ink-tertiary mt-0.5 flex-shrink-0" aria-hidden="true">{icon}</span>
      <div className="min-w-0">
        <p className="text-ink-tertiary text-xs">{label}</p>
        <div className="text-ink break-words">{children}</div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mb-2">{title}</h3>
      {children}
    </div>
  )
}

export function CandidateDetailDrawer({
  application,
  open,
  onOpenChange,
  onActionComplete,
}: CandidateDetailDrawerProps) {
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [interviewOpen, setInterviewOpen] = useState(false)
  const [offerOpen, setOfferOpen] = useState(false)
  const { showToast } = useToast()
  const { updateApplicationStatus } = useApplications()

  useEffect(() => {
    if (!open) return
    let cancelled = false
    getCandidateProfile(application.id)
      .then((res) => {
        if (!cancelled) {
          setCandidate(res.data.candidate)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load candidate profile.')
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [open, application.id])

  async function handleStatusChange(status: Application['status'], message: string) {
    try {
      await updateApplicationStatus(application.id, status)
      showToast('success', message)
      onActionComplete()
    } catch {
      showToast('error', `Failed to ${message.toLowerCase()}. Please try again.`)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 bg-black/50 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface-1 shadow-xl border-l border-hairline overflow-y-auto"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <div className="sticky top-0 bg-surface-1/95 backdrop-blur-sm border-b border-hairline px-6 py-4 flex items-center justify-between">
                  <Dialog.Title className="text-lg font-semibold text-ink">Candidate Profile</Dialog.Title>
                  <Dialog.Close asChild>
                    <button
                      className="p-1 rounded-md text-ink-tertiary hover:text-ink hover:bg-surface-2 transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="p-6 space-y-6">
                  {loading && (
                    <div className="flex items-center justify-center py-16 text-ink-muted text-sm">
                      Loading candidate profile…
                    </div>
                  )}

                  {error && (
                    <div className="py-16 text-center">
                      <p className="text-error text-sm">{error}</p>
                      <Button variant="accent" size="sm" className="mt-4" onClick={() => window.location.reload()}>
                        Retry
                      </Button>
                    </div>
                  )}

                  {candidate && !loading && (
                    <>
                      <div className="flex items-center gap-4">
                        <Avatar name={candidate.name} src={candidate.avatarUrl} size="lg" />
                        <div className="min-w-0">
                          <h2 className="text-lg font-semibold text-ink truncate">{candidate.name}</h2>
                          {candidate.headline && <p className="text-sm text-ink-muted truncate">{candidate.headline}</p>}
                          {candidate.location && (
                            <p className="text-xs text-ink-tertiary flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" aria-hidden="true" />
                              {candidate.location}
                            </p>
                          )}
                        </div>
                      </div>

                      <Section title="Contact">
                        <div className="space-y-3">
                          <DetailRow icon={<Mail className="w-4 h-4" />} label="Email">
                            <a href={`mailto:${candidate.email}`} className="text-accent hover:underline">{candidate.email}</a>
                          </DetailRow>
                          {candidate.phone && (
                            <DetailRow icon={<Phone className="w-4 h-4" />} label="Phone">
                              <a href={`tel:${candidate.phone}`} className="text-accent hover:underline">{candidate.phone}</a>
                            </DetailRow>
                          )}
                          {application.portfolioUrl && (
                            <DetailRow icon={<Globe className="w-4 h-4" />} label="Portfolio">
                              <a href={application.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline break-all">
                                {application.portfolioUrl}
                              </a>
                            </DetailRow>
                          )}
                          {candidate.resumePath && (
                            <DetailRow icon={<FileText className="w-4 h-4" />} label="Resume">
                              <a
                                href={resumeFileUrl(candidate.resumePath)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent hover:underline inline-flex items-center gap-1.5"
                              >
                                {candidate.resumeFileName || 'Download resume'}
                              </a>
                            </DetailRow>
                          )}
                        </div>
                      </Section>

                      {candidate.skills && candidate.skills.length > 0 && (
                        <Section title="Skills">
                          <div className="flex flex-wrap gap-2">
                            {candidate.skills.map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-pill text-xs font-medium bg-surface-2 text-ink"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </Section>
                      )}

                      {candidate.bio && (
                        <Section title="About">
                          <p className="text-sm text-ink whitespace-pre-line">{candidate.bio}</p>
                        </Section>
                      )}

                      {(candidate.salaryMin != null || candidate.employmentType || candidate.remoteOnly != null) && (
                        <Section title="Job Preferences">
                          <div className="space-y-3">
                            {candidate.salaryMin != null && (
                              <DetailRow icon={<Calendar className="w-4 h-4" />} label="Salary range">
                                {candidate.currency} {candidate.salaryMin.toLocaleString()}
                                {candidate.salaryMax != null ? ` – ${candidate.salaryMax.toLocaleString()}` : ''}
                              </DetailRow>
                            )}
                            {candidate.employmentType && (
                              <p className="text-sm text-ink capitalize">{candidate.employmentType.replace('-', ' ')}</p>
                            )}
                            {candidate.remoteOnly != null && (
                              <p className="text-sm text-ink">{candidate.remoteOnly ? 'Remote only' : 'Open to on-site'}</p>
                            )}
                          </div>
                        </Section>
                      )}

                      <Section title="Cover Letter">
                        <p className="text-sm text-ink whitespace-pre-line">{application.coverLetter}</p>
                      </Section>

                      {application.interviewDetails && (
                        <Section title="Hiring Progress">
                          <InterviewDetails details={application.interviewDetails} />
                        </Section>
                      )}

                      <Section title="Actions">
                        <div className="flex flex-wrap gap-2">
                          {application.status !== 'reviewing' && (
                            <Button
                              variant="accent"
                              size="sm"
                              onClick={() => handleStatusChange('reviewing', 'Marked as under review')}
                            >
                              Mark reviewing
                            </Button>
                          )}
                          {application.status !== 'interviewing' && (
                            <Button variant="accent" size="sm" onClick={() => setInterviewOpen(true)}>
                              Schedule Interview
                            </Button>
                          )}
                          {application.status !== 'offer' && (
                            <Button variant="accent" size="sm" onClick={() => setOfferOpen(true)}>
                              Make offer
                            </Button>
                          )}
                          {application.status !== 'rejected' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-error"
                              onClick={() => handleStatusChange('rejected', 'Application rejected')}
                            >
                              Reject
                            </Button>
                          )}
                        </div>
                      </Section>
                    </>
                  )}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>

      {interviewOpen && (
        <InterviewScheduleModal
          application={application}
          open={interviewOpen}
          onOpenChange={setInterviewOpen}
          onSuccess={() => { setInterviewOpen(false); onActionComplete() }}
        />
      )}
      {offerOpen && (
        <OfferLetterModal
          application={application}
          open={offerOpen}
          onOpenChange={setOfferOpen}
          onSuccess={() => { setOfferOpen(false); onActionComplete() }}
        />
      )}
    </Dialog.Root>
  )
}
```

Create `hirehub-frontend/src/components/candidate/index.ts`:

```ts
export { CandidateDetailDrawer } from './CandidateDetailDrawer'
```

Note: the Retry button uses `window.location.reload()` — a deliberate, coarse retry kept simple. If `Button` has no `size="sm"` prop that conflicts, keep the `size` values used elsewhere in the codebase (check `src/components/ui/Button.tsx` for valid sizes).

- [ ] **Step 4: Run test to verify it passes**

Run (from `hirehub-frontend/`): `npx vitest run src/components/candidate/__tests__/CandidateDetailDrawer.test.tsx`
Expected: both tests PASS.

- [ ] **Step 5: Run frontend gates**

Run (from `hirehub-frontend/`): `npm run lint && npm run build`
Expected: lint 0 errors, build green. If lint flags the `Retry` reload or unused imports, remove the offending import (e.g. `motion`/lucide icons only if truly unused).

- [ ] **Step 6: Commit**

```bash
git add src/components/candidate/
git commit -m "feat(candidate): add CandidateDetailDrawer with full profile, resume, and hiring actions"
```

---

### Task 5: Frontend — wire drawer into Admin applications list

**Files:**
- Modify: `hirehub-frontend/src/components/admin/AdminPage.tsx`

**Interfaces:**
- Consumes: `CandidateDetailDrawer` from `../candidate`; `Application` type; existing `listAdminApplications` from `../../api/admin`.
- Produces: each application card in `AdminApplicationsList` gets a "View candidate" button that opens the drawer; actions inside the drawer trigger a silent refresh of the list.

- [ ] **Step 1: Implement (no new test — covered by Task 4 drawer tests + existing admin flow)**

Edit `hirehub-frontend/src/components/admin/AdminPage.tsx`:

1. Add the import (after the `../../api/admin` import, line 6):

```tsx
import { CandidateDetailDrawer } from '../candidate'
```

2. In `AdminApplicationsList`, add state after the existing `error` state:

```tsx
  const [viewApp, setViewApp] = useState<Application | null>(null)
```

3. Replace the existing `handleRetry` with a `refresh` that supports a silent mode, and point `ErrorState` at it:

```tsx
  function refresh(silent = false) {
    if (!silent) setLoading(true)
    setError(null)
    listAdminApplications()
      .then((res) => setApps(res.data))
      .catch(() => setError('Failed to load applications.'))
      .finally(() => setLoading(false))
  }
```

`ErrorState` usage changes from `onRetry={handleRetry}` to `onRetry={refresh}`.

4. In each application card's `motion.div` (the card body), add a footer row after the submitted-date line (line 92). Place it inside the `<div className="flex-1 min-w-0">` block, after the `<p className="text-xs text-ink-tertiary mt-2">Submitted …</p>` line:

```tsx
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => setViewApp(app)}
                        className="text-xs font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded"
                      >
                        View candidate →
                      </button>
                    </div>
```

5. Render the drawer at the end of the returned JSX (inside the outer fragment — the list currently returns `<div className="space-y-4">…</div>`, so wrap the return in a fragment `<>…</>` and append):

```tsx
      {viewApp && (
        <CandidateDetailDrawer
          application={viewApp}
          open={!!viewApp}
          onOpenChange={(open) => { if (!open) setViewApp(null) }}
          onActionComplete={() => refresh(true)}
        />
      )}
```

- [ ] **Step 2: Verify with the running dev servers (manual E2E)**

Backend on `:4000` and frontend on `:5173` should be running (start if not: `npm run dev` in `hirehub-backend/` and `hirehub-frontend/`). Open `http://localhost:5173/login`, sign in as `admin@hirehub.community` / `admin123`, navigate to `/admin`. Expect: each application card shows "View candidate →"; clicking it opens the drawer with the full profile, a resume link, and the Schedule Interview / Make offer / Mark reviewing / Reject actions; scheduling an interview updates the status badge after the drawer closes.

- [ ] **Step 3: Run frontend gates**

Run (from `hirehub-frontend/`): `npm run lint && npm run test:run && npm run build`
Expected: lint 0 errors, all tests pass, build green.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/AdminPage.tsx
git commit -m "feat(admin): wire CandidateDetailDrawer into applications list"
```

---

### Task 6: Frontend — wire drawer into employer Applicants tab

**Files:**
- Modify: `hirehub-frontend/src/components/employer-dashboard/ApplicantsTab.tsx`

**Interfaces:**
- Consumes: `CandidateDetailDrawer` from `../candidate`; existing `Application` type; existing `useApplications` context (which already updates the applicant list after status/interview/offer changes).
- Produces: each applicant card gets a "View profile" button opening the drawer; actions inside refresh via the shared ApplicationsContext (no manual reload needed).

- [ ] **Step 1: Implement (no new test — the employer dashboard suite still passes unchanged)**

Edit `hirehub-frontend/src/components/employer-dashboard/ApplicantsTab.tsx`:

1. Add the import after the `../offer` import (line 9):

```tsx
import { CandidateDetailDrawer } from '../candidate'
```

2. Add state after `offerModalApp` state (line 33):

```tsx
  const [viewApp, setViewApp] = useState<Application | null>(null)
```

3. In the action row (`<div className="flex flex-wrap items-center gap-2 mt-3">`), add a "View profile" button as the first action:

```tsx
                      <button
                        onClick={() => setViewApp(app)}
                        className="text-xs font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded"
                      >
                        View profile
                      </button>
```

4. Render the drawer at the end of the returned fragment (after the `offerModalApp` block, line ~176):

```tsx
      {viewApp && (
        <CandidateDetailDrawer
          application={viewApp}
          open={!!viewApp}
          onOpenChange={(open) => { if (!open) setViewApp(null) }}
          onActionComplete={() => setViewApp(null)}
        />
      )}
```

- [ ] **Step 2: Run the employer dashboard suite**

Run (from `hirehub-frontend/`): `npx vitest run src/components/employer-dashboard`
Expected: all tests pass unchanged.

- [ ] **Step 3: Run frontend gates**

Run (from `hirehub-frontend/`): `npm run lint && npm run test:run && npm run build`
Expected: lint 0 errors, all tests pass, build green.

- [ ] **Step 4: Commit**

```bash
git add src/components/employer-dashboard/ApplicantsTab.tsx
git commit -m "feat(employer): wire CandidateDetailDrawer into applicants tab"
```

---

### Task 7: Whole-branch verification and final review

**Files:** none changed.

**Interfaces:** n/a — final gate.

- [ ] **Step 1: Backend full suite + typecheck**

Run (from `hirehub-backend/`): `npm test`
Expected: all suites pass (includes `applications-hiring-flow.test.ts`, 10 tests).

- [ ] **Step 2: Frontend full gates**

Run (from `hirehub-frontend/`): `npm run lint && npm run test:run && npm run build`
Expected: lint 0 errors, all tests pass, build green.

- [ ] **Step 3: End-to-end smoke (admin)**

With backend `:4000` and frontend `:5173` running: sign in as `admin@hirehub.community` / `admin123`. Verify at `/admin`:
- Applications tab lists applications; "View candidate →" opens the drawer with contact, skills, resume link, cover letter.
- "Mark reviewing" changes the badge; "Schedule Interview" opens the modal, saves, and the badge updates to "Interviewing".
- "Make offer" opens the offer modal and saves.

- [ ] **Step 4: End-to-end smoke (employer)**

Sign in as `employer@hirehub.community` / `password123`, open the Employer Dashboard → Applicants tab. Verify:
- Each applicant card shows "View profile" and the drawer opens with the full candidate profile + resume.
- Existing Schedule Interview / Make offer / Reject buttons still work.

- [ ] **Step 5: Final review**

Dispatch a whole-branch code review covering both repos' diffs since the plan start (`git merge-base feat/onboarding-wizard HEAD` in each repo). Fix any Critical/Important findings, re-run the affected gates, and report the demo credentials in the final summary.

---
