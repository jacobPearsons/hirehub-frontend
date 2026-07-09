# HireHub Community v2 — Design & Feature Specification

> **Status:** Approved for implementation  
> **Design Style:** Minimal warm SaaS (Inspired by Intercom)  
> **Stack:** Vite + React + TypeScript + Tailwind CSS v3 + react-router-dom + lucide-react  
> **Fonts:** Inter (body), JetBrains Mono (code)

---

## 1. Design Tokens

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `canvas` | `#f5f1ec` | Page background |
| `surface-1` | `#ffffff` | Cards, containers, modals |
| `surface-2` | `#ebe7e1` | Subtle backgrounds, hover states |
| `ink` | `#111111` | Primary text |
| `ink-muted` | `#626260` | Secondary text |
| `ink-subtle` | `#7b7b78` | Tertiary text |
| `ink-tertiary` | `#b1ada6` | Placeholder text |
| `accent` | `#ff5600` | Apply CTAs, primary actions only |
| `hairline` | `#d3cec6` | Borders, dividers |
| `hairline-soft` | `#ebe7e1` | Subtle dividers |
| `inverse-surface-1` | `#2b2b28` | Dark card background |
| `inverse-ink` | `#f0efec` | Text on dark backgrounds |
| `success` | `#0bdf50` | Success states |
| `error` | `#c41c1c` | Error states |
| `brand-blue` | `#0007cb` | Secondary brand color |

### Typography
- **Font family:** Inter (body), JetBrains Mono (code)
- **Scale:** 12px / 14px / 16px / 18px / 22px / 28px / 40px / 56px
- **Weights:** 400 (regular), 500 (medium), 600 (semibold)
- **Leading:** 1.15 (headings), 1.5 (body), 1.7 (long-form)
- **Letter spacing:** -0.8px on large headings (40px+)

### Spacing
- Base unit: 4px (Tailwind spacing scale)
- Section vertical: `py-16 md:py-24`
- Card padding: `p-6`
- Card gaps: `gap-6`
- Content max width: `max-w-7xl` centered
- Content edge padding: `px-4 md:px-6 lg:px-8`

### Radii
- `md`: 8px (buttons, inputs)
- `lg`: 12px (cards)
- `xl`: 16px (modals, large containers)
- `pill`: 9999px (tags, badges)

### Shadows
None. Flat design.

### Motion
- Hover: color/opacity transitions, 200ms ease
- Focus: `focus-visible:ring-2 focus-visible:ring-ink/40`
- Mobile menu: slide from right, 300ms ease
- No decorative entrance animations (v2 scope)

### Accessibility
- WCAG AA contrast minimums (4.5:1 text, 3:1 large text)
- Keyboard navigable all interactive elements
- `aria-hidden="true"` on decorative icons
- Skip-to-content link in Layout
- Heading hierarchy: exactly one h1 per page
- Touch targets minimum 44x44px

---

## 2. Brand Assets

### Logo
- **Type:** Icon + wordmark
- **Icon:** Monogram "H" in fin orange (#ff5600) — clean geometric letterform
- **Wordmark:** "HireHub" in Inter medium, ink color
- **Tagline (optional):** "Community" below in smaller text, ink-muted
- **Favicon:** Same "H" icon in SVG
- **File locations:**
  - `public/logo.svg` — Full logo (icon + wordmark + tagline)
  - `public/logo-mark.svg` — Icon only
  - `public/favicon.svg` — Icon as favicon

---

## 3. Page Inventory

| # | Route | Page | Status |
|---|-------|------|--------|
| 1 | `/` | Homepage | Existing |
| 2 | `/jobs` | Job Board | Existing |
| 3 | `/jobs/:id` | Job Detail | Existing |
| 4 | `/blog` | Blog Index | Existing |
| 5 | `/blog/:slug` | Blog Post | Existing |
| 6 | `/employers` | For Employers | Existing |
| 7 | `/login` | Login | **New** |
| 8 | `/signup` | Sign Up | **New** |
| 9 | `/forgot-password` | Forgot Password | **New** |
| 10 | `/reset-password` | Reset Password | **New** |
| 11 | `/about` | About Us | **New** |
| 12 | `/contact` | Contact | **New** |
| 13 | `/post-job` | Post a Job | **New** |
| 14 | `*` | 404 | Existing |

---

## 4. New Pages — Component Specs

### 4.1 Auth Components

All auth pages follow a centered card layout:
- Full viewport centering: `min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4`
- Auth card: `max-w-md w-full bg-surface-1 rounded-lg p-8`
- Logo link at top of card (centered or top-left)
- Title: h1 text-[28px] font-medium mb-1
- Subtitle: text-sm text-ink-muted mb-6
- Form fields: standard Input component, full width, mb-4
- Submit Button: variant="primary" size="lg" className="w-full"
- Footer links: text-sm text-ink-muted with accent links

#### LoginPage (`/login`)
- Email input, password input, "Remember me" checkbox
- "Forgot password?" link below password field
- Submit: "Sign in"
- Footer: "Don't have an account? Sign up" → /signup
- Link to /forgot-password

#### SignupPage (`/signup`)
- Name input, email input, password input, confirm password
- "I agree to the Terms of Service and Privacy Policy" checkbox
- Submit: "Create account"
- Footer: "Already have an account? Sign in" → /login
- Social auth buttons (Google, GitHub) with "or" divider above form

#### ForgotPasswordPage (`/forgot-password`)
- Brief description text: "Enter your email and we'll send you a reset link."
- Email input only
- Submit: "Send reset link"
- Success state: show confirmation message with email icon, "Check your email" heading, instructions text, "Resend" link
- Footer: "Back to sign in" → /login

#### ResetPasswordPage (`/reset-password`)
- New password input, confirm password input
- Password requirements hint: "At least 8 characters"
- Submit: "Reset password"
- Success: redirect to /login with message

### 4.2 About Page (`/about`)

#### AboutHero
- Section bg-canvas
- Container
- h1 text-[40px] md:text-[56px] "About HireHub Community"
- Subtitle text-lg text-ink-muted max-w-3xl
- Simple, typography-focused hero (no image)

#### AboutStory
- Section default
- Container
- Two-column grid: `md:grid-cols-2 gap-12`
- Left: h2 "Our story" + paragraphs about the platform
- Right: Stats list (metric items: "10K+ jobs posted", "500+ companies", "50K+ job seekers", "94% satisfaction")

#### AboutValues
- Section bg-canvas
- Container
- h2 text-[32px] text-center mb-12 "What we believe"
- 3-col grid of value cards (Icon + title + description)
- Values: Transparency, Community-first, Quality over quantity

### 4.3 Contact Page (`/contact`)

#### ContactInfo
- Section default
- Container
- Two-column grid: `md:grid-cols-2 gap-12`
- Left: Contact details with icons (Mail, Phone, MapPin)
  - Email: hello@hirehub.community
  - Location: San Francisco, CA
- Right: ContactForm

#### ContactForm
- Name, email, subject, message (textarea) fields
- Submit button "Send message"
- Success state: "Thanks for reaching out!" message

### 4.4 Post a Job Page (`/post-job`)

#### PostJobForm
- Section default
- Container max-w-2xl
- h1 "Post a Job"
- Info banner: "Fill out the form below to create a new job listing. It will be reviewed and published within 24 hours."
- Form fields:
  - Job title (text)
  - Company name (text)
  - Location (text)
  - Remote toggle (checkbox/switch)
  - Salary min (number)
  - Salary max (number)
  - Currency (select: USD, EUR, GBP)
  - Category (select: Engineering, Design, Marketing, Sales, Operations, Product, Support)
  - Seniority (select: Junior, Mid, Senior, Lead, Executive)
  - Tags (text input, comma-separated)
  - Description (textarea, full job description)
  - Requirements (textarea, one per line)
  - Responsibilities (textarea, one per line)
  - Application URL / email (text)
- Submit button "Submit job listing"
- Note: This is a static MVP — form submits to nowhere (UI only, no backend)

---

## 5. Data Model Updates

### Job (existing — updated)
```typescript
export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  remote: boolean;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  tags: string[];
  category: string;
  seniority: "junior" | "mid" | "senior" | "lead" | "executive" | "expert";
  description: string;
  requirements: string[];
  responsibilities: string[];
  postedDate: string;
  featured: boolean;
}
```

Add `"expert"` to the seniority union type.

### Company (existing — expanded)
Add all companies from `jobs.json` that are not already present:
- SonarSource, RSM US, Lowe's, TransUnion, Binance, Halter, Apex Fintech, Meology, etc.

---

## 6. Route Updates (App.tsx)

Add to existing Routes:
```typescript
<Route path="/login" element={<LoginPage />} />
<Route path="/signup" element={<SignupPage />} />
<Route path="/forgot-password" element={<ForgotPasswordPage />} />
<Route path="/reset-password" element={<ResetPasswordPage />} />
<Route path="/about" element={<AboutPage />} />
<Route path="/contact" element={<ContactPage />} />
<Route path="/post-job" element={<PostJobPage />} />
```

---

## 7. Navbar Updates

- Replace "HireHub" text logo with logo SVG
- Add "Sign In" link → /login (replace Button with Link)
- "Post a Job" Button → /post-job
- Add "About" to navLinks
- Mobile menu: same updates

## 8. Footer Updates

- Replace "HireHub" text with logo
- Update "About Us" link → /about
- "Contact" link → /contact
- Add "Post a Job" link under Company
