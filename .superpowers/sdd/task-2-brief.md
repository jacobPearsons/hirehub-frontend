### Task 2: Legal pages and routes

**Files:**
- Create: `src/components/legal/PrivacyPolicyPage.tsx`
- Create: `src/components/legal/TermsPage.tsx`
- Create: `src/components/legal/CookiePolicyPage.tsx`
- Create: `src/components/legal/index.ts`
- Modify: `src/App.tsx` (lazy imports + 3 routes)
- Test: `src/components/legal/__tests__/LegalPages.test.tsx`

**Interfaces:**
- Consumes: `getLegalDocument`, `LegalLayout`, `LegalDocument` from Task 1; `usePageMeta` from `../../utils/usePageMeta`.
- Produces: default-exported `PrivacyPolicyPage`, `TermsPage`, `CookiePolicyPage` (each renders `{meta}` + `<LegalLayout doc={...} />`); routes `/privacy`, `/terms`, `/cookies` in `App.tsx`; `src/components/legal/index.ts` barrel.

- [ ] **Step 1: Write the failing test**

Create `src/components/legal/__tests__/LegalPages.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import PrivacyPolicyPage from '../PrivacyPolicyPage'
import TermsPage from '../TermsPage'
import CookiePolicyPage from '../CookiePolicyPage'

vi.mock('../../../utils/usePageMeta', () => ({
  usePageMeta: () => null,
}))

describe('LegalPages', () => {
  it('renders the privacy policy', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByRole('heading', { level: 1, name: /privacy policy/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /information we collect/i })).toBeInTheDocument()
  })

  it('renders the terms of service', () => {
    render(<TermsPage />)
    expect(screen.getByRole('heading', { level: 1, name: /terms of service/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /acceptance of terms/i })).toBeInTheDocument()
  })

  it('renders the cookie policy', () => {
    render(<CookiePolicyPage />)
    expect(screen.getByRole('heading', { level: 1, name: /cookie policy/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /what are cookies/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/legal/__tests__/LegalPages.test.tsx`
Expected: FAIL — the three page modules cannot be resolved.

- [ ] **Step 3: Create the three page components**

`src/components/legal/PrivacyPolicyPage.tsx`:

```tsx
import { usePageMeta } from '../../utils/usePageMeta'
import { getLegalDocument } from './legalData'
import { LegalLayout } from './LegalLayout'

export default function PrivacyPolicyPage() {
  const meta = usePageMeta({
    title: 'Privacy Policy',
    description: 'How HireHub Community collects, uses, and protects your information.',
    url: '/privacy',
  })
  return (
    <>
      {meta}
      <LegalLayout doc={getLegalDocument('privacy')} />
    </>
  )
}
```

`src/components/legal/TermsPage.tsx`:

```tsx
import { usePageMeta } from '../../utils/usePageMeta'
import { getLegalDocument } from './legalData'
import { LegalLayout } from './LegalLayout'

export default function TermsPage() {
  const meta = usePageMeta({
    title: 'Terms of Service',
    description: 'The rules that govern your use of HireHub Community.',
    url: '/terms',
  })
  return (
    <>
      {meta}
      <LegalLayout doc={getLegalDocument('terms')} />
    </>
  )
}
```

`src/components/legal/CookiePolicyPage.tsx`:

```tsx
import { usePageMeta } from '../../utils/usePageMeta'
import { getLegalDocument } from './legalData'
import { LegalLayout } from './LegalLayout'

export default function CookiePolicyPage() {
  const meta = usePageMeta({
    title: 'Cookie Policy',
    description: 'How HireHub Community uses cookies and similar technologies.',
    url: '/cookies',
  })
  return (
    <>
      {meta}
      <LegalLayout doc={getLegalDocument('cookies')} />
    </>
  )
}
```

`src/components/legal/index.ts`:

```ts
export { LegalLayout } from './LegalLayout'
export {
  getLegalDocument,
  legalDocuments,
  type LegalDocument,
  type LegalParagraph,
  type LegalSection,
} from './legalData'
export { default as PrivacyPolicyPage } from './PrivacyPolicyPage'
export { default as TermsPage } from './TermsPage'
export { default as CookiePolicyPage } from './CookiePolicyPage'
```

- [ ] **Step 4: Wire the routes in `src/App.tsx`**

Add the lazy imports after line 26 (`const FAQPage = lazy(...)`):

```tsx
const PrivacyPolicyPage = lazy(() => import('./components/legal/PrivacyPolicyPage'))
const TermsPage = lazy(() => import('./components/legal/TermsPage'))
const CookiePolicyPage = lazy(() => import('./components/legal/CookiePolicyPage'))
```

Add the routes after the `/faq` route (line 66):

```tsx
<Route path="/privacy" element={<ErrorBoundary><PrivacyPolicyPage /></ErrorBoundary>} />
<Route path="/terms" element={<ErrorBoundary><TermsPage /></ErrorBoundary>} />
<Route path="/cookies" element={<ErrorBoundary><CookiePolicyPage /></ErrorBoundary>} />
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/components/legal`
Expected: PASS (legalData, LegalLayout, and LegalPages suites all green).

- [ ] **Step 6: Typecheck, lint, and full suite**

Run: `npx tsc --noEmit && npx eslint . && npx vitest run`
Expected: tsc clean, eslint clean, 237 baseline tests + new legal tests all pass (no regressions — proves the `App.tsx` route additions compile and lazy imports resolve).

- [ ] **Step 7: Commit**

```bash
git add src/components/legal/PrivacyPolicyPage.tsx src/components/legal/TermsPage.tsx src/components/legal/CookiePolicyPage.tsx src/components/legal/index.ts src/components/legal/__tests__/LegalPages.test.tsx src/App.tsx
git commit -m "feat(legal): add privacy, terms, and cookie policy pages with routes"
```

---

