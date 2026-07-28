## Task 3: Infobar Component — Report

### What was implemented
Created `src/components/layout/Infobar.tsx` exactly per the task brief. The component renders a top bar with:
- Hamburger menu button (mobile only, hidden on `md+`) wired to `onMenuToggle` prop
- `ThemeToggle` integration
- User name display (hidden on small screens via `hidden sm:inline`)
- Logout button that calls `logout()`, clears the access token, resets user state, and navigates to `/`
- Proper focus-visible rings and `aria-label` on all interactive elements

### Test results
- `npx tsc --noEmit` — **passed** (zero type errors)

### Files changed
- Created: `src/components/layout/Infobar.tsx`

### Issues or concerns
- The barrel `src/components/layout/index.ts` was not updated per the brief (no instruction to do so). Consumers will need a direct import path for now.
