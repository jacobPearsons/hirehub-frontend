# HireHub Community — Consistent Border Styling & Production Polish

> **Status:** Draft → Ready for Implementation
> **Scope:** Frontend only (Vite + React 19 + TypeScript 6 + Tailwind CSS)
> **Design Style:** Minimal warm SaaS (existing)

## 1. Executive Summary

The app has 12+ hero and first-section components with bare text over background images — no borders, no card containers. Only the `AuthCard` uses a bordered card pattern (`bg-surface-1/95 backdrop-blur-sm rounded-lg p-8`). The user requested "borders around text in the first section" with "consistent styling across all the codebase" and "dark mode variants" to achieve a professional, production-ready UX.

## 2. Gap Analysis

### Hero Sections (No border/card container)
| Component | File | Background | Current State |
|-----------|------|------------|---------------|
| AboutHero | `components/about/AboutHero.tsx` | `/about-hero.png` + gradient | Bare text, no container |
| HeroSection (Home) | `components/home/HeroSection.tsx` | `/hero-homepage.png` + gradient | Bare text, no container |
| EmployersHero | `components/employers/EmployersHero.tsx` | `/employers-hero.png` + gradient | Bare text, no container |

### First Sections with Low-Opacity BG (No border)
| Component | File | Background | Current State |
|-----------|------|------------|---------------|
| BlogPage intro | `components/blog/BlogPage.tsx` | `/blog-featured.png` at 5% | Bare text, no container |
| JobBoardPage intro | `components/jobs/JobBoardPage.tsx` | `/featured-jobs.png` at 5% | Bare text, no container |
| ContactInfo | `components/contact/ContactInfo.tsx` | `/contact-bg.png` at 6% | Bare text, no container |
| PostJobPage intro | `components/post-job/PostJobPage.tsx` | `/post-job-bg.png` at 5% | Bare text, no container |

### Clean Layout Sections (No border)
| Component | File | Current State |
|-----------|------|---------------|
| JobDetailPage header | `components/jobs/JobDetailPage.tsx` | Bare heading |
| BlogPostPage header | `components/blog/BlogPostPage.tsx` | Bare heading |
| DashboardPage header | `components/dashboard/DashboardPage.tsx` | Bare heading |
| EmployerDashboardPage header | `components/employer-dashboard/EmployerDashboardPage.tsx` | Bare heading |

### Only Component with Border Pattern
| Component | File | Pattern |
|-----------|------|---------|
| AuthCard | `components/auth/AuthCard.tsx` | `bg-surface-1/95 backdrop-blur-sm rounded-lg p-8` |

## 3. Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Reusable `HeroContent` component** | Single source of truth for consistent card styling across all sections |
| **Uses `border-hairline` + `bg-surface-1/80`** | Leverages existing design tokens; hairline already has dark mode variant |
| **`backdrop-blur-sm` on hero variants** | Matches AuthCard pattern; improves readability over background images |
| **No card on dashboard/clean pages** | Pure text sections get `border-l-2 border-accent` accent bar instead of full card — lighter touch for content pages |
| **`rounded-lg` radius** | Matches existing Card component and AuthCard |
| **Dark mode via existing tokens** | All colors use CSS custom properties that auto-switch with `[data-theme="dark"]` |

## 4. Proposed Design

### HeroContent Component (new)
A polymorphic wrapper component with two variants:
- **`card`** — Full bordered card with `bg-surface-1/80 backdrop-blur-sm border border-hairline rounded-lg p-8 md:p-10` — for use over background images
- **`accent`** — Minimal left accent border `border-l-2 border-accent pl-4` — for use on clean/dashboard pages

```tsx
interface HeroContentProps {
  variant?: 'card' | 'accent'
  children: ReactNode
  className?: string
}
```

### Application Plan

| Component | Variant | Why |
|-----------|---------|-----|
| AboutHero | `card` | Content over background image; needs readability |
| HeroSection | `card` | Content over background image; needs readability |
| EmployersHero | `card` | Content over background image; needs readability |
| BlogPage | `card` | Content over background image; needs readability |
| JobBoardPage | `card` | Content over background image; needs readability |
| ContactInfo | `card` | Content over background image; needs readability |
| PostJobPage | `card` | Content over background image; needs readability |
| JobDetailPage | `accent` | Clean layout, no background image |
| BlogPostPage | `accent` | Clean layout, no background image |
| DashboardPage | `accent` | Clean layout, no background image |
| EmployerDashboardPage | `accent` | Clean layout, no background image |

## 5. Success Criteria

- All hero sections show bordered card containers over background images
- Dashboard and clean pages show left accent border
- All borders automatically adapt to dark mode via CSS custom properties
- No visual regressions at standard breakpoints (375px, 768px, 1024px, 1440px)
- TypeScript build passes with zero errors
