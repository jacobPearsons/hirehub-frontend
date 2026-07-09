# HireHub Community — Phase 2 Implementation Plan

**Goal:** Fill UX gaps, add admin panel, file uploads, dark mode, toasts, and full-text search.

---

## Task Breakdown

### Task 2a: Backend — Resume Upload Endpoint

**Files:**
- Add `multer` dependency
- Create `src/services/upload.ts` — multer config, file filter (PDF only, 10MB), local `uploads/resumes/`
- Create `src/modules/upload/upload.routes.ts` — POST `/api/upload/resume`
- Create `src/modules/upload/upload.controller.ts` — accepts file, returns `{ url, fileName }`
- Update Application model in Prisma: add `resumePath` and `resumeFileName` fields
- Update applications controller to accept `resumePath`/`resumeFileName` on create

### Task 2b: Backend — Full-Text Search

**Files:**
- Create `src/services/search.ts` — raw SQL with `to_tsvector` / `to_tsquery` on Job title, company, description, tags
- Update `JobsRepository.list()` to accept a `search` param and use full-text search instead of basic filtering
- Or add a separate `/api/jobs/search?q=` endpoint

### Task 2c: Backend — Admin Module

**Files:**
- Create `src/modules/admin/admin.routes.ts`
- Create `src/modules/admin/admin.controller.ts`
- Create `src/middleware/requireAdmin.ts` (checks role === 'ADMIN')
- Add `ADMIN` role to UserRole enum in Prisma
- Admin endpoints:
  - GET /api/admin/users — list all users
  - PATCH /api/admin/users/:id/role — change user role
  - DELETE /api/admin/jobs/:id — delete any job
  - GET /api/admin/blog-posts — list all posts
  - DELETE /api/admin/blog-posts/:id — delete any post
- Register routes in app.ts

### Task 2d: Backend — Email Notifications

**Files:**
- Modify `src/services/email.ts` — add `sendWelcomeEmail(user)`, `sendApplicationStatusEmail(application, status)`
- Integrate welcome email in auth service on register
- Integrate status change email in applications service on updateStatus

### Task 2e: Backend — OpenAPI / Swagger

**Files:**
- Add `swagger-jsdoc` + `swagger-ui-express` dependencies
- Create `src/config/swagger.ts` — OpenAPI spec definition
- Add `/api/docs` route in app.ts

### Task 2f: Frontend — Skeleton Loaders + EmptyState + Error Boundaries

**Files:**
- Create `src/components/ui/Skeleton.tsx` — skeleton primitives (SkeletonText, SkeletonCard, SkeletonAvatar)
- Create `src/components/ui/EmptyState.tsx` — icon + title + description + action CTA
- Create `src/components/ErrorBoundary.tsx` — React error boundary with fallback UI
- Integrate skeletons into JobBoardPage, JobDetailPage, BlogPage, Dashboard pages
- Replace inline empty states with <EmptyState /> component
- Wrap app in ErrorBoundary in main.tsx or App.tsx

### Task 2g: Frontend — Toast Notification System

**Files:**
- Create `src/components/ui/Toast.tsx` — toast component with variants (success, error, info)
- Create `src/context/ToastContext.tsx` — provider + `useToast()` hook with `addToast()`, auto-dismiss
- Integrate toasts into LoginPage, SignupPage, ApplyJobForm, ContactForm, etc.

### Task 2h: Frontend — Dark Mode Toggle

**Files:**
- Create `src/hooks/useDarkMode.ts` — toggle + localStorage persistence + `prefers-color-scheme` media query
- Create `src/components/ui/DarkModeToggle.tsx` — sun/moon icon button
- Update `index.css` — add `.dark` class variants for all CSS custom properties
- Add toggle to Navbar

### Task 2i: Frontend — Dynamic OG Meta Tags

**Files:**
- Create `src/utils/seo.ts` — helper to set `<meta>` tags dynamically
- Update `usePageMeta` hook to also set OG tags
- Update JobDetailPage and BlogPostPage to pass image, title, description for OG

---

## Execution Order

```
Task 2a: Resume Upload (backend) ────┐
Task 2b: Full-Text Search (backend) ──┤
Task 2c: Admin Module (backend) ──────┤  Can run in parallel
Task 2d: Email Notifications (backend)┤
Task 2e: OpenAPI (backend) ───────────┘
     │
Task 2f: Skeleton + EmptyState + ErrorBoundary (frontend)
     │
Task 2g: Toast System (frontend)
     │
Task 2h: Dark Mode (frontend)
     │
Task 2i: Dynamic OG Tags (frontend)
     │
Final: Verify build + tests
```
