# Task 4 Report: Footer links

## What I implemented

Pointed the footer's placeholder `#` links at the real routes added in Tasks 1-3 (`/privacy`, `/terms`, `/cookies`, `/help`).

- `src/components/layout/Footer.tsx`: replaced the `resources` `Help Center` entry (`to: '#'` → `to: '/help'`) and the `company` array (grew from 5 to 7 entries): `Privacy Policy → /privacy`, plus new `Terms of Service → /terms` and `Cookie Policy → /cookies`. Exact code from the brief's Step 3.
- `src/components/layout/__tests__/Footer.test.tsx`: new test file, exact code from the brief's Step 1.
- The `jobs` array and `socialLinks` array were left untouched — the 3 social `href="#"` anchors remain.

## TDD Evidence

**RED** — `npx vitest run src/components/layout/__tests__/Footer.test.tsx`

```
FAIL  src/components/layout/__tests__/Footer.test.tsx > Footer > links the Help Center and legal pages to real routes
Error: expect(element).toHaveAttribute("href", "/help")
Expected the element to have attribute: href="/help"
Received: href="/"
...
Test Files  1 failed (1)
     Tests  1 failed | 1 passed (2)
```

Expected: `Help Center` had `href="#"` (rendered as `/` by MemoryRouter) and `Terms of Service`/`Cookie Policy` links did not exist. The second test (exactly 3 `#` links) passed, confirming the social links were the only hash anchors.

**GREEN** — `npx vitest run src/components/layout/__tests__/Footer.test.tsx`

```
Test Files  1 passed (1)
     Tests  2 passed (2)
```

## Files changed

- `src/components/layout/Footer.tsx` (modified, +4/−2)
- `src/components/layout/__tests__/Footer.test.tsx` (created)

## Verification (Step 5)

`npx tsc --noEmit && npx eslint src/components/layout && npx vitest run`

- tsc: clean
- eslint: clean (no output for `src/components/layout`)
- Full suite: 64 files / 254 tests passed (the "Not implemented: Window's scrollTo()" lines are pre-existing harmless jsdom stubs)

## Commit

```
965bb76 fix(footer): point help and legal links at real routes
```

Staged ONLY `src/components/layout/Footer.tsx` and `src/components/layout/__tests__/Footer.test.tsx`. The unrelated working-tree files (`.superpowers/sdd/*`, `public/logos/*`, `PricingSection.tsx`, `HeroSection.tsx`, plan docs) were left untouched and unstaged.

## Self-review

- Test implemented verbatim from brief (Step 1) — yes.
- `footerLinks` replacement verbatim (Step 3) — yes; `jobs`/`socialLinks` untouched, no comments added, `company` grew 5→7.
- Both Footer tests pass, full suite green, tsc clean, eslint clean.
- Commit message exactly `fix(footer): point help and legal links at real routes`, only the two task files staged.

## Issues or concerns

None.
