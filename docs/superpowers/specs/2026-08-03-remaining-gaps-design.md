# Remaining Frontend Gaps — Design Spec

## Overview

Five independent, small-to-medium frontend upgrades that close the outstanding `changes.md` items: the md-viewport sidebar should collapse to a logo-only rail with centered profile content, SkillInput should auto-detect a candidate's niche from a pasted job description, payment success should auto-navigate into the support chat, the chosen resume file should survive a modal close, and two new design-intelligence prompts (mobile dashboard 9:16 + neutral light/dark profile card) should be added to the visual-context docs.

References: `changes.md` lines 3, 7, 10, 11, 80, 87.

## Goals

1. Sidebar collapses to a centered logo mark at `md` when toggled; ProfilePage content is centered.
2. Pasting a job description / target role auto-selects the matching niche chip and suggests its skills.
3. Payment success navigates to the support chat automatically (button kept as fallback).
4. Selected-but-unsubmitted resume file persists across modal close/reopen.
5. Two new design prompts follow the existing visual-context format.

## Non-Goals

- Full dashboard mobile *code* responsiveness (`changes.md` line 12) — flagged as follow-up work.
- Job expiry sweep (deferred per user).
- Any backend changes.

## Constraints

- Existing dependencies only. Follow HireHub conventions: semantic color tokens (`bg-canvas`, `bg-surface-1/2`, `text-ink*`, `bg-accent`, `border-hairline`), `focus-visible:ring` on interactive elements, no new npm packages.
- Design prompts must match the exact format in `public/DESIGN-VISUAL-CONTEXT.md` (Subject / Environment / Narrative / Emotion / Lighting / Camera / Lens / Composition / Color palette / Rendering style / Aspect ratio / Negative + `**Component rules (from <file>.tsx):**`).
- Prompts are documentation artifacts only — no UI code changes for item 5.

---

## Item A: Sidebar logo-only collapse + centered profile content

### `src/components/layout/Sidebar.tsx` (logo block, lines 68–77)

When `collapsed`, render only the 40px orange logo mark (the `#ff5600` rounded square + H glyph), centered in the rail, instead of the full 220px wordmark that currently overflows `w-14`. When expanded, render the full existing SVG unchanged.

Implementation: extract the mark into a small inline SVG; branch on `collapsed`:
- collapsed → `<Link>` wrapping the mark, container `flex justify-center px-0`.
- expanded → existing markup unchanged.

Nav icons already center via `NavItem` (`justify-center px-0`) — no change there.

### `src/components/profile/ProfilePage.tsx` (line 133)

`<div className="max-w-2xl space-y-8">` → add `mx-auto w-full` so the column centers in the shell's padded main area.

## Item B: SkillInput auto-niche detection

### `src/data/skills.ts` — pure detection

Add `detectNiche(text: string): { niche: SkillNiche; matches: string[] }`:
- Tokenize/lowercase the pasted text.
- Score each non-general niche in `categoryData` by how many of its skill names (and a small alias map — e.g., "customer service", "csr", "support" → `office`, "frontend"/"backend"/"react" → `tech`) appear in the text.
- Pick the highest-scoring niche (`general` fallback).
- `matches` = up to 8 skills from that niche present in the text but not already in the user's selected set.

Add a small `NICHE_ALIASES: Record<string, SkillNiche>` for multi-word phrases the skill arrays don't cover.

### `src/components/onboarding/SeekerSkillsStep.tsx` — paste-to-detect

Above the niche picker, add a textarea "Paste the job description or target role you're aiming for" with a debounced (≈300ms) `onChange`:
- Runs `detectNiche`, auto-selects the detected niche chip (updates `niche` state so `SkillInput` suggestions follow it).
- Renders "Suggested from your description" — tappable chips of `matches` that call the same add-skill logic (dedupe + max 15). Nothing added silently.
- Empty/`general` detection → no suggestions row, manual picker unchanged.

### Test

New `src/data/skills.test.ts` (Vitest): "customer service" → `office`, a tech-heavy description → `tech`, gibberish → `general`, matches exclude already-selected skills.

## Item C: Payment → chat auto-navigate

### `src/components/employers/PaymentModal.tsx`

In `handleSubmit` (lines 39–52), after `setSuccess(true)`:
- `window.setTimeout(() => onPaid(conversationId), 1200)` so the success screen is briefly visible.
- Track the timer in a ref; clear it in a `useEffect` cleanup on unmount.
- Guard against double-fire: a `navigating` ref set inside the timeout callback; the success screen's "Start chatting…" button (line 141) stays as fallback and is disabled once `navigating` is true.

No change to `PricingSection.tsx`'s `handlePaid` (already navigates to `?tab=messages&conv=<id>`).

## Item D: Resume file survives modal close

### `src/components/apply/ApplyJobModal.tsx` + `ApplyJobForm.tsx`

- Lift `resumeFile` / `resumeFileName` state up to `ApplyJobModal` (pass values + setters into `ApplyJobForm` as props). Closing the modal no longer unmounts that state.
- On `handleSuccess` (post-submit, line 21–24): reset the lifted state so the next application starts fresh.
- `ApplyJobForm` keeps its in-form behavior (failed submit preserves the file, `handleClearFile` still works). Cover-letter-only path (`coverOnly`) unaffected.
- `ApplySuccess`/`ApplyLanding` display of `Resume attached: {resumeFileName}` unchanged.

## Item E: Design prompts

### `public/DESIGN-VISUAL-CONTEXT.md` (+ root `DESIGN-VISUAL-CONTEXT-ADDED.md`)

Append two sections in the established format:

1. **`## Section: Dashboard Mobile (9:16)`** — a mobile dashboard/overview hero image prompt. `**Component rules (from DashboardShell.tsx / OverviewTab.tsx):**` listing `bg-canvas`, `bg-surface-1`, `text-ink`, `bg-accent` (#ff5600), `border-hairline`, tinted stat-card icons, `/overview-grid-bg.svg`. Aspect ratio 9:16, negative inherits from the primary dashboard prompt.

2. **`## Section: Dashboard Profile Card (Light / Dark)`** — one neutral professional subject with two variants (light-mode neutral, dark-mode neutral) sharing the same scene so it reads in both themes. `**Component rules (from OverviewTab.tsx):**` derived from the card markup (avatar/name/headline/location, 4-column detail grid, skill chips, resume row).

Update `## Priority Generation Order` if present to include the new sections.

---

## Error handling

- Detection: pure function, no async/errors. Empty input → `{ niche: 'general', matches: [] }`.
- Auto-navigate timer cleared on unmount; navigation guarded to once.
- Lifted resume state is plain React state — no persistence layer; cleared on successful submit.

## Testing

- Vitest: `detectNiche` cases (Item B).
- Manual: toggle sidebar collapse at md width (logo-only rail) and check ProfilePage centering; paste a description in onboarding; complete a demo payment (auto-nav within ~1.2s); pick a resume, close/reopen modal (file persists), submit (state clears).
- Lint + build both apps.

---

## File map

- `src/components/layout/Sidebar.tsx`
- `src/components/profile/ProfilePage.tsx`
- `src/data/skills.ts` (+ `src/data/skills.test.ts`)
- `src/components/onboarding/SeekerSkillsStep.tsx`
- `src/components/employers/PaymentModal.tsx`
- `src/components/apply/ApplyJobModal.tsx`, `ApplyJobForm.tsx`
- `public/DESIGN-VISUAL-CONTEXT.md`, `DESIGN-VISUAL-CONTEXT-ADDED.md`
