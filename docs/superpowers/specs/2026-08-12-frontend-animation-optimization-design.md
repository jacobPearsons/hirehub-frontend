# Frontend Animation + Optimization Pass — Design

## Goal

Add tasteful, accessible animations to the areas of the HireHub frontend that lack them, implement the two fixes from `fixes.md` (hero headline typewriter, endless "Powered by" logo marquee), and fix CLS / image-loading performance on the largest assets — without breaking any of the 308 existing tests.

## Scope

High-impact set (user-selected):

1. Hero headline typewriter: types the WHOLE phrase "Find your next role at companies that build", holds ~2.5s, backspaces, loops.
2. TrustBar → endless right-moving marquee; heading text changes "Trusted by teams at" → "Powered by"; curated ~16 logos.
3. Animate the three currently-instant dialogs: Navbar mobile menu, Sidebar mobile drawer, FilterDrawer.
4. Tab panel transitions in `ui/Tabs.tsx`.
5. Entrance motion for OverviewTab stat cards and FeaturedJobs cards.
6. Animated Suspense fallback (replace static "Loading...").
7. Image CLS/lazy-loading: `width`/`height` on the six 1672×941 PNGs; lazy-load except hero images; `fetchpriority="high"` on the homepage hero.

Out of scope (triage): React.memo, inline-variant hoisting in existing tab components, the O(n²) filter in JobListingsTab, logo-SVG dedup, font preload, image re-encoding to WebP/AVIF.

## Principles

- **House style is framer-motion** (`framer-motion ^12.42.2` already a dependency). Follow the existing `Reveal.tsx` and `ApplyJobModal.tsx` patterns. No new dependencies.
- **Reduced motion:** all NEW primitives and scroll/list entrances gate on `useReducedMotion()` (house rule in `src/index.css:69-78`). The three dialogs follow the existing modal pattern (fixed durations, consistent with the other 7 modals).
- **Accessibility:** typewriter exposes the full phrase via `aria-label` (screen readers announce the complete heading, not letters); marquee duplicates are `aria-hidden`; Radix Dialog focus-trap/ESC behavior preserved.
- **Tests:** new vitest coverage for `Typewriter`, `Marquee`, `TrustBar`, `Tabs`; all existing tests stay green. Gates: `npm run test:run`, `npm run lint`, `npm run build`.

## Components

### `src/components/ui/Typewriter.tsx` (new)

`<Typewriter text speed? deleteSpeed? holdMs? className?>` — internal `count`/`phase` state machine (`typing → holding → deleting → typing…`). `useReducedMotion()` → renders full static text. Renders a blinking caret (Tailwind `animate-pulse`) while not holding. `aria-label={text}`.

### `src/components/ui/Marquee.tsx` (new)

`<Marquee items direction? duration? className?>` — two copies of `items` on a `w-max` flex track animated `x: ['-50%','0%']` (right) or `['0%','-50%']` (left), `ease: 'linear'`, `repeat: Infinity`. Edge fade via `[mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]`. Second copy `aria-hidden`. `useReducedMotion()` → static single-row wrap (`flex flex-wrap justify-center gap-8 md:gap-12`).

### Modified components

| File | Change |
| --- | --- |
| `src/components/home/HeroSection.tsx` | `h1` uses `<Typewriter>` for the whole phrase; remove the `<br/>`; badge/subhead/CTAs unchanged |
| `src/components/home/TrustBar.tsx` | "Powered by" heading; `Marquee` of 16 logos (8 existing PNGs + 8 unused .avif) |
| `src/components/layout/Navbar.tsx` | mobile Dialog.Content: overlay fade + content fade + staggered links |
| `src/components/layout/Sidebar.tsx` | mobile drawer: `AnimatePresence` + overlay fade + panel slide `x: -100% → 0` |
| `src/components/jobs/FilterDrawer.tsx` | bottom sheet slide `y: 100% → 0` + overlay fade |
| `src/components/ui/Tabs.tsx` | `TabsContent` panel wrapped in `AnimatePresence mode="wait"` + fade/y, reduced-motion aware |
| `src/components/dashboard/OverviewTab.tsx` | stat-card grid gets staggered `whileInView` entrance |
| `src/components/home/FeaturedJobs.tsx` | featured cards get staggered `whileInView` entrance |
| `src/App.tsx` | Suspense fallback becomes an animated brand pulse instead of static text |
| 6 PNG `<img>` usages | add `width="1672" height="941"`; lazy-load except heroes; `fetchpriority="high"` on homepage hero |

## Image inventory (all 1672×941 PNG)

- `src/components/home/HeroSection.tsx:9-14` — `hero-homepage.png`, eager + `fetchpriority="high"`.
- `src/components/home/FeaturedJobs.tsx:39` — `featured-jobs.png`, already lazy.
- `src/components/jobs/JobBoardPage.tsx:125` — `featured-jobs.png`, add lazy if missing.
- `src/components/blog/BlogPage.tsx:42` — `blog-featured.png`, add lazy.
- `src/components/employers/EmployersHero.tsx:10-14` — `employers-hero.png`, eager.
- `src/components/onboarding/OnboardingWizard.tsx:59-64` — `onboarding-bg.png`, eager.
- `src/components/layout/DashboardShell.tsx:30-34` — `dashboard-bg.png`, lazy.

## Deliverables

- Spec (this document) committed.
- Implementation plan committed.
- One commit per milestone (M1–M5), each with tests green, lint clean, build clean.
