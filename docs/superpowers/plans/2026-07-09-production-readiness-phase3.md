# HireHub Community — Phase 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Production-harden both repos — security fixes, infrastructure (Docker + CI), server hardening, SEO basics, and performance optimization.

**Architecture:** Backend gets proper error mapping, process-level safety, rate-limit tiers, and logging improvements. Frontend gets CSP, code splitting, SEO files, and env config. Both get Dockerfiles and GitHub Actions CI.

**Tech Stack:** Docker, GitHub Actions, Sentry, Pino, Prisma Migrate, Vite

---

## Task Breakdown

### Task 3a: Backend — Security & Environment Fixes

**Files:**
- Modify: `hirehub-api/.env.example` — add all missing vars
- Modify: `hirehub-api/.gitignore` — add `uploads/`, `.env.*.local`, `coverage/`
- Create: `hirehub-api/.env.test` — test-specific env vars
- Modify: `hirehub-api/src/config/env.ts` — add sentry DSN, upload dir vars
- Modify: `hirehub-api/vitest.config.ts` — add test env file path

**Steps:**

1. Update `.env.example` with all vars:
```
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hirehub?schema=public"
JWT_ACCESS_SECRET="change-me-access-secret-min-32-chars"
JWT_REFRESH_SECRET="change-me-refresh-secret-min-32-chars"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
LOG_LEVEL=info
APP_URL="http://localhost:5173"
RESEND_API_KEY=""
SENTRY_DSN=""
UPLOAD_DIR="uploads"
MAX_FILE_SIZE_MB=10
```

2. Update `.gitignore` — add `uploads/`, `coverage/`, `.env.*.local`

3. Create `.env.test`:
```
NODE_ENV=test
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hirehub-test?schema=public"
JWT_ACCESS_SECRET="test-access-secret-123456789012345678"
JWT_REFRESH_SECRET="test-refresh-secret-1234567890123456"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=1000
LOG_LEVEL=info
APP_URL="http://localhost:5173"
UPLOAD_DIR="uploads"
MAX_FILE_SIZE_MB=10
```

4. Update `vitest.config.ts` to load test env:
```ts
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    envFile: './.env.test',
    setupFiles: ['./src/tests/setup.ts'],
    testTimeout: 15000,
  },
})
```

---

### Task 3b: Backend — Prisma Migrations

**Files:**
- Run: `prisma migrate dev --name init` (generates migration files)
- Modify: `package.json` — add `db:migrate:deploy` script
- Modify: `src/app/server.ts` — use `prisma.$connect()` before listening

**Steps:**

1. Ensure DB is running and `.env` has DATABASE_URL
2. Run `bunx prisma migrate dev --name init` — this creates `prisma/migrations/`
3. Add to `package.json` scripts:
```json
"db:migrate:deploy": "prisma migrate deploy",
"db:studio": "prisma studio"
```
4. Update `server.ts` to call `prisma.$connect()` before `ensureSearchIndex()`:
```ts
prisma.$connect()
  .then(() => ensureSearchIndex())
  .then(() => { server = app.listen(...) })
  .catch((err) => { logger.fatal({ err }, 'Failed to start server'); process.exit(1) })
```
5. Update server shutdown to disconnect prisma:
```ts
function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down gracefully')
  server?.close(async () => {
    await prisma.$disconnect()
    logger.info('Server closed')
    process.exit(0)
  })
}
```

---

### Task 3c: Backend — Process-Level Crash Safety

**Files:**
- Modify: `src/app/server.ts` — add uncaughtException/unhandledRejection handlers, Prisma disconnect on shutdown

**Steps:**

1. Add process-level handlers before the listen call:
```ts
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception')
  prisma.$disconnect().finally(() => process.exit(1))
})

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled rejection')
  prisma.$disconnect().finally(() => process.exit(1))
})
```

2. Update the existing shutdown handler to also disconnect Prisma:
```ts
function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down gracefully')
  server?.close(async () => {
    await prisma.$disconnect()
    logger.info('Server closed')
    process.exit(0)
  })
  // Force exit after 10s
  setTimeout(() => process.exit(1), 10000)
}
```

---

### Task 3d: Backend — Prisma Error Mapping Middleware

**Files:**
- Modify: `src/middleware/error-handler.ts` — add Prisma error classification

**Steps:**

1. Update the error handler to catch Prisma errors:
```ts
import { Prisma } from '@prisma/client'

// In the error handler, before the generic 500 fallback:
if (err instanceof Prisma.PrismaClientKnownRequestError) {
  switch (err.code) {
    case 'P2002':
      return res.status(409).json({ success: false, error: 'A record with this value already exists' })
    case 'P2025':
      return res.status(404).json({ success: false, error: 'Record not found' })
    case 'P2003':
      return res.status(400).json({ success: false, error: 'Referenced record does not exist' })
    default:
      logger.error({ err }, `Prisma error ${err.code}`)
      return res.status(500).json({ success: false, error: 'Database error' })
  }
}
```

---

### Task 3e: Backend — Per-Route Rate Limiting

**Files:**
- Create: `src/middleware/rate-limiters.ts` — tiered rate limiters
- Modify: `src/app/app.ts` — apply stricter limits to auth routes

**Steps:**

1. Create `src/middleware/rate-limiters.ts`:
```ts
import rateLimit from 'express-rate-limit'
import { env } from '../config/env'

export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later' },
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many login attempts, please try again later' },
})

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many uploads, please try again later' },
})
```

2. In `app.ts`:
- Remove `import { rateLimiter } from '../middleware/rate-limiter'`
- Remove `app.use(rateLimiter)` 
- After importing authRoutes, add:
```ts
app.use('/api/auth', authLimiter)
```
- Apply `uploadLimiter` on the upload routes.

3. Keep `generalLimiter` as a catch-all after all route registrations but before error handler:
```ts
app.use(generalLimiter)
```

---

### Task 3f: Backend — Request ID & Logger Improvements

**Files:**
- Create: `src/middleware/request-id.ts` — adds `req.id` via UUID
- Modify: `src/app/app.ts` — use request ID middleware
- Modify: `src/config/logger.ts` — add PII redaction

**Steps:**

1. Create `src/middleware/request-id.ts`:
```ts
import type { Request, Response, NextFunction } from 'express'
import crypto from 'node:crypto'

export function requestId(req: Request, _res: Response, next: NextFunction) {
  req.id = crypto.randomUUID()
  next()
}

declare global {
  namespace Express {
    interface Request {
      id: string
    }
  }
}
```

2. In `app.ts`, add after `app.use(rateLimiter)` (or in place of):
```ts
import { requestId } from '../middleware/request-id'
app.use(requestId)
```

3. In `logger.ts`, add redaction:
```ts
const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: ['password', 'passwordHash', 'token', 'accessToken', 'refreshToken', 'secret', 'authorization'],
    censor: '[REDACTED]',
  },
  transport: env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
})
```

---

### Task 3g: Frontend — Security Headers & SEO Files

**Files:**
- Modify: `hirehub-frontend/index.html` — add CSP meta tag, preconnect hints, default OG tags, noscript fallback
- Create: `hirehub-frontend/public/robots.txt`
- Create: `hirehub-frontend/public/sitemap.xml`
- Create: `hirehub-frontend/public/og-image.png` (generate a simple SVG-based OG image)
- Create: `hirehub-frontend/.env.example`

**Steps:**

1. Update `index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="HireHub Community connects talented job seekers with top employers. Browse thousands of curated job listings." />
    <meta property="og:title" content="HireHub Community — Find your next opportunity" />
    <meta property="og:description" content="HireHub Community connects talented job seekers with top employers." />
    <meta property="og:image" content="/og-image.png" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' http://localhost:4000 https://*.resend.com; base-uri 'self'; form-action 'self'" />
    <link rel="preconnect" href="http://localhost:4000" />
    <title>HireHub Community — Find your next opportunity</title>
  </head>
  <body>
    <div id="root"></div>
    <noscript>You need to enable JavaScript to run HireHub Community.</noscript>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

2. Create `public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://hirehub.community/sitemap.xml
```

3. Create `public/sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://hirehub.community/</loc><priority>1.0</priority></url>
  <url><loc>https://hirehub.community/jobs</loc><priority>0.9</priority></url>
  <url><loc>https://hirehub.community/blog</loc><priority>0.8</priority></url>
  <url><loc>https://hirehub.community/employers</loc><priority>0.7</priority></url>
  <url><loc>https://hirehub.community/about</loc><priority>0.7</priority></url>
  <url><loc>https://hirehub.community/contact</loc><priority>0.6</priority></url>
</urlset>
```

4. Create a simple `og-image.png` using SVG that can be rendered as PNG. Since we can't easily create a PNG, create an SVG that serves as the OG image:
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f5f1ec"/>
  <rect x="60" y="60" width="80" height="80" rx="16" fill="#ff5600"/>
  <path d="M80 100v40M80 120h40M120 100v40" stroke="white" stroke-width="6" stroke-linecap="round" fill="none"/>
  <text x="160" y="115" font-family="Inter, system-ui, sans-serif" font-size="48" font-weight="500" fill="#111111">HireHub</text>
  <text x="160" y="150" font-family="Inter, system-ui, sans-serif" font-size="28" fill="#626260">Community</text>
  <text x="60" y="320" font-family="Inter, system-ui, sans-serif" font-size="52" font-weight="500" fill="#111111">Find your next opportunity</text>
  <text x="60" y="380" font-family="Inter, system-ui, sans-serif" font-size="26" fill="#626260">Connecting talented job seekers with top employers</text>
</svg>
```
Save this as `public/og-image.svg` and reference it from `usePageMeta.tsx` as `og-image.svg` instead of `og-image.png`.

5. Create `.env.example`:
```
VITE_API_URL=http://localhost:4000/api
```

6. Verify `.gitignore` includes `.env` (not just `*.local`). The `.env` should NOT be committed.

---

### Task 3h: Frontend — Vite Production Optimization

**Files:**
- Modify: `vite.config.ts` — add manual chunks, sourcemap strategy, build target

**Steps:**

1. Update `vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          icons: ['lucide-react'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
```

2. Optionally add bundle analysis (dev only):
```bash
bun add -D vite-plugin-inspect
```

---

### Task 3i: Frontend — Lazy-Load Routes

**Files:**
- Modify: `src/App.tsx` — use `React.lazy()` for all page components

**Steps:**

1. Replace static imports with dynamic ones:
```tsx
import { lazy, Suspense } from 'react'

const HomePage = lazy(() => import('./components/home/HomePage'))
const JobBoardPage = lazy(() => import('./components/jobs/JobBoardPage'))
const JobDetailPage = lazy(() => import('./components/jobs/JobDetailPage'))
const BlogPage = lazy(() => import('./components/blog/BlogPage'))
const BlogPostPage = lazy(() => import('./components/blog/BlogPostPage'))
const EmployersPage = lazy(() => import('./components/employers/EmployersPage'))
const LoginPage = lazy(() => import('./components/auth/LoginPage'))
const SignupPage = lazy(() => import('./components/auth/SignupPage'))
const ForgotPasswordPage = lazy(() => import('./components/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./components/auth/ResetPasswordPage'))
const AboutPage = lazy(() => import('./components/about/AboutPage'))
const ContactPage = lazy(() => import('./components/contact/ContactPage'))
const PostJobPage = lazy(() => import('./components/post-job/PostJobPage'))
const DashboardPage = lazy(() => import('./components/dashboard/DashboardPage'))
const EmployerDashboardPage = lazy(() => import('./components/employer-dashboard/EmployerDashboardPage'))
```

2. Wrap the `<Routes>` in a `<Suspense>` with a fallback:
```tsx
import { Section, Container } from './components/ui'
// ...
<Suspense fallback={
  <Section><Container><div className="text-center py-16 text-ink-muted">Loading...</div></Container></Section>
}>
  <AnimatePresence mode="wait">
    <motion.div key={location.pathname} ...>
      <Routes location={location}>
        ...
      </Routes>
    </motion.div>
  </AnimatePresence>
</Suspense>
```

---

### Task 3j: Docker Setup

**Files:**
- Create: `hirehub-api/Dockerfile`
- Create: `hirehub-api/.dockerignore`
- Create: `hirehub-frontend/Dockerfile`
- Create: `hirehub-frontend/.dockerignore`
- Create: `docker-compose.yml` at the root (or in a `deploy/` directory)

**Steps:**

1. Backend Dockerfile:
```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM deps AS build
COPY . .
RUN bun run db:generate
RUN bun run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/package.json ./
EXPOSE 4000
CMD ["node", "dist/app/server.js"]
```

2. Backend `.dockerignore`:
```
node_modules
dist
.git
.env
*.log
uploads
```

3. Frontend Dockerfile:
```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS build
COPY . .
RUN bun run build

FROM nginx:alpine AS runner
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

4. Frontend `.dockerignore`:
```
node_modules
dist
.git
.env
```

5. Create `hirehub-frontend/nginx.conf` for SPA routing:
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

6. Root `docker-compose.yml`:
```yaml
version: '3.9'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: hirehub
      POSTGRES_PASSWORD: hirehub_prod
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./hirehub-api
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: "postgresql://postgres:hirehub_prod@db:5432/hirehub?schema=public"
      NODE_ENV: production
      JWT_ACCESS_SECRET: "${JWT_ACCESS_SECRET}"
      JWT_REFRESH_SECRET: "${JWT_REFRESH_SECRET}"
      CORS_ORIGIN: "http://localhost:5173"
      RESEND_API_KEY: "${RESEND_API_KEY}"
      APP_URL: "http://localhost:5173"
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build: ./hirehub-frontend
    ports:
      - "5173:80"
    depends_on:
      - backend

volumes:
  pgdata:
```

---

### Task 3k: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml` (in root or both repos)

**Steps:**

1. Create `hirehub-api/.github/workflows/ci.yml`:
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: hirehub-test
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bunx prisma generate
      - run: bunx prisma db push
      - run: bun run build
      - run: bun run test
```

2. Create `hirehub-frontend/.github/workflows/ci.yml`:
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run build
```

---

### Task 3l: Backend — Sentry Error Monitoring

**Files:**
- Modify: `src/config/env.ts` — add `SENTRY_DSN`
- Modify: `src/app/app.ts` — initialize Sentry
- Modify: `package.json` — add `@sentry/node`

**Steps:**

1. Install Sentry:
```bash
bun add @sentry/node
```

2. In `app.ts`, add before all middleware:
```ts
import * as Sentry from '@sentry/node'
import { env } from '../config/env'

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 0,
  })
  app.use(Sentry.Handlers.requestHandler())
}
```

3. Before the error handler, add:
```ts
if (env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler())
}
```

---

### Task 3m: Final Verification

**Files:**
- Both repos

**Steps:**

1. Backend: `bun run build` — 0 errors
2. Backend: `bun run test` — 19/19 pass
3. Frontend: `bun run build` — 0 errors
4. Verify `prisma/migrations/` directory exists with at least 1 migration
5. Verify docker-compose builds: `docker compose build` (if Docker available)

---

## Execution Order

```
Task 3a: Security/Env fixes (backend) ──────┐
Task 3b: Prisma Migrations (backend) ────────┤
Task 3c: Process crash safety (backend) ─────┤  Can run in parallel across
Task 3d: Prisma error mapping (backend) ─────┤  different files
Task 3e: Per-route rate limiting (backend) ──┤
Task 3f: Request ID & logger (backend) ──────┤
Task 3g: CSP/SEO files (frontend) ───────────┤
Task 3h: Vite optimization (frontend) ───────┤
Task 3i: Lazy-load routes (frontend) ────────┘
     │
     ▼
Task 3j: Docker setup (both repos) ────────── Sequential (compose needs both)
     │
     ▼
Task 3k: GitHub Actions CI (both repos) ───── Sequential (needs docker context)
     │
     ▼
Task 3l: Sentry (backend) ─────────────────── Sequential (lowest priority)
     │
     ▼
Task 3m: Final verification
```
