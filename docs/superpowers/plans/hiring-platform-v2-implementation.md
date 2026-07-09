# HireHub Community v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade HireHub Community with logo, 32 real jobs, auth pages, about/contact pages, and job posting form.

**Architecture:** All pages are static/frontend-only MVP. New pages follow same component pattern: `src/components/<section>/` with barrel exports. Single-page layout with Navbar + Footer + Routing.

**Tech Stack:** Vite + React + TypeScript + Tailwind CSS v3 + react-router-dom + lucide-react + @fontsource/inter

---

### Task 0: Logo + Brand Assets

**Files:**
- Create: `public/logo.svg` — Full logo (H monogram icon + wordmark)
- Create: `public/logo-mark.svg` — Icon only
- Modify: `public/favicon.svg` — Replace Vite default with HireHub H mark
- Modify: `index.html` — Update title, favicon path

**Spec:**
- Icon: Geometric "H" letterform in accent (#ff5600), clean modern style
- Wordmark: "HireHub" in Inter medium, ink (#111111) color
- Tagline: "Community" below in smaller text, ink-muted (#626260)
- Favicon: Same H icon, centered in viewBox

**Logo SVG structure:**
```svg
<!-- Icon + Wordmark combined -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 48">
  <!-- H icon -->
  <rect x="4" y="4" width="40" height="40" rx="8" fill="#ff5600"/>
  <path d="M16 14v20M16 24h16M32 14v20" stroke="white" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <!-- HireHub text -->
  <text x="52" y="32" font-family="Inter, system-ui, sans-serif" font-size="24" font-weight="500" fill="#111111">HireHub</text>
</svg>
```

---

### Task 1: Job Data Upgrade

**Files:**
- Replace: `src/data/jobs.ts` — Replace contents with 32 jobs from `jobs.json`
- Modify: `src/data/companies.ts` — Add new companies (SonarSource, RSM US, Lowe's, TransUnion, Binance, Halter, Apex Fintech, Meology, FuzionGrow, Soulism Lab, EVI, Arc.dev Partner, Crypto Exchange, STERRY, Eirmon Solutions, ChillBase, Inspira Financial, Tate's Bake Shop, Flusi)
- Source: `/home/n0ccx/Documents/Projects/transit/race/jobs.json`

**Steps:**
1. Add `"expert"` to the `seniority` union type in `src/data/jobs.ts`
2. Read `/home/n0ccx/Documents/Projects/transit/race/jobs.json` and replace array contents
3. Merge company names from jobs into `src/data/companies.ts`
4. Verify with `npx tsc --noEmit`

---

### Task 2: Auth Components + Pages

**Files to create:**
- `src/components/auth/AuthCard.tsx` — Reusable centered card wrapper
- `src/components/auth/SocialAuth.tsx` — Google/GitHub buttons with "or" divider
- `src/components/auth/LoginPage.tsx`
- `src/components/auth/SignupPage.tsx`
- `src/components/auth/ForgotPasswordPage.tsx`
- `src/components/auth/ResetPasswordPage.tsx`
- `src/components/auth/index.ts` — Barrel exports

**AuthCard spec:**
- Props: `title: string, subtitle?: string, children: ReactNode`
- No wrapping Section — just `min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4`
- Inner card: `max-w-md w-full bg-surface-1 rounded-lg p-8`
- Logo link at top (use Link to="/")
- h1 title, p subtitle
- Children (form content) below

**SocialAuth spec:**
- Props: none
- Two buttons side by side: Google, GitHub
- Using lucide icons (if available) or text
- Divider row: `<div className="flex items-center gap-3 my-6"><hr className="flex-1 border-hairline"/><span className="text-sm text-ink-muted">or</span><hr className="flex-1 border-hairline"/></div>`

**LoginPage spec:**
- Uses AuthCard with title="Welcome back" subtitle="Sign in to your HireHub account"
- Email input, Password input
- "Remember me" checkbox row + "Forgot password?" link
- Submit Button "Sign in" variant="primary" w-full
- Footer: "Don't have an account? Sign up" link to /signup
- Use `document.title = "Sign In | HireHub Community"`

**SignupPage spec:**
- AuthCard title="Create your account" subtitle="Join HireHub Community today"
- Full name, Email, Password, Confirm password inputs
- Terms checkbox "I agree to the Terms of Service and Privacy Policy"
- Submit "Create account" variant="primary" w-full
- Footer: "Already have an account? Sign in" link to /login
- SocialAuth above form

**ForgotPasswordPage spec:**
- AuthCard title="Reset your password"
- Description text
- Email input
- Submit "Send reset link"
- Success state (controlled by `sent` state boolean):
  - Email icon (MailCheck from lucide or CheckCircle)
  - "Check your email" heading
  - "We sent a reset link to {email}"
  - "Resend" link
- Footer: "Back to sign in" link to /login

**ResetPasswordPage spec:**
- AuthCard title="Set new password"
- New password, Confirm password inputs
- Password hint text
- Submit "Reset password"
- On success, show message with link to /login

---

### Task 3: About Us Page

**Files to create:**
- `src/components/about/AboutHero.tsx`
- `src/components/about/AboutStory.tsx`
- `src/components/about/AboutValues.tsx`
- `src/components/about/AboutPage.tsx`
- `src/components/about/index.ts`

**AboutHero:**
- Section bg-canvas
- Container, text-center
- h1 "About HireHub Community"
- Subtitle
- Simple typography hero

**AboutStory:**
- Section default
- Container
- 2-col grid: text left, stats right
- h2 "Our story", paragraphs
- Stats: 4 metrics in column

**AboutValues:**
- Section bg-canvas
- Container
- h2 centered "What we believe"
- 3-col grid of value cards (Card variant="default" p-6)
- Each: Icon (Heart, Shield, Users lucide icons) + h3 + p

---

### Task 4: Contact Page

**Files to create:**
- `src/components/contact/ContactInfo.tsx`
- `src/components/contact/ContactForm.tsx`
- `src/components/contact/ContactPage.tsx`
- `src/components/contact/index.ts`

**ContactInfo:**
- Section default
- Container
- 2-col grid
- Left: Mail, Phone, MapPin icons with contact details
- Right: ContactForm component
- Form: Name, Email, Subject, Message inputs
- Submit "Send message" variant="primary"
- Success state handled internally

---

### Task 5: Post a Job Page

**Files to create:**
- `src/components/post-job/PostJobForm.tsx`
- `src/components/post-job/PostJobPage.tsx`
- `src/components/post-job/index.ts`

**PostJobForm:**
- Section default, Container max-w-2xl
- h1 "Post a Job", info banner
- Form fields (all controlled useState):
  - title, company, location, remote (checkbox), salaryMin, salaryMax
  - currency (select), category (select), seniority (select)
  - tags (text input), description, requirements, responsibilities (textareas)
  - applicationUrl (text)
- Submit "Submit job listing" variant="primary" w-full
- On submit: show success alert banner + reset form

---

### Task 6: Routing + Navbar + Footer Updates

**Files to modify:**
- Modify: `src/App.tsx` — Add all new routes
- Modify: `src/components/layout/Navbar.tsx` — Logo, new nav links, Sign In link
- Modify: `src/components/layout/Footer.tsx` — Logo, new links

**App.tsx changes:**
- Import all 7 new page components
- Add Route entries for all 7 new routes

**Navbar changes:**
- Import logo.svg as component or use img tag
- Replace "HireHub" text span with logo image (h-7)
- Add "About" to navLinks
- "Sign In" Button → Link to /login
- "Post a Job" Button → Link to /post-job
- Mobile: same updates

**Footer changes:**
- Replace "HireHub" text with logo
- Update "About Us" → /about
- "Contact" → /contact
- Add "Post a Job" to Company column

---

### Task 7: Final Verification

- Run `npx tsc --noEmit` — zero errors
- Run `npx vite build` — zero errors, zero warnings
- Verify all 14 routes work in dev server
- Check responsive on mobile widths
- Verify no dead links in Navbar/Footer

---

## Execution Order

```
Task 0: Logo → 
Task 1: Jobs Data → 
Task 2: Auth → 
Task 3: About → 
Task 4: Contact → 
Task 5: Post a Job → 
Task 6: Routes/Nav/Footer → 
Task 7: Verify
```

No parallel task dispatch — sequential with spec review between tasks.
