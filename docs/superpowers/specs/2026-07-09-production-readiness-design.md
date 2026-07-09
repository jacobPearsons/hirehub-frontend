# HireHub Community — Production Readiness Design

> **Status:** Draft
> **Scope:** Frontend (Vite + React 19 + TS 6) + Backend API (Express 4.21 + Prisma + PostgreSQL)
> **Stack:** Listed in respective `package.json` files
> **Design Style:** Minimal warm SaaS (existing)

---

## 1. Executive Summary

HireHub Community is a job board platform with a feature-complete frontend UI and a modular Express API. The frontend currently relies on hardcoded static data and localStorage state with no API integration. The backend has a solid architecture (modules, middleware chain, JWT auth, Zod validation, error hierarchy) but lacks seed data, tests, Docker, email service, file uploads, and several critical implementations (forgot/reset password).

This spec outlines a phased approach to bridge the gap between a functional MVP and a production-ready platform.

---

## 2. Gap Analysis

### 2.1 Backend Gaps

| Category | Gap | Severity |
|----------|-----|----------|
| **Data** | No seed script — database starts empty | High |
| **Auth** | Forgot/reset password stubbed | High |
| **Email** | No email service — Resend not integrated | High |
| **Files** | No file upload (resumes, logos) | Medium |
| **Tests** | vitest + supertest installed, zero tests | High |
| **Infra** | No Dockerfile, no docker-compose | Medium |
| **Admin** | No admin role, routes, or dashboard | Medium |
| **Search** | Basic filter only, no full-text search | Medium |

### 2.2 Frontend Gaps

| Category | Gap | Severity |
|----------|-----|----------|
| **API Layer** | No fetch client — all data hardcoded static | High |
| **Auth Integration** | Auth pages are UI-only | High |
| **Loading States** | No preloader, no skeleton loaders | High |
| **Empty/Error States** | No dedicated components | Medium |
| **Pagination** | All jobs loaded at once | Medium |
| **Resume Upload** | Portfolio URL text field instead of file | Medium |

### 2.3 Immediate Items (upgrades.md)

1. **Preloader** — Global loading overlay, always active
2. **Clickable Featured Jobs** — Link FeaturedJobs cards to `/jobs/:id`
3. **Resume Upload** — Replace `portfolioUrl` with file upload in ApplyJobForm

---

## 3. Architecture Decisions

| Concern | Decision | Rationale |
|---------|----------|-----------|
| **API Client** | Custom fetch wrapper with JWT refresh interceptor | No extra dependency, full control |
| **File Storage** | multer + local `uploads/` (dev); S3-compatible (prod) | Simplest path to working uploads |
| **Email** | Resend SDK | Already in backend-express templates |
| **State Migration** | Gradual — static data stays as fallback | Avoid breaking app during incremental integration |
| **Preloader** | AppContext-based loading state + framer-motion fade overlay | Consistent with existing animation patterns |
| **Seed Data** | Prisma seed script reading from frontend `src/data/jobs.ts` | Single source of truth |

---

## 4. Phase Breakdown

### Phase 0 — Immediate Upgrades

**Goal:** Deliver 3 items from `upgrades.md` + seed data.

```
Frontend:
  - Create Preloader component (ui/Preloader.tsx)
  - Make FeaturedJobs cards clickable
  - Replace portfolioUrl with file upload in ApplyJobForm

Backend:
  - Create seed.ts with demo users, 32 jobs, blog posts, pricing tiers
```

### Phase 1 — API Integration + Hardening

**Goal:** Connect frontend to backend, fill critical gaps.

```
Frontend:
  - Create src/api/ fetch client with JWT refresh interceptor
  - Connect auth pages to API
  - Replace static data with API calls for jobs, blog, applications, saved jobs
  - Add cursor-based pagination to job board
  - Update AppContext to sync with API state

Backend:
  - Implement forgot/reset password with Resend
  - Enhanced health endpoint (DB check)
  - Dockerfile + docker-compose.yml
  - Tests for auth, jobs, applications routes
```

### Phase 2 — Production Polish

**Goal:** Fill UX gaps, add admin panel, file uploads.

```
Frontend:
  - Skeleton loaders, EmptyState component, error boundaries
  - Toast notification system
  - Dark mode toggle
  - Dynamic OG meta tags per job/blog

Backend:
  - Admin module (user/job/blog moderation)
  - Resume upload endpoint (multer + S3)
  - Email notifications (welcome, status change)
  - Full-text search via Postgres tsvector
  - OpenAPI/swagger docs
```

### Phase 3 — Enhancement Features

**Goal:** Platform-differentiating features.

```
- User profiles (seeker skills/experience, employer company pages)
- One-click apply with saved profile
- Job alerts / saved search notifications
- In-app notifications via Socket.io
- Stripe integration for paid job postings
- Analytics dashboard
```

---

## 5. Data Model Changes

### Application — Add resume field

```prisma
model Application {
  // ... existing fields ...
  resumePath     String?
  resumeFileName String?
}
```

### User — Add profile fields (Phase 3)

```prisma
model User {
  // ... existing fields ...
  avatarUrl     String?
  title         String?
  phone         String?
  location      String?
  skills        String[]
  experience    Json?
  education     Json?
}
```

---

## 6. Security

| Concern | Mitigation |
|---------|------------|
| **File upload** | Validate file type (PDF only), size limit (10MB) |
| **Rate limiting** | Already configured — review auth endpoints (5/min) |
| **JWT rotation** | Already implemented (refresh token rotation) |
| **Cookie security** | httpOnly, secure, sameSite strict already set |
| **CORS** | Already configured — update for production origin |
| **Helmet** | Already active — review CSP for production |

---

## 7. File Inventory

### Phase 0

| File | Action |
|------|--------|
| `src/components/ui/Preloader.tsx` | Create |
| `src/components/home/FeaturedJobs.tsx` | Modify |
| `src/components/apply/ApplyJobForm.tsx` | Modify |
| `hirehub-api/src/prisma/seed.ts` | Create |
| `hirehub-api/prisma/schema.prisma` | Modify (add resumePath) |

### Phase 1

| File | Action |
|------|--------|
| `src/api/client.ts` | Create |
| `src/api/auth.ts`, `src/api/jobs.ts`, etc. | Create |
| `src/context/AppContext.tsx` | Modify |
| `src/components/auth/*.tsx` | Modify |
| `hirehub-api/src/modules/auth/auth.service.ts` | Modify |
| `hirehub-api/Dockerfile` | Create |
| `hirehub-api/docker-compose.yml` | Create |
| `hirehub-api/src/tests/` | Create |

### Phase 2

| File | Action |
|------|--------|
| `src/components/ui/Skeleton.tsx` | Create |
| `src/components/ui/EmptyState.tsx` | Create |
| `src/components/ui/Toast.tsx` + context | Create |
| `src/hooks/useDarkMode.ts` | Create |
| `hirehub-api/src/modules/admin/` | Create |
| `hirehub-api/src/services/email.ts` | Create |
| `hirehub-api/src/services/search.ts` | Create |

---

## 8. Success Criteria

| Phase | Criteria |
|-------|----------|
| Phase 0 | Preloader visible on route transitions; FeaturedJobs links to job detail; resume upload works; API starts with seed data |
| Phase 1 | User can sign up, log in, browse jobs, apply, save jobs through API; Docker compose up starts full stack; `npm test` passes |
| Phase 2 | All pages have loading/empty/error states; admin can moderate; resumes upload; dark mode works |
| Phase 3 | Email alerts; one-click apply; Stripe functional |
