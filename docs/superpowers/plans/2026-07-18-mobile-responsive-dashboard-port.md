# Mobile-First Responsive + Dashboard Port — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all HireHub pages mobile-first responsive, port the sidebar + infobar dashboard shell from loft-frontend, fix the job filter UX on mobile, and extract the 404 page into a proper component.

**Architecture:** A new `DashboardShell` layout wraps dashboard routes with a persistent sidebar (desktop) and slide-in drawer (mobile). Job filters use a bottom sheet drawer on mobile instead of an always-visible sidebar. All pages get a responsive audit pass for typography, grids, and spacing.

**Tech Stack:** React 19, React Router 7, Tailwind CSS 3, Radix UI Dialog, Framer Motion, Lucide React

## Global Constraints

- Follow HireHub DESIGN.md conventions: CSS custom property tokens via Tailwind, no `cn()`/`clsx()`, string concatenation with ternaries
- Focus-visible rings on all interactive elements: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30`
- All animations respect `useReducedMotion()` from framer-motion
- Button `type` defaults to `'button'` unless explicitly `'submit'` or `'reset'`
- No box-shadow on cards — use `border border-hairline`
- Dark mode via `data-theme` attribute, not Tailwind `dark:` prefix
- Border radius from scale: `md=8px`, `lg=12px`, `xl=16px`, `pill=9999px`
- Existing dependencies only — no new npm packages
- Port patterns from loft-frontend but adapt to React Router and HireHub tokens

---

### Task 1: 404 Page Component

**Files:**
- Create: `src/components/ui/NotFoundPage.tsx`
- Modify: `src/App.tsx` (lines 60-68, replace inline 404 JSX)

**Interfaces:**
- Consumes: `Link` from react-router-dom
- Produces: Exported `NotFoundPage` component used by App.tsx catch-all route

- [ ] **Step 1: Create NotFoundPage component**

```tsx
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="text-center">
        <h1 className="text-5xl md:text-[56px] font-medium text-ink mb-4">404</h1>
        <p className="text-lg text-ink-muted mb-6">Page not found</p>
        <Link
          to="/"
          className="text-accent hover:underline text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 rounded"
        >
          Go home
        </Link>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Update App.tsx to use NotFoundPage**

Replace the inline 404 JSX in the catch-all route (lines 60-68) with:

```tsx
import { NotFoundPage } from './components/ui/NotFoundPage'

// In the Routes:
<Route path="*" element={<NotFoundPage />} />
```

- [ ] **Step 3: Run build to verify no type errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/NotFoundPage.tsx src/App.tsx
git commit -m "feat: extract 404 page into proper component with responsive typography"
```

---

### Task 2: Sidebar Component

**Files:**
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/sidebar-constants.ts`

**Interfaces:**
- Consumes: `NavLink`, `useLocation` from react-router-dom; `useApp` from AppContext; Lucide icons
- Produces: `Sidebar` component with `mobile`, `isOpen`, `onClose` props

- [ ] **Step 1: Create sidebar navigation constants**

```ts
// src/components/layout/sidebar-constants.ts
import { LayoutDashboard, Bookmark, Briefcase, Search, FileText, Users, Plus } from 'lucide-react'

interface SidebarItem {
  label: string
  to: string
  icon: React.ComponentType<{ className?: string }>
}

export const seekerNavItems: SidebarItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Saved Jobs', to: '/dashboard', icon: Bookmark },
  { label: 'Browse Jobs', to: '/jobs', icon: Search },
]

export const employerNavItems: SidebarItem[] = [
  { label: 'Dashboard', to: '/employer/dashboard', icon: LayoutDashboard },
  { label: 'Job Listings', to: '/employer/dashboard', icon: Briefcase },
  { label: 'Applicants', to: '/employer/dashboard', icon: Users },
  { label: 'Post Job', to: '/post-job', icon: Plus },
]
```

- [ ] **Step 2: Create the Sidebar component**

```tsx
// src/components/layout/Sidebar.tsx
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { X, LogOut } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { logout } from '../../api/auth'
import { setAccessToken } from '../../api/client'
import { seekerNavItems, employerNavItems } from './sidebar-constants'
import type { ReactNode } from 'react'

interface SidebarProps {
  mobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

function NavItem({ item, onClick }: { item: { label: string; to: string; icon: React.ComponentType<{ className?: string }> }; onClick?: () => void }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
          isActive
            ? 'bg-accent/10 text-accent'
            : 'text-ink-muted hover:text-ink hover:bg-surface-2'
        }`
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{item.label}</span>
    </NavLink>
  )
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const { user, setUser } = useApp()
  const navigate = useNavigate()

  const navItems = user?.role === 'employer' ? employerNavItems : seekerNavItems

  const handleLogout = async () => {
    try { await logout() } catch {}
    setAccessToken(null)
    setUser(null)
    navigate('/')
    onNavClick?.()
  }

  return (
    <nav className="flex flex-col h-full bg-canvas">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-hairline shrink-0">
        <Link to="/" onClick={onNavClick} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 52" fill="none" className="h-7" aria-hidden="true">
            <rect x="4" y="6" width="40" height="40" rx="8" fill="#ff5600"/>
            <path d="M16 16v20M16 26h16M32 16v20" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
            <text x="54" y="32" fontFamily="Inter, system-ui, sans-serif" fontSize="22" fontWeight="500" fill="currentColor" letterSpacing="-0.3">HireHub</text>
            <text x="54" y="45" fontFamily="Inter, system-ui, sans-serif" fontSize="11" fontWeight="400" fill="currentColor" opacity="0.6">Community</text>
          </svg>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavItem key={item.label} item={item} onClick={onNavClick} />
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-hairline p-3 shrink-0">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5">
            <span className="text-sm text-ink-muted truncate">{user.name}</span>
            <button
              onClick={handleLogout}
              className="ml-auto text-ink-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 rounded"
              aria-label="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export function Sidebar({ mobile, isOpen, onClose }: SidebarProps) {
  if (mobile) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/40" onClick={onClose} />
            <div className="fixed left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-canvas border-r border-hairline shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-4 h-14 border-b border-hairline shrink-0">
                <span className="font-medium text-ink text-sm">Menu</span>
                <button
                  onClick={onClose}
                  className="p-2 text-ink-muted hover:text-ink rounded-lg hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarContent onNavClick={onClose} />
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="hidden md:flex w-56 shrink-0 border-r border-hairline">
      <SidebarContent />
    </div>
  )
}
```

Note: Replace `__import_useNavigate` with actual `useNavigate` import from react-router-dom. The component uses string concatenation with ternaries per HireHub convention, no `cn()` or `clsx()`.

- [ ] **Step 3: Run build to verify**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Sidebar.tsx src/components/layout/sidebar-constants.ts
git commit -m "feat: add responsive Sidebar component with role-based navigation"
```

---

### Task 3: Infobar Component

**Files:**
- Create: `src/components/layout/Infobar.tsx`

**Interfaces:**
- Consumes: `useApp` from AppContext; `ThemeToggle` from ui/ThemeToggle; Lucide icons
- Produces: `Infobar` component with hamburger trigger, theme toggle, user info, logout

- [ ] **Step 1: Create Infobar component**

```tsx
// src/components/layout/Infobar.tsx
import { Menu, LogOut } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { logout } from '../../api/auth'
import { setAccessToken } from '../../api/client'
import { ThemeToggle } from '../ui/ThemeToggle'
import { useNavigate } from 'react-router-dom'

interface InfobarProps {
  onMenuToggle: () => void
}

export function Infobar({ onMenuToggle }: InfobarProps) {
  const { user, setUser } = useApp()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await logout() } catch {}
    setAccessToken(null)
    setUser(null)
    navigate('/')
  }

  return (
    <div className="flex items-center justify-between px-4 md:px-6 h-14 border-b border-hairline bg-canvas shrink-0">
      <button
        onClick={onMenuToggle}
        className="md:hidden text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 rounded-md p-1"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <div className="flex items-center gap-3 ml-auto">
        <ThemeToggle />
        {user && (
          <>
            <span className="text-sm text-ink-muted hidden sm:inline">{user.name}</span>
            <button
              onClick={handleLogout}
              className="text-ink-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 rounded p-1"
              aria-label="Log out"
            >
              <LogOut size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run build to verify**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Infobar.tsx
git commit -m "feat: add Infobar component for dashboard layout"
```

---

### Task 4: DashboardShell Layout

**Files:**
- Create: `src/components/layout/DashboardShell.tsx`
- Modify: `src/components/dashboard/DashboardPage.tsx`
- Modify: `src/components/employer-dashboard/EmployerDashboardPage.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `Sidebar`, `Infobar` from this task batch; `useState` from React
- Produces: `DashboardShell` component wrapping children with sidebar + infobar layout

- [ ] **Step 1: Create DashboardShell component**

```tsx
// src/components/layout/DashboardShell.tsx
import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Infobar } from './Infobar'
import type { ReactNode } from 'react'

interface DashboardShellProps {
  children: ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar mobile isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Infobar onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update DashboardPage to work inside DashboardShell**

Remove the outer `Section`/`Container` wrapper and the header's "Browse jobs" link (now accessible via sidebar). Simplify the header:

```tsx
// src/components/dashboard/DashboardPage.tsx
import { useState } from 'react'
import { HeroContent } from '../ui/HeroContent'
import { usePageMeta } from '../../utils/usePageMeta'
import { SavedJobsTab } from './SavedJobsTab'
import { ApplicationsTab } from './ApplicationsTab'

const tabs = [
  { id: 'saved', label: 'Saved Jobs' },
  { id: 'applications', label: 'My Applications' },
] as const

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'saved' | 'applications'>('saved')
  const meta = usePageMeta({ title: 'Dashboard | HireHub Community', description: 'Manage your saved jobs and applications' })

  return (
    <>
      {meta}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <HeroContent variant="accent">
          <div>
            <h1 className="text-3xl md:text-[40px] leading-[1.15] tracking-[-0.8px] font-medium">Dashboard</h1>
            <p className="text-ink-muted mt-1">Manage your saved jobs and applications</p>
          </div>
        </HeroContent>
      </div>

      <div role="tablist" aria-label="Dashboard tabs" className="flex overflow-x-auto gap-1 border-b border-hairline mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 rounded-t ${
              activeTab === tab.id
                ? 'border-ink text-ink'
                : 'border-transparent text-ink-muted hover:text-ink hover:border-ink/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'saved' && <SavedJobsTab />}
      {activeTab === 'applications' && <ApplicationsTab />}
    </>
  )
}
```

- [ ] **Step 3: Update EmployerDashboardPage similarly**

Same pattern — remove `Section`/`Container`, simplify header, add `overflow-x-auto` to tabs, responsive heading.

- [ ] **Step 4: Update App.tsx routes to wrap dashboards in DashboardShell**

```tsx
import { DashboardShell } from './components/layout/DashboardShell'

// In Routes:
<Route path="/dashboard" element={
  <ProtectedRoute allowedRoles={['seeker']}>
    <DashboardShell>
      <ErrorBoundary><DashboardPage /></ErrorBoundary>
    </DashboardShell>
  </ProtectedRoute>
} />
<Route path="/employer/dashboard" element={
  <ProtectedRoute allowedRoles={['employer']}>
    <DashboardShell>
      <ErrorBoundary><EmployerDashboardPage /></ErrorBoundary>
    </DashboardShell>
  </ProtectedRoute>
} />
```

- [ ] **Step 5: Run build to verify**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/DashboardShell.tsx src/components/dashboard/DashboardPage.tsx src/components/employer-dashboard/EmployerDashboardPage.tsx src/App.tsx
git commit -m "feat: add DashboardShell layout with sidebar and infobar"
```

---

### Task 5: FilterDrawer + ActiveFilterChips

**Files:**
- Create: `src/components/jobs/FilterDrawer.tsx`
- Create: `src/components/jobs/ActiveFilterChips.tsx`

**Interfaces:**
- Consumes: Same filter state as FilterSidebar (`filters`, `onFilterChange`); Radix Dialog; Framer Motion
- Produces: `FilterDrawer` (mobile bottom sheet), `ActiveFilterChips` (chip row)

- [ ] **Step 1: Create FilterDrawer component**

A bottom sheet using Radix Dialog with slide-up animation. Contains the same filter groups as FilterSidebar.

```tsx
// src/components/jobs/FilterDrawer.tsx
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '../ui/Button'

interface FilterDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: { category: string; seniority: string; remote: string }
  onFilterChange: (key: string, value: string) => void
  activeCount: number
}

const categories = ['All', 'Engineering', 'Design', 'Marketing', 'Sales', 'Operations']
const seniorities = ['All', 'Junior', 'Mid', 'Senior', 'Lead', 'Executive']
const locations = ['All', 'Remote', 'On-site', 'Hybrid']

function FilterGroup({ label, options, value, onChange }: {
  label: string
  options: string[]
  value: string
  onChange: (val: string) => void
}) {
  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="text-sm font-medium mb-3 text-ink">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const optValue = opt === 'All' ? '' : (label === 'Seniority' ? opt.toLowerCase() : opt)
          const isSelected = value === optValue
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(optValue)}
              className={`px-3 py-1.5 rounded-pill text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
                isSelected
                  ? 'bg-accent text-white'
                  : 'bg-surface-2 text-ink-muted hover:text-ink'
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function FilterDrawer({ open, onOpenChange, filters, onFilterChange, activeCount }: FilterDrawerProps) {
  const handleClear = () => {
    onFilterChange('category', '')
    onFilterChange('seniority', '')
    onFilterChange('remote', '')
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 md:hidden" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-50 bg-canvas rounded-t-xl border-t border-hairline max-h-[80vh] overflow-y-auto md:hidden"
          aria-label="Filter jobs"
        >
          <div className="sticky top-0 bg-canvas border-b border-hairline px-4 py-3 flex items-center justify-between">
            <Dialog.Title className="text-base font-medium text-ink">
              Filters {activeCount > 0 && <span className="text-ink-muted">({activeCount})</span>}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="p-1 text-ink-muted hover:text-ink rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-4 space-y-6">
            <FilterGroup label="Category" options={categories} value={filters.category} onChange={(v) => onFilterChange('category', v)} />
            <FilterGroup label="Seniority" options={seniorities} value={filters.seniority} onChange={(v) => onFilterChange('seniority', v)} />
            <FilterGroup label="Location" options={locations} value={filters.remote} onChange={(v) => onFilterChange('remote', v)} />
          </div>

          <div className="sticky bottom-0 bg-canvas border-t border-hairline px-4 py-3 flex gap-3">
            <Button variant="ghost" size="md" className="flex-1" onClick={handleClear}>Clear all</Button>
            <Dialog.Close asChild>
              <Button variant="primary" size="md" className="flex-1">Show results</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

- [ ] **Step 2: Create ActiveFilterChips component**

```tsx
// src/components/jobs/ActiveFilterChips.tsx
import { X } from 'lucide-react'

interface ActiveFilterChipsProps {
  filters: { category: string; seniority: string; remote: string }
  onFilterChange: (key: string, value: string) => void
}

export function ActiveFilterChips({ filters, onFilterChange }: ActiveFilterChipsProps) {
  const chips: { key: string; label: string }[] = []

  if (filters.category) chips.push({ key: 'category', label: filters.category })
  if (filters.seniority) chips.push({ key: 'seniority', label: filters.seniority })
  if (filters.remote) chips.push({ key: 'remote', label: filters.remote })

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-pill bg-surface-2 text-sm text-ink-muted"
        >
          {chip.label}
          <button
            onClick={() => onFilterChange(chip.key, '')}
            className="text-ink-tertiary hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 rounded"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X size={14} />
          </button>
        </span>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Run build to verify**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/jobs/FilterDrawer.tsx src/components/jobs/ActiveFilterChips.tsx
git commit -m "feat: add FilterDrawer bottom sheet and ActiveFilterChips for mobile"
```

---

### Task 6: JobBoardPage Responsive Update

**Files:**
- Modify: `src/components/jobs/JobBoardPage.tsx`
- Modify: `src/components/jobs/FilterSidebar.tsx` (extract shared FilterOption)

**Interfaces:**
- Consumes: `FilterDrawer`, `ActiveFilterChips` from Task 5; existing `FilterSidebar`
- Produces: Responsive JobBoardPage with conditional filter rendering

- [ ] **Step 1: Extract FilterOption from FilterSidebar into shared helper**

Move the `FilterOption` sub-component to a shared location or keep it in FilterSidebar but export it for reuse by FilterDrawer. Since FilterDrawer uses a different layout (pill buttons instead of list items), keep them separate — no extraction needed.

- [ ] **Step 2: Update JobBoardPage with responsive filter rendering**

```tsx
// Key changes in JobBoardPage.tsx:
// 1. Add state for filter drawer open/close
// 2. Conditionally render FilterSidebar (lg+) vs FilterDrawer trigger (<lg)
// 3. Add ActiveFilterChips below search bar on mobile

const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

const activeFilterCount = [filters.category, filters.seniority, filters.remote].filter(Boolean).length

// In the JSX, replace the grid section:
<>
  {/* Mobile: search + filter trigger */}
  <div className="lg:hidden flex gap-3 mb-4">
    <div className="flex-1">
      <SearchBar value={search} onChange={handleSearchChange} />
    </div>
    <Button
      variant="secondary"
      size="md"
      onClick={() => setFilterDrawerOpen(true)}
      className="shrink-0"
    >
      Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
    </Button>
  </div>

  {/* Desktop: search bar */}
  <Reveal className="hidden lg:block max-w-xl mb-8">
    <SearchBar value={search} onChange={handleSearchChange} />
  </Reveal>

  {/* Mobile: active filter chips */}
  <div className="lg:hidden">
    <ActiveFilterChips filters={filters} onFilterChange={handleFilterChange} />
  </div>

  {/* Filter drawer for mobile */}
  <FilterDrawer
    open={filterDrawerOpen}
    onOpenChange={setFilterDrawerOpen}
    filters={filters}
    onFilterChange={handleFilterChange}
    activeCount={activeFilterCount}
  />

  {/* Desktop: sidebar layout */}
  <div className="hidden lg:grid grid-cols-[280px_1fr] gap-8">
    <Reveal delay={0.05}><FilterSidebar filters={filters} onFilterChange={handleFilterChange} /></Reveal>
    <Reveal delay={0.1}>
      <JobCardGrid jobs={filteredJobs} />
      {hasMore && (
        <div className="mt-8 text-center">
          <Button variant="ghost" size="md" onClick={() => loadJobs(false)} disabled={loadingMore}>
            {loadingMore ? 'Loading more...' : `Load more (${filteredJobs.length} of ${total})`}
          </Button>
        </div>
      )}
    </Reveal>
  </div>

  {/* Mobile: jobs grid without sidebar */}
  <div className="lg:hidden">
    <JobCardGrid jobs={filteredJobs} />
    {hasMore && (
      <div className="mt-8 text-center">
        <Button variant="ghost" size="md" onClick={() => loadJobs(false)} disabled={loadingMore}>
          {loadingMore ? 'Loading more...' : `Load more (${filteredJobs.length} of ${total})`}
        </Button>
      </div>
    )}
  </div>
</>
```

- [ ] **Step 3: Run build to verify**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/jobs/JobBoardPage.tsx
git commit -m "feat: responsive job board with mobile filter drawer and active filter chips"
```

---

### Task 7: Responsive Overhaul — Public Pages

**Files:**
- Modify: `src/components/home/HomePage.tsx` (and sub-components)
- Modify: `src/components/about/AboutPage.tsx` (and sub-components)
- Modify: `src/components/contact/ContactPage.tsx` (and sub-components)
- Modify: `src/components/employers/EmployersPage.tsx` (and sub-components)
- Modify: `src/components/jobs/JobDetailPage.tsx`
- Modify: `src/components/blog/BlogPage.tsx`

**Interfaces:**
- Consumes: Existing component structure
- Produces: Same components with responsive class updates

- [ ] **Step 1: Update HomePage section padding and typography**

Apply `py-12 md:py-24` to sections, verify hero text scales properly.

- [ ] **Step 2: Update AboutPage grid layouts**

Ensure 2-col story section stacks on mobile: `grid-cols-1 md:grid-cols-2`.

- [ ] **Step 3: Update ContactPage layout**

Ensure 2-col layout stacks on mobile: `grid-cols-1 md:grid-cols-2`.

- [ ] **Step 4: Update EmployersPage**

Ensure pricing cards and features grids are responsive.

- [ ] **Step 5: Update JobDetailPage**

Responsive header: `flex flex-col sm:flex-row sm:items-center justify-between gap-4`. Add mobile apply bar at bottom (`lg:hidden`).

- [ ] **Step 6: Update BlogPage card grid**

Ensure `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.

- [ ] **Step 7: Run build to verify**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 8: Commit**

```bash
git add src/components/home/ src/components/about/ src/components/contact/ src/components/employers/ src/components/jobs/JobDetailPage.tsx src/components/blog/
git commit -m "feat: mobile-first responsive overhaul for all public pages"
```

---

### Task 8: Responsive Overhaul — Dashboard & Card Components

**Files:**
- Modify: `src/components/dashboard/ApplicationsTab.tsx`
- Modify: `src/components/dashboard/SavedJobsTab.tsx`
- Modify: `src/components/dashboard/ApplicationCard.tsx`
- Modify: `src/components/employer-dashboard/ApplicantsTab.tsx`
- Modify: `src/components/employer-dashboard/JobListingsTab.tsx`

**Interfaces:**
- Consumes: Existing component structure
- Produces: Same components with responsive class updates

- [ ] **Step 1: Update ApplicationCard responsive layout**

Status badge positioning: `flex flex-col sm:flex-row sm:items-center justify-between gap-2`.

- [ ] **Step 2: Update ApplicantsTab action buttons**

Action buttons: `flex flex-wrap gap-2 mt-3` to prevent overflow on mobile.

- [ ] **Step 3: Update JobListingsTab**

Applicant count + View link: stack on mobile with `flex flex-col sm:flex-row sm:items-center gap-2`.

- [ ] **Step 4: Update SavedJobsTab and ApplicationsTab grid**

Verify grids use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` and `space-y-4` respectively.

- [ ] **Step 5: Update SkeletonGrid usage**

Verify `SkeletonGrid` components use responsive column counts.

- [ ] **Step 6: Run build to verify**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add src/components/dashboard/ src/components/employer-dashboard/
git commit -m "feat: responsive updates for dashboard cards and tabs"
```

---

## File Change Summary

| Action | File | Task |
|--------|------|------|
| Create | `src/components/ui/NotFoundPage.tsx` | 1 |
| Create | `src/components/layout/Sidebar.tsx` | 2 |
| Create | `src/components/layout/sidebar-constants.ts` | 2 |
| Create | `src/components/layout/Infobar.tsx` | 3 |
| Create | `src/components/layout/DashboardShell.tsx` | 4 |
| Create | `src/components/jobs/FilterDrawer.tsx` | 5 |
| Create | `src/components/jobs/ActiveFilterChips.tsx` | 5 |
| Modify | `src/App.tsx` | 1, 4 |
| Modify | `src/components/dashboard/DashboardPage.tsx` | 4 |
| Modify | `src/components/employer-dashboard/EmployerDashboardPage.tsx` | 4 |
| Modify | `src/components/jobs/JobBoardPage.tsx` | 6 |
| Modify | Various public pages | 7 |
| Modify | Various dashboard cards/tabs | 8 |

## Validation and Acceptance

After all tasks:

1. **Build passes:** `npx tsc --noEmit` returns no errors
2. **Visual verification:** Open in browser at 320px, 375px, 768px, 1024px, 1280px widths
3. **Dashboard sidebar:** Persistent on md+, hamburger drawer on mobile
4. **Job filters:** Bottom sheet on mobile, sidebar on desktop, active chips visible
5. **404 page:** Centered, responsive heading
6. **No horizontal overflow** on any page at any breakpoint
7. **Keyboard navigation:** Tab through sidebar, filter drawer, tabs
8. **Focus-visible rings** on all interactive elements

## Idempotence and Recovery

- Each task is independently committable — if a task fails, the previous tasks remain working
- The DashboardShell wraps routes but doesn't change the page content — reverting the App.tsx route changes restores the old layout
- FilterDrawer is additive — the old FilterSidebar remains for desktop
- All changes are CSS class additions/changes — no data model or API changes
