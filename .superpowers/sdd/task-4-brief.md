### Task 4: Footer links

**Files:**
- Modify: `src/components/layout/Footer.tsx:16,24` (broken `#` links) and `src/components/layout/Footer.tsx:19-25` (add Terms + Cookie links)
- Test: `src/components/layout/__tests__/Footer.test.tsx`

**Interfaces:**
- Consumes: existing `footerLinks` object shape `{ label: string; to: string }[]` rendered via react-router `Link`.
- Produces: `Help Center` → `/help`, `Privacy Policy` → `/privacy`, plus new `Terms of Service` → `/terms` and `Cookie Policy` → `/cookies` in the Company column. No `to: '#'` remaining in the four columns.

- [ ] **Step 1: Write the failing test**

Create `src/components/layout/__tests__/Footer.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Footer } from '../Footer'

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  )
}

describe('Footer', () => {
  it('links the Help Center and legal pages to real routes', () => {
    renderFooter()
    expect(screen.getByRole('link', { name: 'Help Center' })).toHaveAttribute('href', '/help')
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy')
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('href', '/terms')
    expect(screen.getByRole('link', { name: 'Cookie Policy' })).toHaveAttribute('href', '/cookies')
  })

  it('has no links pointing at "#" in the content columns', () => {
    renderFooter()
    const links = screen.getAllByRole('link')
    const hashLinks = links.filter((link) => link.getAttribute('href') === '#')
    expect(hashLinks).toHaveLength(3)
  })
})
```

Note: the second test expects exactly 3 `#` links — those are the three social links (`Globe`, `MessageCircle`, `ExternalLink`), which are intentionally placeholder `href="#"` anchors and are NOT part of the four content columns. Do not change the social links.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/layout/__tests__/Footer.test.tsx`
Expected: FAIL — `Help Center` has `href="#"` and `Terms of Service`/`Cookie Policy` links do not exist.

- [ ] **Step 3: Update `footerLinks` in `src/components/layout/Footer.tsx`**

Replace the `resources` entry (line 16) and the `company` array (lines 19-25):

```tsx
  resources: [
    { label: 'Blog', to: '/blog' },
    { label: 'Career Advice', to: '/blog' },
    { label: 'Salary Guide', to: '/blog' },
    { label: 'Help Center', to: '/help' },
    { label: 'FAQ', to: '/faq' },
  ],
  company: [
    { label: 'About Us', to: '/about' },
    { label: 'For Employers', to: '/employers' },
    { label: 'Contact', to: '/contact' },
    { label: 'Post a Job', to: '/post-job' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Cookie Policy', to: '/cookies' },
  ],
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/layout/__tests__/Footer.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Typecheck and full suite**

Run: `npx tsc --noEmit && npx eslint src/components/layout && npx vitest run`
Expected: tsc clean, eslint clean, all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/Footer.tsx src/components/layout/__tests__/Footer.test.tsx
git commit -m "fix(footer): point help and legal links at real routes"
```

---

