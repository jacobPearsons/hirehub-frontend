# Blog Digest August 2026 — Frontend Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the 5 already-seeded August 2026 digest blog posts so they render with their AI-generated covers on HireHub, fix the backend author-shape contract so the blog doesn't crash, and replace the generic blog loading skeleton with one that mirrors the real `FeaturedPost` + `BlogCard` layouts.

**Architecture:** Five tasks across two sibling git repos. Task 1 adds a pure `toBlogPostDto` mapper in the backend so `GET /api/blog-posts` returns the nested `author: { name, avatar, role }` shape the frontend already expects (fixing a latent runtime crash). Task 2 moves the 5 cover PNGs from `public/new/` (prompt-text filenames) to `public/` root with the clean names the seed references. Task 3 re-seeds the backend DB so the 5 digest posts exist, verified at the DB level. Task 4 adds `BlogSkeletonGrid` + `BlogPostSkeleton` to the frontend (matching `BlogCard`/`FeaturedPost`/article geometry) and swaps them into the two loading branches, TDD-style. Task 5 is full verification: lint, tests, builds, servers up, cover URLs return 200.

**Tech Stack:** Backend Node/Express + Prisma + TypeScript + Vitest; frontend React 19 + Vite + framer-motion + @tanstack/react-query + Vitest/RTL. No new packages.

## Global Constraints

- **Git discipline (from parent plan):** NEVER run `git add -A` / `git add .`; only `git add` the exact files each task lists, then commit with a message matching repo style (`feat(...)`, `fix(...)`, `refactor(...)`, `chore(...)`). `hirehub-frontend` and `hirehub-backend` are **separate git repos**; each task commits only inside its own repo.
- Backend blog posts live ONLY in `hirehub-backend/src/prisma/seed.ts` `blogPostsData` (not `hirehub-backend/prisma/seed.ts`, a 58-line role-only seed). Do not modify seed content in this plan.
- The 5 digest posts already exist in `blogPostsData` (lines 1341-1419) referencing `/blog-cover-us-labor-2026.png`, `/blog-cover-job-search-2026.png`, `/blog-cover-culture-2026.png`, `/blog-cover-remote-2026.png`, `/blog-cover-ai-2026.png`. Categories are valid (`Industry News`, `Hiring Tips`, `Company Culture`, `Career Advice`). Exactly one `featured: true` (`us-labor-market-2026-outlook`).
- Frontend `BlogPost` type (`src/data/blog.ts:8`) is `author: { name: string; avatar: string; role: string }`. Backend Prisma `BlogPost` (`prisma/schema.prisma:239-255`) is flat `authorName/authorAvatar/authorRole`. **The API must return the nested shape** (components call `post.author.name.charAt(0)` — `BlogCard.tsx:50`, `FeaturedPost.tsx:44`, `BlogPostPage.tsx:68`). Do not change the frontend type or components.
- `public/new/` holds 8 images: the 5 blog covers (1672×941, 16:9) plus 3 layout images referenced by `OverviewTab.tsx` (URL-encoded avatars) and `DashboardShowcase.tsx` (`MOBILE_SHOT`). Move ONLY the 5 blog covers; leave the 3 layout images untouched.
- Cover files must be 16:9 (matches `BlogCard` `h-48` and `FeaturedPost` `h-64 md:h-80` image blocks). Verify dimensions with `file(1)` after moving.
- Backend Vitest: `globals: true`, `environment: 'node'`, `envFile: './.env.test'`, `setupFiles: ['./src/tests/setup.ts']` (connects Prisma), `include: ['src/**/*.{test,spec}.{ts,tsx}']`. Integration tests hit the test DB; unit tests must be DB-independent.
- Frontend commands: `npm run lint` (eslint ., 0 errors), `npm run test:run` (vitest run), `npm run build` (tsc -b && vite build). Backend: `npm run build` (tsc), `npm test` (vitest run).
- Vite dev server proxies `/api` → `http://localhost:4000`; frontend dev runs on 5173.
- Repos' current HEADs (recorded as task BASEs): frontend `23c9340` on `main`; backend `59ad211` on `feat/onboarding-wizard`.

---

## File Structure

| File | Change | Responsibility |
|------|--------|----------------|
| `hirehub-backend/src/modules/blog/blog.dto.ts` | Create | Pure `toBlogPostDto` — flat → nested `author` |
| `hirehub-backend/src/modules/blog/blog.dto.test.ts` | Create | Unit tests for `toBlogPostDto` |
| `hirehub-backend/src/modules/blog/blog.service.ts` | Modify | Map repo results through `toBlogPostDto` in `list` + `getBySlug` |
| `hirehub-backend/src/tests/blog.test.ts` | Modify | Add nested-author shape assertion to list route test |
| `hirehub-frontend/public/blog-cover-*.png` ×5 | Move | Cover images from `public/new/` → `public/` root, clean names |
| `hirehub-frontend/src/components/blog/BlogSkeleton.tsx` | Create | `BlogSkeletonGrid` + `BlogPostSkeleton` (blog-accurate geometry) |
| `hirehub-frontend/src/components/blog/BlogPage.tsx` | Modify | Loading branch → `BlogSkeletonGrid` |
| `hirehub-frontend/src/components/blog/BlogPostPage.tsx` | Modify | Loading branch → `BlogPostSkeleton` |
| `hirehub-frontend/src/components/blog/__tests__/BlogPage.test.tsx` | Modify | Loading test asserts new status label |
| `hirehub-frontend/src/components/blog/__tests__/BlogPostPage.test.tsx` | Modify | Loading test asserts new status label |

---

## Task 1: Backend author-shape mapper

**Files:**
- Create: `hirehub-backend/src/modules/blog/blog.dto.ts`
- Create: `hirehub-backend/src/modules/blog/blog.dto.test.ts`
- Modify: `hirehub-backend/src/modules/blog/blog.service.ts`
- Modify: `hirehub-backend/src/tests/blog.test.ts`

**Interfaces:**
- Consumes: Prisma `BlogPost` row shape — `authorName: string`, `authorAvatar: string | null`, `authorRole: string | null` (from `blog.repository.ts` `findMany` / `findBySlug`).
- Produces: `export function toBlogPostDto(post: BlogPost): BlogPostDto` where `BlogPostDto` has `author: { name, avatar, role }` and no `authorName/authorAvatar/authorRole`. `blog.service.ts` returns `posts: items.map(toBlogPostDto)` and `getBySlug` returns `toBlogPostDto(post)`. Task 2+ don't consume it, but the frontend API contract does (nested `author`).

- [ ] **Step 1: Write the failing unit test**

`hirehub-backend/src/modules/blog/blog.dto.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import type { BlogPost } from '@prisma/client'
import { toBlogPostDto } from './blog.dto'

const flatPost: BlogPost = {
  id: '1',
  slug: 'us-labor-market-2026-outlook',
  title: 'US Labor Market 2026 Outlook: A Cautious Road Ahead',
  excerpt: 'The US labor market enters 2026 in a cautious phase.',
  content: 'Paragraph one.\n\nParagraph two.',
  image: '/blog-cover-us-labor-2026.png',
  category: 'Industry News',
  authorName: 'HireHub Editorial',
  authorAvatar: 'https://i.pravatar.cc/150?u=hirehub-editorial',
  authorRole: 'HireHub Editorial Team',
  date: new Date('2026-08-04'),
  readTime: 4,
  featured: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('toBlogPostDto', () => {
  it('nests author fields into an author object', () => {
    const dto = toBlogPostDto(flatPost)
    expect(dto.author).toEqual({
      name: 'HireHub Editorial',
      avatar: 'https://i.pravatar.cc/150?u=hirehub-editorial',
      role: 'HireHub Editorial Team',
    })
  })

  it('drops the flat author fields from the payload', () => {
    const dto = toBlogPostDto(flatPost) as Record<string, unknown>
    expect(dto.authorName).toBeUndefined()
    expect(dto.authorAvatar).toBeUndefined()
    expect(dto.authorRole).toBeUndefined()
  })

  it('preserves all other post fields', () => {
    const dto = toBlogPostDto(flatPost)
    expect(dto.slug).toBe('us-labor-market-2026-outlook')
    expect(dto.image).toBe('/blog-cover-us-labor-2026.png')
    expect(dto.category).toBe('Industry News')
    expect(dto.featured).toBe(true)
    expect(dto.date).toBeInstanceOf(Date)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `hirehub-backend`): `npx vitest run src/modules/blog/blog.dto.test.ts`
Expected: FAIL — module `./blog.dto` not found (Cannot find module).

- [ ] **Step 3: Write the DTO module**

`hirehub-backend/src/modules/blog/blog.dto.ts`:

```ts
import type { BlogPost } from '@prisma/client'

export interface BlogPostAuthor {
  name: string
  avatar: string | null
  role: string | null
}

export interface BlogPostDto {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  image: string | null
  category: string
  author: BlogPostAuthor
  date: Date
  readTime: number
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

export function toBlogPostDto(post: BlogPost): BlogPostDto {
  const { authorName, authorAvatar, authorRole, ...rest } = post
  return {
    ...rest,
    author: { name: authorName, avatar: authorAvatar, role: authorRole },
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `hirehub-backend`): `npx vitest run src/modules/blog/blog.dto.test.ts`
Expected: PASS, 3 tests, output pristine.

- [ ] **Step 5: Wire the mapper into the service**

`hirehub-backend/src/modules/blog/blog.service.ts` — add import and map both methods:

```ts
import { BlogRepository } from './blog.repository'
import { NotFoundError } from '../../middleware/error-handler'
import { toBlogPostDto } from './blog.dto'

export class BlogService {
  private repo = new BlogRepository()

  async list(params: { category?: string; cursor?: string; take?: number }) {
    const take = params.take ?? 6
    const where: any = {}
    if (params.category) where.category = params.category

    const posts = await this.repo.findMany({ where, take, cursor: params.cursor })
    const total = await this.repo.count(where)

    const hasMore = posts.length > take
    const items = hasMore ? posts.slice(0, take) : posts
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined

    return { posts: items.map(toBlogPostDto), pagination: { total, cursor: nextCursor ?? null } }
  }

  async getBySlug(slug: string) {
    const post = await this.repo.findBySlug(slug)
    if (!post) throw new NotFoundError('Blog post')
    return toBlogPostDto(post)
  }
}
```

- [ ] **Step 6: Add the integration shape assertion**

`hirehub-backend/src/tests/blog.test.ts` — inside `describe('GET /api/blog-posts')`, add:

```ts
    it('should return posts with a nested author object', async () => {
      const res = await request(app).get('/api/blog-posts').expect(200)
      expect(res.body.success).toBe(true)
      if (res.body.data.length === 0) return
      const post = res.body.data[0]
      expect(post.author).toBeDefined()
      expect(typeof post.author.name).toBe('string')
      expect(post.authorName).toBeUndefined()
    })
```

- [ ] **Step 7: Run backend tests + build**

Run (from `hirehub-backend`): `npm test` then `npm run build`
Expected: both green (the new unit test + the full suite; integration tests tolerate empty test DB). tsc compiles clean.

- [ ] **Step 8: Commit (backend repo only)**

```bash
cd hirehub-backend
git add src/modules/blog/blog.dto.ts src/modules/blog/blog.dto.test.ts src/modules/blog/blog.service.ts src/tests/blog.test.ts
git commit -m "fix(blog): map flat author fields to nested author DTO"
```

---

## Task 2: Move the 5 cover images into `public/`

**Files:**
- Move: `hirehub-frontend/public/new/(`blog-cover-us-labor-2026.png` — job market ⁄ economic outlook).png` → `hirehub-frontend/public/blog-cover-us-labor-2026.png`
- Move: `hirehub-frontend/public/new/(`blog-cover-job-search-2026.png` — job-search strategy).png` → `hirehub-frontend/public/blog-cover-job-search-2026.png`
- Move: `hirehub-frontend/public/new/(`blog-cover-culture-2026.png` — workplace culture trends).png` → `hirehub-frontend/public/blog-cover-culture-2026.png`
- Move: `hirehub-frontend/public/new/(`blog-cover-remote-2026.png` — remote work landscape.png` → `hirehub-frontend/public/blog-cover-remote-2026.png`
- Move: `hirehub-frontend/public/new/(`blog-cover-ai-2026.png` — AI at work).png` → `hirehub-frontend/public/blog-cover-ai-2026.png`

**Interfaces:**
- Consumes: nothing.
- Produces: 5 files at `public/blog-cover-*.png` so the seeded `/blog-cover-*.png` paths resolve in the browser. The 3 layout images stay in `public/new/`.

- [ ] **Step 1: List the source files to confirm exact names**

Run (from `hirehub-frontend`): `ls -1 public/new/`
Expected: the 5 `(blog-cover-*.png` prompt-text files plus `(mobile dashboard overview — 9:16).png`, `(profile card avatar — neutral subject, light mode).png`, `same subject and scene, dark mode).png`.

- [ ] **Step 2: Move the 5 covers with exact quoted paths**

Run (from `hirehub-frontend`), one `mv` per file — note the remote one has no trailing `)` before `.png`:

```bash
mv "public/new/(\`blog-cover-us-labor-2026.png\` — job market ⁄ economic outlook).png" public/blog-cover-us-labor-2026.png
mv "public/new/(\`blog-cover-job-search-2026.png\` — job-search strategy).png" public/blog-cover-job-search-2026.png
mv "public/new/(\`blog-cover-culture-2026.png\` — workplace culture trends).png" public/blog-cover-culture-2026.png
mv "public/new/(\`blog-cover-remote-2026.png\` — remote work landscape.png" public/blog-cover-remote-2026.png
mv "public/new/(\`blog-cover-ai-2026.png\` — AI at work).png" public/blog-cover-ai-2026.png
```

- [ ] **Step 3: Verify presence, dimensions, and aspect ratio**

Run (from `hirehub-frontend`): `file public/blog-cover-*.png && ls -1 public/new/`
Expected: 5 PNGs each reported as **1672×941** (16:9); `public/new/` still contains exactly the 3 layout images; no other `blog-cover` files.

- [ ] **Step 4: Commit (frontend repo only)**

```bash
cd hirehub-frontend
git add public/blog-cover-us-labor-2026.png public/blog-cover-job-search-2026.png public/blog-cover-culture-2026.png public/blog-cover-remote-2026.png public/blog-cover-ai-2026.png
git commit -m "feat(blog): move August 2026 digest cover images into public"
```

---

## Task 3: Re-seed backend DB and verify digest posts

**Files:**
- None (seed content already committed in `0340308`; running it is destructive but required).

**Interfaces:**
- Consumes: `hirehub-backend/src/prisma/seed.ts` (does `blogPost.deleteMany()` at line 16, then creates 11 posts including the 5 digest posts). `npm run db:seed` → `tsx src/prisma/seed.ts` against `DATABASE_URL` in `hirehub-backend/.env` (postgres on localhost:5432/hirehub — confirmed accepting connections).
- Produces: 5 digest posts present in the dev DB, verified at the DB level without needing a running server.

- [ ] **Step 1: Run the seed**

Run (from `hirehub-backend`): `npm run db:seed`
Expected: output ends with `✓ Created 11 blog posts` and no errors. Note: this wipes applications/jobs/users (expected — dev seed).

- [ ] **Step 2: Verify the 5 digest posts exist at the DB level**

Run (from `hirehub-backend`):

```bash
npx tsx -e "import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); const posts = await p.blogPost.findMany({ orderBy: { date: 'desc' }, take: 5 }); console.log(posts.map(x => x.slug).join('\n')); await p.\$disconnect();"
```

Expected: prints, in order:
```
us-labor-market-2026-outlook
practical-job-search-plan-2026
workplace-culture-trends-2026
remote-work-landscape-2026
ai-impact-on-work-2026
```

- [ ] **Step 3: Confirm exactly one featured post**

Run (from `hirehub-backend`): `npx tsx -e "import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); const f = await p.blogPost.findMany({ where: { featured: true } }); console.log(f.map(x => x.slug).join('\n')); await p.\$disconnect();"`
Expected: `us-labor-market-2026-outlook` only.
(No commit — no files changed.)

---

## Task 4: Blog-accurate loading skeletons

**Files:**
- Create: `hirehub-frontend/src/components/blog/BlogSkeleton.tsx`
- Modify: `hirehub-frontend/src/components/blog/BlogPage.tsx:31` (loading branch + import)
- Modify: `hirehub-frontend/src/components/blog/BlogPostPage.tsx:26` (loading branch + import)
- Modify: `hirehub-frontend/src/components/blog/__tests__/BlogPage.test.tsx` (loading test)
- Modify: `hirehub-frontend/src/components/blog/__tests__/BlogPostPage.test.tsx` (loading test)

**Interfaces:**
- Consumes: `Skeleton` primitive (`src/components/ui/Skeleton.tsx` — `animate-pulse bg-surface-2`, `variant: 'text' | 'circular' | 'rectangular'`, `width`/`height` style props, `className` appended); `BlogPage.tsx` currently imports `SkeletonGrid` from `../ui/SkeletonGrid`; `BlogPostPage.tsx` currently imports `SkeletonCard` from `../ui/SkeletonCard`.
- Produces: `export function BlogSkeletonGrid()` (root `role="status"` + `aria-label="Loading blog posts..."`; featured-style card + 3-col grid of `BlogCard`-style cards) and `export function BlogPostSkeleton()` (root `role="status"` + `aria-label="Loading blog post..."`, `max-w-3xl mx-auto`, article geometry). `BlogPage` renders `<BlogSkeletonGrid />` inside `<Container>`; `BlogPostPage` renders `<BlogPostSkeleton />` inside `<Container>`.

**Geometry to mirror (verify against the real components before coding):**
- `FeaturedPost.tsx:21` image: `h-64 md:h-80`, left half `md:w-1/2`, `rounded-l-lg`; right column `p-8 md:p-10`, tag pill, `text-[28px]` title (2 lines), `text-base` excerpt (2-3 lines), author row (`w-8 h-8` circle + name/date lines).
- `BlogCard.tsx:31` image: `w-full h-48`, `rounded-t-lg`; body `p-5`: tag pill, `text-[22px]` title (2 lines), `text-sm` excerpt (2 lines), author row (`w-8 h-8` circle + 2 lines).
- `BlogPostPage.tsx:63` image: `w-full h-72 md:h-96 rounded-xl`; tag pill; `text-[40px]` title (2 lines); author row (`w-10 h-10` circle); then body paragraphs.
- Card chrome (from `Card.tsx`): `bg-surface-1 rounded-lg border border-hairline`.

- [ ] **Step 1: Write the failing loading-test assertions**

`hirehub-frontend/src/components/blog/__tests__/BlogPage.test.tsx` — replace the first test body with:

```tsx
  it('shows loading skeleton initially', async () => {
    const { listBlogPosts } = await import('../../../api/blog')
    ;(listBlogPosts as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}))

    renderBlogPage()
    expect(screen.getByRole('status', { name: /loading blog posts/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /blog$/i })).not.toBeInTheDocument()
  })
```

`hirehub-frontend/src/components/blog/__tests__/BlogPostPage.test.tsx` — replace the first test body with:

```tsx
  it('shows the skeleton while loading', async () => {
    const { getBlogPostBySlug } = await import('../../../api/blog')
    ;(getBlogPostBySlug as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}))

    renderBlogPostPage()
    expect(screen.getByRole('status', { name: /loading blog post/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Hello World' })).not.toBeInTheDocument()
  })
```

- [ ] **Step 2: Run the tests to verify they fail**

Run (from `hirehub-frontend`): `npx vitest run src/components/blog/__tests__/BlogPage.test.tsx src/components/blog/__tests__/BlogPostPage.test.tsx`
Expected: FAIL — `SkeletonGrid` has `aria-label="Loading..."` (not "Loading blog posts...") and `SkeletonCard` has no `role="status"`, so `getByRole('status', ...)` throws for both.

- [ ] **Step 3: Write `BlogSkeleton.tsx`**

`hirehub-frontend/src/components/blog/BlogSkeleton.tsx`:

```tsx
import { Skeleton } from '../ui/Skeleton'

export function BlogSkeletonGrid() {
  return (
    <div role="status" aria-label="Loading blog posts..." className="space-y-6">
      <div className="flex flex-col md:flex-row bg-surface-1 rounded-lg border border-hairline overflow-hidden">
        <div className="w-full md:w-1/2">
          <Skeleton variant="rectangular" className="w-full h-64 md:h-80" />
        </div>
        <div className="p-8 md:p-10 flex-1 space-y-4">
          <Skeleton width="72px" height="24px" />
          <Skeleton width="80%" height="28px" />
          <Skeleton width="55%" height="28px" />
          <Skeleton />
          <Skeleton width="80%" />
          <div className="flex items-center gap-2 pt-2">
            <Skeleton variant="circular" width="32px" height="32px" />
            <div className="space-y-2 flex-1">
              <Skeleton width="40%" />
              <Skeleton width="60%" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface-1 rounded-lg border border-hairline overflow-hidden">
            <Skeleton variant="rectangular" className="w-full h-48" />
            <div className="p-5 space-y-3">
              <Skeleton width="72px" height="24px" />
              <Skeleton width="90%" height="22px" />
              <Skeleton width="60%" height="22px" />
              <Skeleton />
              <Skeleton width="85%" />
              <div className="flex items-center gap-2 pt-1">
                <Skeleton variant="circular" width="32px" height="32px" />
                <div className="space-y-2 flex-1">
                  <Skeleton width="40%" />
                  <Skeleton width="60%" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function BlogPostSkeleton() {
  return (
    <div role="status" aria-label="Loading blog post..." className="max-w-3xl mx-auto space-y-6">
      <Skeleton variant="rectangular" className="w-full h-72 md:h-96" />
      <Skeleton width="80px" height="26px" />
      <Skeleton width="85%" height="40px" />
      <Skeleton width="55%" height="40px" />
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width="40px" height="40px" />
        <div className="space-y-2 flex-1">
          <Skeleton width="40%" />
          <Skeleton width="60%" />
        </div>
      </div>
      <div className="space-y-3 pt-2">
        <Skeleton />
        <Skeleton />
        <Skeleton width="90%" />
        <Skeleton width="95%" />
        <Skeleton width="70%" />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Wire `BlogSkeletonGrid` into `BlogPage`**

`hirehub-frontend/src/components/blog/BlogPage.tsx`:
- Replace `import { SkeletonGrid } from '../ui/SkeletonGrid'` with `import { BlogSkeletonGrid } from './BlogSkeleton'`.
- Replace the loading branch body:

```tsx
  if (isLoading) {
    return (
      <>
        {meta}
        <Section>
          <Container><BlogSkeletonGrid /></Container>
        </Section>
      </>
    )
  }
```

- [ ] **Step 5: Wire `BlogPostSkeleton` into `BlogPostPage`**

`hirehub-frontend/src/components/blog/BlogPostPage.tsx`:
- Replace `import { SkeletonCard } from '../ui/SkeletonCard'` with `import { BlogPostSkeleton } from './BlogSkeleton'`.
- Replace the loading branch body:

```tsx
  if (isLoading) {
    return (
      <>
        {meta}
        <Section>
          <Container><BlogPostSkeleton /></Container>
        </Section>
      </>
    )
  }
```

- [ ] **Step 6: Run the tests to verify they pass**

Run (from `hirehub-frontend`): `npx vitest run src/components/blog/__tests__/BlogPage.test.tsx src/components/blog/__tests__/BlogPostPage.test.tsx`
Expected: PASS — both loading tests find `role="status"` with the new labels; all other assertions in the files still pass.

- [ ] **Step 7: Run lint and the full frontend suite**

Run (from `hirehub-frontend`): `npm run lint` then `npm run test:run`
Expected: eslint 0 errors; all tests green, output pristine. (Verify no other test imports `SkeletonGrid`/`SkeletonCard` from the blog context still — grep `src` for `SkeletonGrid`/`SkeletonCard` usages; only the two changed files should reference them, and after this task only generic uses remain.)

- [ ] **Step 8: Commit (frontend repo only)**

```bash
cd hirehub-frontend
git add src/components/blog/BlogSkeleton.tsx src/components/blog/BlogPage.tsx src/components/blog/BlogPostPage.tsx src/components/blog/__tests__/BlogPage.test.tsx src/components/blog/__tests__/BlogPostPage.test.tsx
git commit -m "feat(blog): add blog-accurate loading skeletons"
```

---

## Task 5: Full verification

**Files:**
- None — verification only, both repos.

**Interfaces:**
- Consumes: everything from Tasks 1-4. Requires a running Postgres (confirmed accepting connections) and the seeded dev DB from Task 3.

- [ ] **Step 1: Backend checks**

Run (from `hirehub-backend`): `npm run build && npm test`
Expected: tsc green; vitest suite green.

- [ ] **Step 2: Frontend checks**

Run (from `hirehub-frontend`): `npm run lint && npm run test:run && npm run build`
Expected: eslint 0 errors; all tests pass; `tsc -b && vite build` completes.

- [ ] **Step 3: Start both servers and verify the API contract + covers**

Run (from `hirehub-backend`): `npm run dev &` — wait for "listening" on 4000.
Run (from `hirehub-frontend`): `npx vite --host 127.0.0.1 &` — wait for ready on 5173.

Then:
```bash
curl -s http://localhost:4000/api/blog-posts | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);const p=j.data[0];console.log('success:',j.success,'| count:',j.data.length,'| featured:',j.data.find(x=>x.featured)?.slug,'| author shape:',typeof p?.author?.name, typeof p?.authorName)});"
```
Expected: `success: true | count: 11 | featured: us-labor-market-2026-outlook | author shape: string undefined` (nested author, flat field gone).

```bash
for f in us-labor-2026 job-search-2026 culture-2026 remote-2026 ai-2026; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5173/blog-cover-$f.png")
  echo "blog-cover-$f.png -> $code"
done
```
Expected: all 5 return `200`.

- [ ] **Step 4: Stop the servers**

Kill the backgrounded `npm run dev` and `vite` processes started in Step 3.

- [ ] **Step 5: Report**

Summarize per task: files changed, test evidence, and the Step 3 curl outputs. Note any manual browser QA still needed (this plan verifies contract + asset availability via HTTP, not pixel-perfect rendering).

(No commit — verification only.)

---

## Wrap-Up

- Commit sequence: Task 1 (backend), Task 2 (frontend images), Task 4 (frontend skeleton). Task 3 and Task 5 are verification-only.
- Leave the working tree with only pre-existing uncommitted artifacts (never `git add -A`).
- Remaining out of scope (from `changes.md`): messages height, employer account permissions, credit-card validation/plan switcher, homepage CTA + testimonials, content de-AI-ifying.
