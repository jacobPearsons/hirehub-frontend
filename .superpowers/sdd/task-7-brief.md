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

