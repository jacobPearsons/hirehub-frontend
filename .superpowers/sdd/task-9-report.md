# Task M9 Report — screening scores + status timeline in candidate drawer

**Status:** DONE
**Commit:** `d85177f` — `feat: show screening scores and status timeline in candidate drawer`

## Per-task summary

### 9.2 (tests — written first, red)
Created `src/components/candidate/__tests__/CandidateDetailDrawerScreening.test.tsx`. Renders the drawer with an application carrying:
- `screeningResult { score: 8, maxPossible: 10 }`
- one `screeningAnswer` with `question.prompt`, `answerText`, `score: 8`
- 2 timeline entries (null→applied/SEEKER and applied→screening/EMPLOYER)

Asserts: section titles "Screening" and "Timeline", overall score "8 / 10", per-answer prompt, answer text and "8 pts", both timeline step labels ("Submitted → Applied", "Applied → Screening"), both actors ("Seeker", "Employer"), and both dates ("Jul 1, 2026", "Jul 2, 2026").
Ran red first (failed on missing "Screening" text) → green after implementation.

### 9.1 (implementation)
`src/components/candidate/CandidateDetailDrawer.tsx`:
- **Screening section** rendered when `screeningResult` exists: header row `score / maxPossible` plus a progress bar (`h-1.5 rounded-full bg-surface-2` / `bg-accent`, mirroring `OnboardingProgress.tsx`), followed by one card per `screeningAnswer` with prompt (falls back to `questionId`), answer text, and per-answer `{score} pts`.
- **Timeline section** rendered when `timeline?.length > 0`: entries sorted chronologically ascending by `createdAt`, each showing `{fromLabel} → {toLabel}` using `STATUS_CONFIG` labels (null `fromStatus` → "Submitted"), prettified `actorRole` ("Seeker"/"Employer"), and date via the repo-standard `formatDate` util (`src/utils/date.ts`).
- **Status buttons**: now gated by `canTransition(application.status, target)` (screening/interviewing/offer/rejected) instead of `status !== X`, and the two direct status-change buttons use `STATUS_CONFIG` labels ("Move to Screening", "Move to Rejected"). "Schedule Interview"/"Make offer" keep their existing labels but are hidden when the transition isn't allowed.

## Gates
- `npm run test:run` → 73 files, 301 tests passed (incl. 2 drawer suites, 4 tests)
- `npm run lint` → clean (no output, exit 0)
- `npm run build` → tsc + vite build succeeded

## Files changed
- `src/components/candidate/CandidateDetailDrawer.tsx` (+85 / −8)
- `src/components/candidate/__tests__/CandidateDetailDrawerScreening.test.tsx` (new)

Only these two files staged and committed; `.superpowers/` and all pre-existing dirty files (JobBoardPage.tsx, useJobs.ts, api/types.ts, PricingSection.tsx, HeroSection.tsx, JobBoardPageSearch.test.tsx, etc.) left untouched.

## Self-review
- Both sub-tasks complete; single commit with exact message.
- Existing `CandidateDetailDrawer.test.tsx` (3 tests) still green.
- No `.superpowers/` or WIP files staged (verified `git status` before commit; commit stat shows only the 2 files).
- Timeline sorted chronologically (oldest first) via explicit `[...timeline].sort(...)`.
- Score bar clamps 0–100% and guards `maxPossible === 0`.

## Concerns / adaptations vs brief
- **Date timezone flake**: the brief's illustrative timeline dates at `00:00:00Z` shift a day in EDT (this machine is America/New_York), so `formatDate` produced e.g. "Jun 30, 2026". The test uses `T12:00:00Z` midday timestamps to be timezone-stable; dates near midnight in real data will display local time (consistent with `formatDate` used across the app).
- **`candidateStatus` in the brief** interpreted as the target status for each action button (`canTransition(application.status, 'screening')` etc.).
- **null `fromStatus`** (application-created entry, per API mapping in `applications.test.ts`) renders as "Submitted".
- Drawer has no pre-existing progress-bar or date formatting of its own, so the score bar reuses the `OnboardingProgress` styling pattern and dates use the shared `formatDate` util (the closest repo-standard date formatter).
- Changing the "Mark reviewing" label to "Move to Screening" and gating on `canTransition` is a behavior change: from `applied`, "Schedule Interview"/"Make offer" are now hidden (previously always shown when status differed). This matches the allowed-transition flow and the brief's explicit instruction; no existing test asserted their presence.

Report path: `.superpowers/sdd/task-9-report.md`
