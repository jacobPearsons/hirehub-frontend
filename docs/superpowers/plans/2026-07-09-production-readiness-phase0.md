# HireHub Community — Phase 0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver 3 upgrades.md items + API seed data to make the stack functional end-to-end.

**Architecture:** Frontend additions are self-contained components (Preloader, file upload) and a small edit (FeaturedJobs link). Backend adds Prisma seed script. No API integration yet — that's Phase 1.

**Tech Stack:** Vite + React 19 + TypeScript 6 + Tailwind CSS 3 + Framer Motion (frontend); Express 4.21 + Prisma + PostgreSQL + tsx (backend)

---

### Task 0: Preloader Component

**Files:**
- Create: `src/components/ui/Preloader.tsx`
- Modify: `src/components/layout/Layout.tsx`
- Modify: `src/context/AppContext.tsx`

**Context:** The app uses Framer Motion for page transitions and a React Context (AppContext) for global state. The preloader should be a full-screen overlay with the HireHub logo mark that fades in on page load and fades out after a configurable delay. It activates whenever `loading` is true in AppContext.

**Spec:**
- Preloader shows the HireHub "H" logo mark centered on a white/canvas background
- Uses Framer Motion `AnimatePresence` for enter/exit transitions
- Exits with a fade + scale-down animation (300ms)
- Activated via AppContext loading state — `loading` defaults to `true`, set to `false` after initial app mount + data fetch
- Sits inside Layout above all children
- Respects `prefers-reduced-motion`

**Implementation:**

- [ ] **Step 1: Create `src/components/ui/Preloader.tsx`**

```tsx
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'

export function Preloader() {
  const { loading } = useApp()

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#f5f1ec]"
          aria-hidden="true"
        >
          <motion.img
            src="/logo-mark.svg"
            alt=""
            className="w-12 h-12"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Modify `src/context/AppContext.tsx`**

Add to the AppState interface:
```ts
loading: boolean
```

Add to initial state:
```ts
loading: true
```

Add action type:
```ts
| { type: 'SET_LOADING'; payload: boolean }
```

Add to reducer:
```ts
case 'SET_LOADING':
  return { ...state, loading: action.payload }
```

Add to the returned context value:
```ts
loading: state.loading,
setLoading: (val: boolean) => dispatch({ type: 'SET_LOADING', payload: val }),
```

Add a `useEffect` in the provider that sets loading to false after mount:
```ts
useEffect(() => {
  const timer = setTimeout(() => dispatch({ type: 'SET_LOADING', payload: false }), 800)
  return () => clearTimeout(timer)
}, [])
```

- [ ] **Step 3: Modify `src/components/layout/Layout.tsx`**

Import `Preloader` and render it as the first child inside the fragment.

```tsx
import { Preloader } from '../ui/Preloader'
// ...
<>
  <Preloader />
  <ScrollToTop />
  // ... rest
</>
```

- [ ] **Step 4: Verify build**

Run: `npx tsc --noEmit` (from hirehub-frontend)
Expected: No TypeScript errors

Run: `npx vite build`
Expected: Build succeeds with zero errors

---

### Task 1: Clickable Featured Jobs

**Files:**
- Modify: `src/components/home/FeaturedJobs.tsx`

**Context:** The FeaturedJobs section renders 3 featured job cards. Each card currently displays job info but isn't clickable. Make each card a `<Link>` to `/jobs/${job.id}`.

**Implementation:**

- [ ] **Step 1: Modify `FeaturedJobs.tsx`**

Wrap the `<Card>` element at line 38 inside a `<Link>` component. The Link should wrap the Card, not the other way around. Apply `block` to the Link so the entire card is clickable.

```tsx
import { Link } from 'react-router-dom'
// ...
<Link key={job.id} to={`/jobs/${job.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded-lg">
  <Card variant="default" className="p-6 transition-transform duration-200 hover:scale-[1.02]">
    {/* existing card content */}
  </Card>
</Link>
```

Replace the current `<Card key={job.id} ...>` wrapper at line 38.

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

---

### Task 2: Resume File Upload in ApplyJobForm

**Files:**
- Modify: `src/components/apply/ApplyJobForm.tsx`
- Modify: `src/components/apply/ApplySuccess.tsx` (adjust for resume file info)
- Modify: `src/types/application.ts` (add resume fields)

**Context:** The ApplyJobForm currently has a `portfolioUrl` text input. Replace it with a file upload input for resume PDF upload. The UI should show a styled file drop zone / upload button. Store the file as `File` in form state (actual upload to backend comes in Phase 1).

**Spec:**
- Remove `portfolioUrl` input
- Add a file input for resume upload (accept `.pdf`)
- Show selected filename after pick
- Max file size warning if > 10MB (client-side validation)
- Optional field (can submit without resume)
- Clear button to remove selected file
- Update Application type to include `resumeFile?: File` and `resumeFileName?: string`

**Implementation:**

- [ ] **Step 1: Update `src/types/application.ts`**

```ts
export interface Application {
  // ... existing fields ...
  portfolioUrl?: string
  resumeFileName?: string  // new
}
```

- [ ] **Step 2: Modify `ApplyJobForm.tsx`**

Replace the portfolioUrl Input with:

```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-ink">Resume (optional)</label>
  <div className="relative">
    <input
      type="file"
      accept=".pdf"
      onChange={(e) => {
        const file = e.target.files?.[0]
        if (file) {
          if (file.size > 10 * 1024 * 1024) {
            alert('File too large. Max 10MB.')
            return
          }
          setValue('resumeFile', file, { shouldValidate: true })
        }
      }}
      className="block w-full text-sm text-ink-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-surface-2 file:text-ink hover:file:bg-hairline cursor-pointer"
    />
  </div>
  {/* Show selected file name with clear button */}
</div>
```

Also add `resumeFile` as a form field — zod schema doesn't need to validate it since it's optional:
```ts
resumeFile: z.instanceof(File).optional(),
```

- [ ] **Step 3: Update `ApplySuccess.tsx`** to show resume info if provided.

- [ ] **Step 4: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

---

### Task 3: API Seed Script

**Files:**
- Create: `hirehub-api/src/prisma/seed.ts`
- Modify: `hirehub-api/package.json` (already has seed script path)

**Context:** The API has Prisma schema with 7 models but no data. Create a seed script that populates:
- 2 demo users (1 seeker, 1 employer)
- 32 jobs from frontend `src/data/jobs.ts`
- Blog posts (4-5 entries)
- Pricing tiers (3 tiers from frontend `src/data/pricing.ts`)
- The employer user owns all jobs

**Spec:**
- Seeder reads from a hardcoded array of jobs (copy structure from frontend)
- Uses bcrypt to hash demo passwords
- Passwords: `password123` for both demo users
- Demo seeker: `alex@example.com`
- Demo employer: `employer@hirehub.community`
- Jobs reference the employer's ID
- Run with `npx tsx src/prisma/seed.ts`

**Implementation:**

- [ ] **Step 1: Create `hirehub-api/src/prisma/seed.ts`**

```ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clean existing data
  await prisma.savedJob.deleteMany()
  await prisma.application.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.job.deleteMany()
  await prisma.blogPost.deleteMany()
  await prisma.pricingTier.deleteMany()
  await prisma.user.deleteMany()

  // Create demo users
  const passwordHash = await bcrypt.hash('password123', 12)

  const seeker = await prisma.user.create({
    data: {
      name: 'Alex Morgan',
      email: 'alex@example.com',
      passwordHash,
      role: 'SEEKER',
    },
  })

  const employer = await prisma.user.create({
    data: {
      name: 'Sarah Chen',
      email: 'employer@hirehub.community',
      passwordHash,
      role: 'EMPLOYER',
      companyName: 'TechCorp',
    },
  })

  // Create 32 jobs
  // Copy job data structure from frontend src/data/jobs.ts
  const jobsData = [
    // ... map all 32 jobs from the frontend data file
  ]

  for (const job of jobsData) {
    await prisma.job.create({
      data: {
        ...job,
        employerId: employer.id,
      },
    })
  }

  // Create blog posts
  const blogPosts = [
    { slug: 'remote-work-trends-2026', title: 'Remote Work Trends Shaping 2026', excerpt: '...', content: '...', category: 'Career Advice', authorName: 'Alex Morgan', authorRole: 'Career Coach', readTime: 5, featured: true },
    // ... 4-5 posts
  ]

  for (const post of blogPosts) {
    await prisma.blogPost.create({ data: post })
  }

  // Create pricing tiers
  const tiers = [
    { tier: 'Starter', price: 0, period: 'month', description: 'Perfect for getting started', features: ['Up to 3 active job listings', 'Basic applicant tracking', 'Standard support'], ctaText: 'Get started', featured: false },
    { tier: 'Pro', price: 99, period: 'month', description: 'For growing teams', features: ['Up to 15 active job listings', 'Advanced applicant tracking', 'Priority support', 'Company profile page'], ctaText: 'Start free trial', featured: true },
    { tier: 'Enterprise', price: 299, period: 'month', description: 'For large organizations', features: ['Unlimited job listings', 'Full analytics & insights', 'Dedicated account manager', 'Custom integrations', 'API access'], ctaText: 'Contact sales', featured: false },
  ]

  for (const tier of tiers) {
    await prisma.pricingTier.create({ data: tier })
  }

  console.log('Seed complete')
  console.log(`  Demo Seeker: alex@example.com / password123`)
  console.log(`  Demo Employer: employer@hirehub.community / password123`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 2: Read frontend `src/data/jobs.ts` and map all 32 job objects into the seed array**

Run: `cat src/data/jobs.ts` to get the job data structure and copy all entries into the seed.

- [ ] **Step 3: Read frontend `src/data/blog.ts` and `src/data/pricing.ts` for content**

Map blog posts and pricing tiers from frontend data into the seed script.

- [ ] **Step 4: Update `package.json` seed script path if needed**

Ensure `package.json` has:
```json
"db:seed": "tsx src/prisma/seed.ts"
```

- [ ] **Step 5: Test seed**

Run: `npx prisma db push` (ensure DB is available)
Run: `npx tsx src/prisma/seed.ts`
Expected: "Seed complete" with demo credentials printed

---

### Execution Order

```
Task 0: Preloader → 
Task 1: Clickable Featured Jobs → 
Task 2: Resume Upload → 
Task 3: API Seed Script
```

Tasks 0-2 are frontend-only, Task 3 is backend-only. Can be dispatched in parallel across the two repos.
