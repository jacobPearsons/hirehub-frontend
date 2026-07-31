import '@testing-library/jest-dom/vitest'

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
