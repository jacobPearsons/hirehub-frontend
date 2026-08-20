# WS3: Auth/Onboarding Layout + Dashboard Header Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hide the Navbar/Footer on auth and onboarding pages, and make the dashboard header title reflect the active tab.

**Architecture:** Extend the `isDashboardPath` helper in `Layout.tsx` so auth (`/login`, `/signup`, `/forgot-password`, `/reset-password`) and `/onboarding` routes render as full-bleed pages without Navbar/Footer. In `DashboardPage.tsx`, derive the header title + subtitle from the active tab instead of hardcoding "Dashboard".

**Tech Stack:** React 19, React Router 7, Tailwind CSS 3, existing UI tokens.

## Global Constraints

- Follow HireHub DESIGN.md conventions: CSS custom property tokens via Tailwind, no `cn()`/`clsx()`, string concatenation with ternaries
- Focus-visible rings on interactive elements: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30`
- Button `type` defaults to `'button'` unless explicitly `'submit'` or `'reset'`
- No box-shadow on cards — use `border border-hairline`
- Existing dependencies only — no new npm packages
- Run `npm run test:run`, `npm run build`, `npm run lint` after each task

---

### Task 1: Hide Navbar/Footer on auth and onboarding pages

**Files:**
- Modify: `src/components/layout/Layout.tsx:12-17`

**Interfaces:**
- Consumes: `useLocation()` from react-router-dom
- Produces: Updated `isDashboardPath` helper treating auth + onboarding paths as "chrome-free"

- [ ] **Step 1: Write the failing test**

Create `src/components/layout/__tests__/Layout.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Layout from '../Layout'

function renderAt(pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <Layout>
        <div>page body</div>
      </Layout>
    </MemoryRouter>,
  )
}

describe('Layout chrome', () => {
  it('renders Navbar and Footer on public pages', () => {
    renderAt('/jobs')
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('hides Navbar and Footer on /login', () => {
    renderAt('/login')
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
  })

  it('hides Navbar and Footer on /signup', () => {
    renderAt('/signup')
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
  })

  it('hides Navbar and Footer on /forgot-password', () => {
    renderAt('/forgot-password')
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
  })

  it('hides Navbar and Footer on /reset-password', () => {
    renderAt('/reset-password')
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
  })

  it('hides Navbar and Footer on /onboarding', () => {
    renderAt('/onboarding')
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/components/layout/__tests__/Layout.test.tsx`
Expected: FAIL — Navbar/Footer render on auth paths.

- [ ] **Step 3: Update Layout.tsx**

```tsx
const isDashboardPath = (pathname: string) =>
  pathname === '/dashboard' ||
  pathname.startsWith('/dashboard/') ||
  pathname === '/employer/dashboard' ||
  pathname.startsWith('/employer/dashboard/') ||
  pathname === '/admin' ||
  pathname === '/login' ||
  pathname === '/signup' ||
  pathname === '/forgot-password' ||
  pathname === '/reset-password' ||
  pathname === '/onboarding'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/components/layout/__tests__/Layout.test.tsx`
Expected: PASS

- [ ] **Step 5: Full gate**

Run: `npm run test:run && npm run build && npm run lint`
Expected: all pass

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/Layout.tsx src/components/layout/__tests__/Layout.test.tsx
git commit -m "fix(layout): hide navbar/footer on auth and onboarding pages"
```

---

### Task 2: Dashboard header title reflects active tab

**Files:**
- Modify: `src/components/dashboard/DashboardPage.tsx:10-14, 30-35`

**Interfaces:**
- Consumes: `activeTab` derived from `searchParams.get('tab')`
- Produces: Header `h1` + subtitle that change per active tab

- [ ] **Step 1: Write the failing test**

Create `src/components/dashboard/__tests__/DashboardPage.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DashboardPage } from '../DashboardPage'

jest.mock('../../../context/AppContext', () => ({
  useApp: () => ({ user: null }),
}))

jest.mock('../OverviewTab', () => ({ OverviewTab: () => <div>OverviewTab</div> }))
jest.mock('../SavedJobsTab', () => ({ SavedJobsTab: () => <div>SavedJobsTab</div> }))
jest.mock('../ApplicationsTab', () => ({ ApplicationsTab: () => <div>ApplicationsTab</div> }))

describe('DashboardPage header', () => {
  it('shows Overview heading by default', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <DashboardPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /overview/i, level: 1 })).toBeInTheDocument()
  })

  it('shows Saved Jobs heading when tab=saved', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard?tab=saved']}>
        <DashboardPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /saved jobs/i, level: 1 })).toBeInTheDocument()
  })

  it('shows My Applications heading when tab=applications', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard?tab=applications']}>
        <DashboardPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /my applications/i, level: 1 })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/components/dashboard/__tests__/DashboardPage.test.tsx`
Expected: FAIL — heading is always "Dashboard".

- [ ] **Step 3: Update DashboardPage.tsx**

Add a tab metadata map and derive the header from it:

```tsx
const tabMeta = {
  overview: { title: 'Overview', subtitle: 'Your activity at a glance' },
  saved: { title: 'Saved Jobs', subtitle: 'Jobs you’ve bookmarked' },
  applications: { title: 'My Applications', subtitle: 'Track every application and hiring stage' },
} as const
```

Replace the header block (lines 30-35):

```tsx
<HeroContent variant="accent">
  <div>
    <h1 className="text-3xl md:text-[40px] leading-[1.15] tracking-[-0.8px] font-medium">
      {tabMeta[activeTab].title}
    </h1>
    <p className="text-ink-muted mt-1">{tabMeta[activeTab].subtitle}</p>
  </div>
</HeroContent>
```

Also update `usePageMeta` title to use the tab title:

```tsx
const meta = usePageMeta({ title: `${tabMeta[activeTab].title} | HireHub Community`, description: tabMeta[activeTab].subtitle })
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/components/dashboard/__tests__/DashboardPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Full gate**

Run: `npm run test:run && npm run build && npm run lint`
Expected: all pass

- [ ] **Step 6: Commit**

```bash
git add src/components/dashboard/DashboardPage.tsx src/components/dashboard/__tests__/DashboardPage.test.tsx
git commit -m "feat(dashboard): header title follows active tab"
```

---

## Validation and Acceptance

1. `npm run test:run`, `npm run build`, `npm run lint` all pass
2. Auth pages (`/login`, `/signup`, `/forgot-password`, `/reset-password`) and `/onboarding` render without Navbar/Footer
3. Public pages (`/jobs`, `/blog`, `/`) still show Navbar/Footer
4. Dashboard header title switches between Overview / Saved Jobs / My Applications with the active tab
5. Browser back/forward preserves the `?tab=` param and the header stays in sync
