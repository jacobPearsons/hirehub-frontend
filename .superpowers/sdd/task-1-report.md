## Task 1: 404 Page Component — Report

### What I Implemented

Extracted the inline 404 page from `App.tsx` into a standalone `NotFoundPage` component. Changes:

- Created `src/components/ui/NotFoundPage.tsx` with responsive typography (`text-5xl` → `md:text-[56px]`), `bg-canvas`, `px-4` for mobile safe area, and `focus-visible` ring on the "Go home" link
- Updated `src/App.tsx` to import and use `<NotFoundPage />` in the catch-all route, removing the unused `Link` import from react-router-dom

### What I Tested

- Ran `npx tsc --noEmit` — **0 type errors**

### Files Changed

| File | Change |
|------|--------|
| `src/components/ui/NotFoundPage.tsx` | Created |
| `src/App.tsx` | Replaced inline 404 JSX (lines 60-68) with component, added import, removed unused `Link` import |

### Issues / Concerns

None.
