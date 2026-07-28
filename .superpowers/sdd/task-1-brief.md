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

