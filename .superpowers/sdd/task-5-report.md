# Task 5 Report: FilterDrawer + ActiveFilterChips

## What I Implemented

1. **FilterDrawer** (`src/components/jobs/FilterDrawer.tsx`) — A Radix Dialog bottom sheet for mobile filter UI. Contains three filter groups (Category, Seniority, Location) using chip-style buttons, a sticky header with title + close button, and a sticky footer with Clear/Show Results actions. Hidden on `md:` breakpoint and above.

2. **ActiveFilterChips** (`src/components/jobs/ActiveFilterChips.tsx`) — A chip row component that renders removable filter tags for any non-empty active filter. Each chip has an X button to clear that specific filter. Returns null when no filters are active.

## What I Tested

- `npx tsc --noEmit` — passed with zero errors.

## Files Changed

| File | Action |
|---|---|
| `src/components/jobs/FilterDrawer.tsx` | Created |
| `src/components/jobs/ActiveFilterChips.tsx` | Created |

## Issues or Concerns

- **Import path adjustment**: The brief used `import { Button } from '../ui/Button'` but the existing FilterSidebar uses `import { Button } from '../ui'`. I aligned with the existing barrel import convention for consistency.
- **Unused imports**: `motion` and `AnimatePresence` from `framer-motion` are imported in FilterDrawer but not currently used in the rendered JSX. This matches the brief exactly. If the build linter flags this as unused, they can be removed or the slide-up animation can be added later.
- **`rounded-pill`** class: Used in the brief and in FilterSidebar for chip-style elements. Assumed it's defined in the project's Tailwind config or CSS custom properties.
