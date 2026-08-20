# WS3: Collapsible Dashboard Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the desktop dashboard sidebar collapsible (collapse to the left, showing only the logo/icon rail) with a toggle button, and keep dashboard content centered/readable in both states.

**Architecture:** `DashboardShell.tsx` owns a `collapsed` boolean that flows to the desktop `<Sidebar>` (rendered with `collapsed` prop) and to `<Infobar>` (which gains a desktop collapse toggle alongside its existing `onMenuToggle`). The desktop sidebar switches from `w-56` with labels to a `w-14` icon rail when collapsed; `Infobar` shows a chevron toggle; `main` padding stays `md:p-6 lg:p-8` so content remains centered and doesn't jump.

**Tech Stack:** React 19, Tailwind CSS 3, Lucide React, Framer Motion.

## Global Constraints

- Follow HireHub DESIGN.md conventions: tokens via Tailwind, no `cn()`/`clsx()`, string concat ternaries
- Focus-visible rings on all interactive elements
- Button `type` defaults to `'button'`
- Existing dependencies only — no new npm packages
- Sidebar labels hidden when collapsed must remain accessible (title attribute or visually-hidden span)
- Run `npm run test:run`, `npm run build`, `npm run lint` after each task

---

### Task 1: Add collapsed state to desktop Sidebar

**Files:**
- Modify: `src/components/layout/Sidebar.tsx:9-14, 104-137`

**Interfaces:**
- Consumes: `collapsed?: boolean` prop
- Produces: Desktop `Sidebar` renders `w-56` expanded or `w-14` collapsed (icon rail); `NavItem` hides its label when collapsed but keeps it via `title` + visually-hidden span

- [ ] **Step 1: Write the failing test**

Create `src/components/layout/__tests__/Sidebar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar } from '../Sidebar'

jest.mock('../../../context/AppContext', () => ({
  useApp: () => ({ user: { name: 'Ada', role: 'seeker' }, setUser: jest.fn() }),
}))
jest.mock('../../../api/auth', () => ({ logout: jest.fn() }))
jest.mock('../../../api/client', () => ({ setAccessToken: jest.fn() }))

describe('Sidebar', () => {
  it('renders nav labels when expanded', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    )
    expect(screen.getByText('Overview')).toBeInTheDocument()
  })

  it('hides nav labels when collapsed', () => {
    render(
      <MemoryRouter>
        <Sidebar collapsed />
      </MemoryRouter>,
    )
    expect(screen.queryByText('Overview')).not.toBeInTheDocument()
    // label still accessible via title
    expect(screen.getByTitle('Overview')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/components/layout/__tests__/Sidebar.test.tsx`
Expected: FAIL — `collapsed` prop not supported.

- [ ] **Step 3: Update Sidebar props and NavItem**

```tsx
interface SidebarProps {
  mobile?: boolean
  isOpen?: boolean
  onClose?: () => void
  collapsed?: boolean
}
```

In `NavItem`, accept `collapsed`:

```tsx
function NavItem({ item, onClick, collapsed }: { item: SidebarItem; onClick?: () => void; collapsed?: boolean }) {
  const Icon = item.icon
  const { pathname, search } = useLocation()
  const active = isNavActive(pathname, search, item.to)
  return (
    <Link
      to={item.to}
      onClick={onClick}
      title={item.label}
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
        active ? 'bg-accent/10 text-accent' : 'text-ink-muted hover:text-ink hover:bg-surface-2'
      } ${collapsed ? 'justify-center px-0' : ''}`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  )
}
```

Pass `collapsed` through `SidebarContent`:

```tsx
function SidebarContent({ onNavClick, collapsed }: { onNavClick?: () => void; collapsed?: boolean }) {
  // ...
  <NavItem key={item.label} item={item} onClick={onNavClick} collapsed={collapsed} />
}
```

Update the desktop render:

```tsx
return (
  <div className={`hidden md:flex ${collapsed ? 'w-14' : 'w-56'} shrink-0 border-r border-hairline transition-all duration-200`}>
    <SidebarContent collapsed={collapsed} />
  </div>
)
```

Hide the sidebar footer user block when collapsed:

```tsx
{!collapsed && user && (
  <div className="flex items-center gap-3 px-3 py-2.5">
    {/* existing user row */}
  </div>
)}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/components/layout/__tests__/Sidebar.test.tsx`
Expected: PASS

- [ ] **Step 5: Full gate**

Run: `npm run test:run && npm run build && npm run lint`
Expected: all pass

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/Sidebar.tsx src/components/layout/__tests__/Sidebar.test.tsx
git commit -m "feat(dashboard): support collapsed desktop sidebar"
```

---

### Task 2: Wire collapse toggle in DashboardShell + Infobar

**Files:**
- Modify: `src/components/layout/DashboardShell.tsx:10-35`
- Modify: `src/components/layout/Infobar.tsx` (find exact path via glob `src/components/layout/Infobar.tsx`)

**Interfaces:**
- Consumes: `collapsed` state in DashboardShell; `onCollapseToggle` in Infobar
- Produces: Chevron button in Infobar (md+) toggles collapsed state; persists to `localStorage('hirehub-sidebar-collapsed')`

- [ ] **Step 1: Read Infobar**

Run: `cat src/components/layout/Infobar.tsx`

- [ ] **Step 2: Write the failing test**

Extend `src/components/layout/__tests__/DashboardShell.test.tsx` (create if missing, mocking Sidebar/Infobar):

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DashboardShell } from '../DashboardShell'

jest.mock('../Sidebar', () => ({
  Sidebar: (props: any) => (
    <div data-testid="sidebar" data-collapsed={String(!!props.collapsed)} />
  ),
}))

jest.mock('../Infobar', () => ({
  Infobar: (props: any) => (
    <button type="button" data-testid="collapse-toggle" onClick={props.onCollapseToggle}>
      toggle
    </button>
  ),
}))

describe('DashboardShell', () => {
  it('toggles the sidebar collapsed state', async () => {
    const user = userEvent.setup()
    render(<DashboardShell><div>content</div></DashboardShell>)
    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar.dataset.collapsed).toBe('false')
    await user.click(screen.getByTestId('collapse-toggle'))
    expect(sidebar.dataset.collapsed).toBe('true')
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test:run -- src/components/layout/__tests__/DashboardShell.test.tsx`
Expected: FAIL — no toggle handler wired.

- [ ] **Step 4: Update DashboardShell**

```tsx
const [sidebarOpen, setSidebarOpen] = useState(false)
const [collapsed, setCollapsed] = useState(() => {
  try { return localStorage.getItem('hirehub-sidebar-collapsed') === 'true' } catch { return false }
})

function handleCollapseToggle() {
  setCollapsed((prev) => {
    const next = !prev
    try { localStorage.setItem('hirehub-sidebar-collapsed', String(next)) } catch { /* intentionally empty */ }
    return next
  })
}
```

Pass props:

```tsx
<Sidebar collapsed={collapsed} />
<Infobar onMenuToggle={() => setSidebarOpen(true)} onCollapseToggle={handleCollapseToggle} collapsed={collapsed} />
```

- [ ] **Step 5: Add the desktop toggle to Infobar**

In `Infobar.tsx`, add an `onCollapseToggle`/`collapsed` prop and render (before or after the mobile menu button):

```tsx
{onCollapseToggle && (
  <button
    type="button"
    onClick={onCollapseToggle}
    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    aria-expanded={!collapsed}
    className="hidden md:inline-flex items-center justify-center p-2 rounded-md text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
  >
    {collapsed ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
  </button>
)}
```

Import `ChevronsLeft`, `ChevronsRight` from `lucide-react`. If `Infobar` has no props interface yet, add one: `interface InfobarProps { onMenuToggle: () => void; onCollapseToggle?: () => void; collapsed?: boolean }`.

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm run test:run -- src/components/layout/__tests__/DashboardShell.test.tsx`
Expected: PASS

- [ ] **Step 7: Full gate**

Run: `npm run test:run && npm run build && npm run lint`
Expected: all pass

- [ ] **Step 8: Commit**

```bash
git add src/components/layout/DashboardShell.tsx src/components/layout/Infobar.tsx src/components/layout/__tests__/DashboardShell.test.tsx
git commit -m "feat(dashboard): collapsible sidebar with persistent toggle"
```

---

## Validation and Acceptance

1. On md+ screens, the sidebar collapses to a `w-14` icon rail and expands back via the Infobar chevron
2. Collapse state persists across reloads via localStorage
3. Nav items remain keyboard-accessible when collapsed (`title` + `aria-label`)
4. Content area padding is unchanged and content stays centered in both states
5. Mobile drawer sidebar is unaffected
6. All frontend gates pass
