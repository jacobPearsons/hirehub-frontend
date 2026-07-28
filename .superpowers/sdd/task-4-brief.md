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

