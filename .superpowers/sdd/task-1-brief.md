## Task 1 — Fix 6 failing suite files (IntersectionObserver)

Root cause: `Reveal.tsx` uses framer-motion `whileInView`, which needs
`IntersectionObserver`; jsdom doesn't provide it. Affects `JobBoardPage` (6),
`EmployerDashboardPage` (3), `DashboardPage` (3), `BlogPage` (2) = 14 failures.

TDD: `npm run test:run` → confirm 16 fail. Implement:

`src/test/setup.ts` — append a no-op polyfill:

```ts
class IntersectionObserverMock {
  root: Element | null = null
  rootMargin = ''
  thresholds: ReadonlyArray<number> = []
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] { return [] }
}
globalThis.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver
```

`npm run test:run` → those 14 pass (16 → 2 remaining). Also run `npm run build`
to be safe (type-only change).

Commit: `fix(test): polyfill IntersectionObserver in vitest setup`.

