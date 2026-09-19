# Company Summary Reflects Job-Body Paragraph — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the "About the company" text in the job detail sidebar reflect the company-definition paragraph inside the job's own description when one exists, falling back to the curated brief.

**Architecture:** Add a pure `getCompanySummary(company, description)` helper exported from `JobBody.tsx` that scores each paragraph of the job description by language cues and returns the company-definition paragraph when its score is >= 3. `CompanySidebar.tsx` resolves the displayed description as: company paragraph → curated brief → generic fallback.

**Tech Stack:** React 19, TypeScript, Vitest (globals: true, jsdom), Testing Library.

## Global Constraints

- Match existing component style: single quotes, no semicolons, 2-space indent (see `JobBody.tsx`, `CompanySidebar.tsx`).
- Helper returns `string | undefined`; `undefined` means "no company paragraph, fall back".
- Detection thresholds are exact: cue scores are `+2` / `+1` / `-2` / `-1`; paragraph is used only if score `>= 3`.
- Spec: `docs/superpowers/specs/2026-09-19-company-summary-from-job-body-design.md`.
- Do not change `JobBody`'s "About this role" rendering, `companyBriefs.ts`, `JobDetailPage`, or the `Job` type.

---

### Task 1: Add `getCompanySummary` helper to JobBody.tsx with unit tests

**Files:**
- Modify: `src/components/jobs/JobBody.tsx` (add exported helper above the component)
- Test: `src/components/jobs/__tests__/JobBody.test.tsx`

**Interfaces:**
- Consumes: nothing (pure function; `Job` type already imported in the file).
- Produces: `getCompanySummary(company: string, description: string): string | undefined` — returns the company-definition paragraph when the best-scoring paragraph is >= 3, else `undefined`. Later task consumes this exact signature.

- [ ] **Step 1: Write the failing tests**

Create `src/components/jobs/__tests__/JobBody.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { getCompanySummary } from '../JobBody'

describe('getCompanySummary', () => {
  it('returns a paragraph that defines the company', () => {
    const description = 'Build and maintain the frontend.\n\nSonarSource is a leader in code quality and security solutions, trusted by thousands of organizations worldwide.\n\nRequirements below.'
    expect(getCompanySummary('SonarSource', description)).toBe(
      'SonarSource is a leader in code quality and security solutions, trusted by thousands of organizations worldwide.'
    )
  })

  it('accepts the possessive form of the company name', () => {
    const description = 'You will build systems.\n\nFidelity\'s technology teams power some of the most critical financial infrastructure in the world. Zero tolerance for errors.'
    expect(getCompanySummary('Fidelity Investments', description)).toBe(
      'Fidelity\'s technology teams power some of the most critical financial infrastructure in the world. Zero tolerance for errors.'
    )
  })

  it('rejects a recruitment opening that merely names the company', () => {
    const description = 'Linear is looking for a Junior Frontend Engineer to join our growing team. You will work alongside senior engineers.'
    expect(getCompanySummary('Linear', description)).toBeUndefined()
  })

  it('rejects "is seeking" recruitment phrasing', () => {
    const description = 'STERRY is seeking a creative Ad Graphic Designer to join our marketing team.'
    expect(getCompanySummary('STERRY', description)).toBeUndefined()
  })

  it('returns undefined when no paragraph scores above threshold', () => {
    const description = 'Lead product strategy.\n\nYou will drive customer engagement and retention through insights.'
    expect(getCompanySummary('TransUnion', description)).toBeUndefined()
  })

  it('returns undefined for an empty description', () => {
    expect(getCompanySummary('SonarSource', '')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/jobs/__tests__/JobBody.test.tsx`
Expected: FAIL — `getCompanySummary` is not exported from `../JobBody`.

- [ ] **Step 3: Write the minimal implementation**

Add to `src/components/jobs/JobBody.tsx`, above the `JobBodyProps` interface:

```tsx
const DEFINITIONAL_CUES = ['is a', 'is the', 'is building', 'is revolutionizing', 'creates', 'powers', "world's", 'in the world', 'is one of']
const RECRUITMENT_CUES = ['looking for', 'seeking', 'to join', "we're", 'we are']
const ROLE_FLUFF_CUES = ['this role', 'this is an', 'this is a', 'opportunity', 'ideal for']

function scoreCompanyParagraph(paragraph: string, company: string): number {
  const lower = paragraph.toLowerCase()
  const companyFirst = company.split(' ')[0].toLowerCase()
  let score = 0
  if (lower.startsWith(companyFirst) || lower.startsWith(`${companyFirst}'s`)) {
    score += 2
  }
  if (DEFINITIONAL_CUES.some((cue) => lower.includes(cue))) {
    score += 1
  }
  if (RECRUITMENT_CUES.some((cue) => lower.includes(cue))) {
    score -= 2
  }
  if (ROLE_FLUFF_CUES.some((cue) => lower.includes(cue))) {
    score -= 1
  }
  return score
}

export function getCompanySummary(company: string, description: string): string | undefined {
  const paragraphs = description
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean)
  let best: string | undefined
  let bestScore = 0
  for (const paragraph of paragraphs) {
    const score = scoreCompanyParagraph(paragraph, company)
    if (score > bestScore) {
      bestScore = score
      best = paragraph
    }
  }
  return bestScore >= 3 ? best : undefined
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/jobs/__tests__/JobBody.test.tsx`
Expected: PASS (all 6 tests).

- [ ] **Step 5: Lint and typecheck**

Run: `npm run lint`
Expected: PASS (no new errors in the two files).

- [ ] **Step 6: Commit**

```bash
git add src/components/jobs/JobBody.tsx src/components/jobs/__tests__/JobBody.test.tsx
git commit -m "feat(jobs): add getCompanySummary helper for company paragraphs"
```

---

### Task 2: Use `getCompanySummary` in CompanySidebar

**Files:**
- Modify: `src/components/jobs/CompanySidebar.tsx`

**Interfaces:**
- Consumes: `getCompanySummary(company: string, description: string): string | undefined` from Task 1.
- Produces: sidebar "About the company" text resolved as company paragraph → `brief.description` → generic fallback.

- [ ] **Step 1: Update the import**

In `src/components/jobs/CompanySidebar.tsx`, change the import on line 5:

```tsx
import { getCompanyBrief } from '../../data/companyBriefs'
```

to:

```tsx
import { getCompanyBrief } from '../../data/companyBriefs'
import { getCompanySummary } from './JobBody'
```

- [ ] **Step 2: Add the resolved description variable**

In `CompanySidebar` (after `const brief = getCompanyBrief(job.company)` on line 16), add:

```tsx
const companySummary =
  getCompanySummary(job.company, job.description) ??
  brief?.description ??
  'A leading company building innovative solutions.'
```

- [ ] **Step 3: Replace the description markup**

Replace the "About the company" block (lines 38-47):

```tsx
        <h2 className="text-lg font-medium mb-2">About the company</h2>
        {brief ? (
          <p className="text-sm text-ink-muted mb-6">
            {brief.description}
          </p>
        ) : (
          <p className="text-sm text-ink-muted mb-6">
            A leading company building innovative solutions.
          </p>
        )}
```

with:

```tsx
        <h2 className="text-lg font-medium mb-2">About the company</h2>
        <p className="text-sm text-ink-muted mb-6">
          {companySummary}
        </p>
```

- [ ] **Step 4: Run the jobs test suite**

Run: `npx vitest run src/components/jobs`
Expected: PASS (JobBoardPage, JobBoardPageSearch, JobDetailPage, JobBody suites).

- [ ] **Step 5: Lint and typecheck**

Run: `npm run lint`
Expected: PASS (no errors in `CompanySidebar.tsx`).

- [ ] **Step 6: Commit**

```bash
git add src/components/jobs/CompanySidebar.tsx
git commit -m "feat(jobs): sidebar about-text reflects job-body company paragraph"
```

---

## Self-Review

- **Spec coverage:** Detection rules (Task 1) exactly match spec §Detection cues and `>= 3` threshold; 5 target companies verified by prior dataset run. Fallback order (Task 2 step 2) matches spec §Behavior. File list matches spec §Files. Non-goals preserved (no `companyBriefs.ts`, no `JobBody` rendering change, no `JobDetailPage`/`Job` changes).
- **Placeholder scan:** All steps contain real code, exact paths, and expected outputs.
- **Type consistency:** `getCompanySummary` defined in Task 1 produces `string | undefined`; Task 2 consumes the exact same signature via `??` chaining. Helper and cue arrays are single-sourced in `JobBody.tsx`.