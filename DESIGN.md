---
name: HireHub
description: Job board and hiring platform — warm, professional, accessible
colors:
  canvas: "#f5f1ec"
  ink: "#111111"
  ink-muted: "#626260"
  ink-subtle: "#9c9fa5"
  ink-tertiary: "#b0b3b8"
  surface: "#ffffff"
  surface-2: "#ebe7e1"
  hairline: "#d3cec6"
  hairline-soft: "#ebe7e1"
  accent: "#ff5600"
  success: "#2e7d32"
  error: "#c41c1c"
  warning: "#ed6c02"
  info: "#0288d1"
  inverse-canvas: "#000000"
  inverse-surface: "#313130"
  inverse-ink: "#ffffff"
  brand-blue: "#0007cb"
darkMode:
  strategy: "data-attribute"
  selector: '[data-theme="dark"]'
  tokens:
    canvas: "#0f0f0f"
    ink: "#e8e8e8"
    ink-muted: "#999999"
    ink-subtle: "#7b7b78"
    ink-tertiary: "#6b6b68"
    surface: "#1a1a1a"
    surface-2: "#242424"
    hairline: "#333333"
    hairline-soft: "#2a2a2a"
    accent: "#ff7a3d"
    success: "#4caf50"
    error: "#ef5350"
    warning: "#ff9800"
    info: "#29b6f6"
typography:
  sans:
    fontFamily: "Inter, system-ui, sans-serif"
    weights: [400, 500]
  mono:
    fontFamily: "JetBrains Mono, monospace"
    weights: [400]
layout:
  container: "max-w-7xl mx-auto px-4 md:px-6 lg:px-8"
  sectionPadding: "py-24"
  grid:
    responsive: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
borderRadius:
  md: "8px"
  lg: "12px"
  xl: "16px"
  pill: "9999px"
components:
  button:
    variants:
      primary:
        light: "bg-ink text-white hover:bg-red/30"
        dark: "dark:bg-white dark:text-accent dark:hover:bg-black"
        usage: "Primary actions: form submissions, CTAs, navigation"
      secondary:
        light: "bg-surface-2 text-ink hover:bg-hairline"
        dark: "Inherits from CSS tokens"
        usage: "Secondary/supporting actions, social auth buttons"
      accent:
        light: "bg-accent text-white hover:bg-[#e04d00]"
        dark: "dark:hover:bg-[#e06000]"
        usage: "High-emphasis CTAs: Apply Now, pricing, close dismissals"
      ghost:
        light: "bg-transparent text-ink-muted hover:text-ink hover:bg-surface-2"
        dark: "Inherits from CSS tokens"
        usage: "Low-emphasis: Sign In in navbar, cancel, try again"
    sizes:
      sm: "px-3 py-1.5 text-sm"
      md: "px-4 py-2 text-[15px]"
      lg: "px-6 py-3 text-base"
    baseStyles: "rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
    disabled: "opacity-50 cursor-not-allowed"
    motion: "whileTap={{ scale: 0.96 }} with useReducedMotion() guard"
    type: "type defaults to 'button' (prevents accidental form submits)"
  input:
    baseStyles: "w-full px-3 py-2.5 rounded-md border bg-surface-1 text-ink placeholder:text-ink-tertiary outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ink/40"
    errorStyles: "border-error focus-visible:border-error"
    normalStyles: "border-hairline focus-visible:border-ink"
    accessibility: "aria-describedby for errors, aria-invalid, auto-generated id from label"
  textarea:
    extends: "Input"
    extra: "resize-y"
  card:
    variants:
      default: "rounded-lg"
      feature: "rounded-lg p-6"
      testimonial: "rounded-lg p-8"
      pricing: "rounded-xl p-8"
    baseStyles: "bg-surface-1"
    featured: "bg-ink text-inverse-ink"
    border: "border border-hairline (no box-shadow)"
  tag:
    baseStyles: "inline-flex items-center px-2.5 py-0.5 rounded-pill text-sm font-medium"
    variants:
      default: "bg-surface-2 text-ink-muted"
      category: "bg-accent/10 text-accent"
      location: "bg-info/10 text-info"
      seniority:
        junior: "text-success"
        mid: "text-accent"
        senior/lead: "text-ink-muted"
        executive: "text-error"
  tabs:
    style: "underline indicator"
    list: "border-b border-hairline"
    active: "border-ink text-ink"
    inactive: "border-transparent text-ink-muted hover:text-ink hover:border-ink/30"
    accessibility: "role=tablist, role=tab, role=tabpanel, arrow key navigation"
  toast:
    position: "fixed bottom-6 right-6 z-[9998]"
    baseStyles: "rounded-[10px] shadow-lg border border-hairline bg-surface-1"
    types: "success, error, info"
    dismiss: "Auto-dismiss after 4000ms"
    motion: "AnimatePresence for enter/exit"
  section:
    variants:
      default: "bg-canvas py-24"
      inverse: "bg-inverse-canvas text-inverse-ink py-24"
  container:
    baseStyles: "max-w-7xl mx-auto px-4 md:px-6 lg:px-8"
  skeleton:
    baseStyles: "animate-pulse bg-surface-2"
    variants: "text, circular, rectangular"
  emptyState:
    baseStyles: "centered layout py-16"
    icon: "text-ink-tertiary"
    action: "accent Button"
    motion: "framer-motion fade-in"
  errorState:
    baseStyles: "centered layout py-16"
    message: "text-error"
    action: "primary Button (try again)"
    motion: "framer-motion fade-in"
conventions:
  naming: "PascalCase files, named exports (not default) for UI components"
  classComposition: "String concatenation with ternaries (no cn() or clsx())"
  className: "Always optional string, appended at end of base classes"
  animation: "All via framer-motion, all check useReducedMotion()"
  accessibility:
    focusVisible: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
    ariaLabel: "Required on icon-only buttons"
    roleAlert: "On error messages"
    ariaHidden: "On decorative elements"
    skipLink: "Skip-to-content in Layout"
    reducedMotion: "Global prefers-reduced-motion in index.css + per-component useReducedMotion()"
  shadows: "Minimal — cards use border, not box-shadow"
  backdropBlur: "Used on floating surfaces: bg-surface-1/80 backdrop-blur-sm"
  breakpoints: "sm:640px md:768px lg:1024px xl:1280px 2xl:1536px"
consistencyRules:
  - "Never hardcode colors — always use CSS custom property tokens via Tailwind"
  - "All interactive elements must have focus-visible ring"
  - "All animations must respect prefers-reduced-motion"
  - "Button type defaults to 'button' unless explicitly 'submit' or 'reset'"
  - "No box-shadow on cards — use border border-hairline"
  - "Dark mode via data-theme attribute, not Tailwind dark: prefix (except Button primary variant)"
  - "Max 2 font weights per page (Inter 400 + 500)"
  - "Border radius from the scale: md=8px, lg=12px, xl=16px, pill=9999px"
  - "Disabled state: opacity-50 cursor-not-allowed"
  - "Form inputs: always include label, aria-describedby for errors"
---

# HireHub Design System

## Overview

HireHub is a job board and hiring platform with a warm, professional, accessible design. The design language is clean and minimal with a warm neutral canvas (`#f5f1ec`) and orange accent (`#ff5600`).

## Color Philosophy

The palette uses warm neutrals (not pure grays) for a human, approachable feel. The accent is a warm orange that conveys energy and action. Dark mode shifts the accent lighter (`#ff7a3d`) for contrast.

**Key principle:** Colors flow through CSS custom properties → Tailwind config → component classes. Never hardcode hex values in components.

## Component Conventions

### Button
- 4 variants: `primary`, `secondary`, `accent`, `ghost`
- 3 sizes: `sm`, `md`, `lg`
- Extends `motion.button` for press animation
- `type` defaults to `'button'` (safe default)
- Disabled: `opacity-50 cursor-not-allowed`
- Primary variant inverts in dark mode (dark bg → light bg)

### Form Inputs
- Always paired with a `<label>` (auto-generated id from label text)
- Error state uses `aria-describedby` and `aria-invalid`
- Base: `border-hairline`, focus: `border-ink`, error: `border-error`

### Cards
- No box-shadow — use `border border-hairline`
- Featured cards invert: `bg-ink text-inverse-ink`

### Tabs
- Underline-style with keyboard navigation (arrow keys, Home, End)
- Fully accessible with ARIA roles

### Toast
- Fixed bottom-right, auto-dismiss 4s
- AnimatePresence for smooth enter/exit

## Animation Rules

- All animation via framer-motion
- Tap feedback: `whileTap={{ scale: 0.96 }}`
- Scroll reveal: `whileInView` with `opacity: 0, y: 24` → `opacity: 1, y: 0`
- Duration: 0.45s easeOut for reveals
- Respect `useReducedMotion()` — disable animations when true

## Accessibility Requirements

- WCAG AA compliance
- Focus-visible ring on all interactive elements
- `aria-label` on icon-only buttons
- `role="alert"` on error messages
- `aria-hidden="true"` on decorative elements
- Skip-to-content link in layout
- Keyboard navigation on tabs
