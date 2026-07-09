# Consistent Border Styling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add consistent bordered card containers around text in all hero/first sections, with dark mode support and a reusable component.

**Architecture:** Create a single reusable `HeroContent` component (2 variants: `card` for bg-image sections, `accent` for clean pages) and apply it to all 11 target components. The component uses existing `border-hairline` and `bg-surface-1` design tokens that already support dark mode.

**Tech Stack:** Vite + React 19 + TypeScript 6 + Tailwind CSS 3

**Spec Reference:** `docs/superpowers/specs/2026-07-09-consistent-border-styling.md`

---

## File Inventory

### New Files
| File | Purpose |
|------|---------|
| `src/components/ui/HeroContent.tsx` | Reusable bordered card/accent wrapper component |

### Modified Files
| File | Change |
|------|--------|
| `src/components/ui/index.ts` | Export `HeroContent` |
| `src/components/about/AboutHero.tsx` | Wrap text in `<HeroContent variant="card">` |
| `src/components/home/HeroSection.tsx` | Wrap text in `<HeroContent variant="card">` |
| `src/components/employers/EmployersHero.tsx` | Wrap text in `<HeroContent variant="card">` |
| `src/components/blog/BlogPage.tsx` | Wrap intro text in `<HeroContent variant="card">` |
| `src/components/jobs/JobBoardPage.tsx` | Wrap intro text in `<HeroContent variant="card">` |
| `src/components/contact/ContactInfo.tsx` | Wrap heading + text in `<HeroContent variant="card">` |
| `src/components/post-job/PostJobPage.tsx` | Wrap intro text in `<HeroContent variant="card">` |
| `src/components/jobs/JobDetailPage.tsx` | Wrap heading in `<HeroContent variant="accent">` |
| `src/components/blog/BlogPostPage.tsx` | Wrap title in `<HeroContent variant="accent">` |
| `src/components/dashboard/DashboardPage.tsx` | Wrap heading + description in `<HeroContent variant="accent">` |
| `src/components/employer-dashboard/EmployerDashboardPage.tsx` | Wrap heading + description in `<HeroContent variant="accent">` |

---

### Task 1: Create HeroContent Component

**Files:**
- Create: `src/components/ui/HeroContent.tsx`
- Modify: `src/components/ui/index.ts` (add export)

- [ ] **Step 1: Create `HeroContent.tsx`**

```tsx
import type { ReactNode } from 'react'

interface HeroContentProps {
  variant?: 'card' | 'accent'
  children: ReactNode
  className?: string
}

export function HeroContent({
  variant = 'card',
  children,
  className = '',
}: HeroContentProps) {
  const styles = {
    card: 'bg-surface-1/80 backdrop-blur-sm border border-hairline rounded-lg p-8 md:p-10',
    accent: 'border-l-2 border-accent pl-4',
  }

  return (
    <div className={`${styles[variant]} ${className}`}>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Add export to `src/components/ui/index.ts`**

Add after `ErrorBoundary` export:
```ts
export { HeroContent } from './HeroContent'
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No TypeScript errors

---

### Task 2: Apply to Hero Sections (AboutHero, HeroSection, EmployersHero)

**Files:**
- Modify: `src/components/about/AboutHero.tsx`
- Modify: `src/components/home/HeroSection.tsx`
- Modify: `src/components/employers/EmployersHero.tsx`

All three follow the same pattern: wrap the text content div inside a `<HeroContent variant="card">` container. The card sits inside the existing `<Container>`.

- [ ] **Step 1: Modify `AboutHero.tsx`**

Wrap the text elements (h1 + p) in HeroContent:
```tsx
import { Container } from '../ui/Container'
import { HeroContent } from '../ui/HeroContent'

export function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-canvas">
      <div className="absolute inset-0">
        <img
          src="/about-hero.png"
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-canvas/10 via-canvas/30 to-canvas" />
      </div>
      <Container className="relative py-24 md:py-32 text-center">
        <HeroContent variant="card">
          <h1 className="text-[40px] md:text-[56px] leading-[1.1] tracking-[-1px] font-medium max-w-3xl mx-auto">
            About HireHub Community
          </h1>
          <p className="text-lg text-ink mt-6 max-w-2xl mx-auto">
            We're on a mission to make hiring human again. <span className=''>HireHub</span> Community
            connects talented professionals with companies that value culture,
            growth, and impact.
          </p>
        </HeroContent>
      </Container>
    </section>
  )
}
```

- [ ] **Step 2: Modify `HeroSection.tsx`**

Wrap the text + CTAs content div in HeroContent:
```tsx
import { Link } from 'react-router-dom'
import { Container } from '../ui/Container'
import { HeroContent } from '../ui/HeroContent'

export function HeroSection() {
  return (
    <section className="relative bg-canvas overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/hero-homepage.png"
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-canvas/20 via-canvas/40 to-canvas" />
      </div>
      <Container>
        <div className="relative flex flex-col items-center text-center pt-24 pb-32 md:pt-32 md:pb-40">
          <HeroContent variant="card" className="flex flex-col items-center">
            <span className="bg-ink/5 text-ink rounded-full px-3 py-1 text-sm mb-6 backdrop-blur-sm">
              <span aria-hidden="true">🎉</span> We're hiring!
            </span>
            <h1 className="text-[56px] md:text-[72px] leading-[1.05] tracking-[-2px] font-medium max-w-4xl mx-auto text-ink">
              Find your next role at companies that build
            </h1>
            <p className="text-lg md:text-xl leading-[1.5] text-ink-muted max-w-2xl mx-auto mt-6">
              Explore thousands of curated job listings from the world's best companies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center">
              <Link
                to="/jobs"
                className="inline-flex items-center justify-center px-6 py-3 text-base rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 bg-ink text-white hover:bg-[#3a3a3a] dark:hover:bg-[#3a3a3a]"
              >
                Browse Jobs
              </Link>
              <Link
                to="/employers"
                className="inline-flex items-center justify-center px-6 py-3 text-base rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 bg-surface-2 text-ink hover:bg-hairline"
              >
                For Employers
              </Link>
            </div>
          </HeroContent>
        </div>
      </Container>
    </section>
  )
}
```

- [ ] **Step 3: Modify `EmployersHero.tsx`**

```tsx
import { Link } from 'react-router-dom'
import { Container } from '../ui/Container'
import { Tag } from '../ui/Tag'
import { HeroContent } from '../ui/HeroContent'

export function EmployersHero() {
  return (
    <section className="relative overflow-hidden bg-canvas">
      <div className="absolute inset-0">
        <img
          src="/employers-hero.png"
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-canvas/80 via-canvas/40 to-transparent" />
      </div>
      <Container className="relative py-24 md:py-32">
        <div className="flex flex-col items-start max-w-xl">
          <HeroContent variant="card">
            <Tag variant="category" className="mb-4 text-accent">
              For Employers
            </Tag>
            <h1 className="text-[40px] md:text-[56px] leading-[1.1] tracking-[-1px] font-medium max-w-3xl">
              Find the talent your team needs to grow
            </h1>
            <p className="text-lg text-ink-muted max-w-2xl mt-4 mb-8">
              Post jobs, discover top candidates, and build your dream team with HireHub Community.
            </p>
            <div className="flex items-center gap-6">
              <Link
                to="#"
                className="inline-flex items-center justify-center rounded-md bg-accent text-white px-6 py-3 text-base font-medium hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
              >
                Post a job
              </Link>
              <Link
                to="#pricing"
                className="text-sm font-medium text-ink-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded"
              >
                Learn more
              </Link>
            </div>
          </HeroContent>
        </div>
      </Container>
    </section>
  )
}
```

- [ ] **Step 4: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

---

### Task 3: Apply to Intro Sections with BG Images (Blog, Jobs, Contact, PostJob)

**Files:**
- Modify: `src/components/blog/BlogPage.tsx`
- Modify: `src/components/jobs/JobBoardPage.tsx`
- Modify: `src/components/contact/ContactInfo.tsx`
- Modify: `src/components/post-job/PostJobPage.tsx`

All four have background images at low opacity and a heading + description text block. For each, wrap the heading/description in `<HeroContent variant="card">`.

- [ ] **Step 1: Modify `BlogPage.tsx`**

Read the file first, then wrap the heading and paragraph text in HeroContent.

- [ ] **Step 2: Modify `JobBoardPage.tsx`**

Read the file, wrap heading + description in HeroContent.

- [ ] **Step 3: Modify `ContactInfo.tsx`**

Read the file, wrap the left column heading + description in HeroContent.

- [ ] **Step 4: Modify `PostJobPage.tsx`**

Read the file, wrap heading + description in HeroContent.

- [ ] **Step 5: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

---

### Task 4: Apply Accent Variant to Detail & Dashboard Pages

**Files:**
- Modify: `src/components/jobs/JobDetailPage.tsx`
- Modify: `src/components/blog/BlogPostPage.tsx`
- Modify: `src/components/dashboard/DashboardPage.tsx`
- Modify: `src/components/employer-dashboard/EmployerDashboardPage.tsx`

These pages have clean layouts (no background images). Wrap headings in `<HeroContent variant="accent">` for a subtle left accent border.

- [ ] **Step 1: Modify `JobDetailPage.tsx`**

Read file, wrap the breadcrumb + job header area in HeroContent accent.

- [ ] **Step 2: Modify `BlogPostPage.tsx`**

Read file, wrap the post title area in HeroContent accent.

- [ ] **Step 3: Modify `DashboardPage.tsx`**

Read file, wrap the "Dashboard" heading + description in HeroContent accent.

- [ ] **Step 4: Modify `EmployerDashboardPage.tsx`**

Read file, wrap heading + description in HeroContent accent.

- [ ] **Step 5: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

---

### Task 5: Verify All Pages Visual Consistency

- [ ] **Step 1: TypeScript check**

Run: `npx tsc --noEmit`
Expected: Zero errors

- [ ] **Step 2: Build check**

Run: `npx vite build`
Expected: Build succeeds with zero errors

- [ ] **Step 3: Manual review checklist**
  - [ ] AboutHero — bordered card visible over background image
  - [ ] HeroSection (Home) — bordered card visible over background image
  - [ ] EmployersHero — bordered card visible over background image
  - [ ] BlogPage — bordered card on intro section
  - [ ] JobBoardPage — bordered card on intro section
  - [ ] ContactInfo — bordered card on info section
  - [ ] PostJobPage — bordered card on intro section
  - [ ] JobDetailPage — accent left border on header
  - [ ] BlogPostPage — accent left border on title
  - [ ] DashboardPage — accent left border on heading
  - [ ] EmployerDashboardPage — accent left border on heading
  - [ ] Toggle dark mode — all borders adapt via CSS variables

---

## Execution Order

```
Task 1: Create HeroContent component ──────────────── First (no deps)
     │
     ▼
Task 2: Apply to 3 hero sections ───────────────────── Parallel group A
     │
     ▼
Task 3: Apply to 4 intro sections ─────────────────── Parallel group B
     │
     ▼
Task 4: Apply accent to 4 detail/dashboard pages ─── Parallel group C
     │
     ▼
Task 5: Verify all ─────────────────────────────────── Final
```

Tasks 2, 3, and 4 can be dispatched as parallel subagents after Task 1 completes. Within each group, individual file modifications within a task can be done sequentially by the same subagent.
