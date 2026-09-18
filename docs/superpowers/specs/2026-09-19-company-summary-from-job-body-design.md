# Design: Company summary reflects the job-body company paragraph

**Date:** 2026-09-19
**Status:** Approved

## Goal

Make the "About the company" text in the job detail sidebar (`brief.description`)
reflect the paragraph inside the job's own description that pitches the company.
When the job body contains a genuine company-definition paragraph, the sidebar
shows the same paragraph instead of the curated brief text.

## Background

- `JobBody.tsx` renders `job.description` split on `\n\n`. The later paragraphs
  sometimes contain a company pitch (e.g. SonarSource: *"SonarSource is a leader
  in code quality and security solutions…"*), but for most jobs they are
  recruitment or role-fluff text.
- `CompanySidebar.tsx` shows `brief.description` from `companyBriefs.ts` under
  "About the company", falling back to the generic string *"A leading company
  building innovative solutions."* when no brief exists (e.g. `Arc.dev Partner`).
- The two texts currently differ even for jobs whose body contains a company
  paragraph. This change makes the sidebar mirror the job body when possible.

## Behavior

The "About the company" text in `CompanySidebar` resolves in this order:

1. The detected company paragraph from `job.description` (see detection), if any.
2. Otherwise the curated `brief.description` from `companyBriefs.ts`.
3. Otherwise the existing generic fallback string.

`JobBody`'s "About this role" section continues to render every paragraph of
`job.description` unchanged; the company paragraph remains visible in the body
as well as the sidebar.

## Detection

A small pure function `getCompanySummary(company, description)` scores each
paragraph of the description:

- Split `description` on blank lines into paragraphs.
- Score each paragraph:
  - `+2` paragraph starts with the company name, or its possessive form
    (e.g. "Fidelity's").
  - `+1` contains a definitional cue: "is a", "is the", "is building",
    "is revolutionizing", "creates", "powers", "world's".
  - `−2` contains a recruitment cue: "looking for", "seeking", "to join",
    "we're", "we are".
  - `−1` contains a role-fluff cue: "this role", "this is an", "this is a",
    "opportunity", "ideal for".
- Return the highest-scoring paragraph if its score is `>= 3`, otherwise
  `undefined` (caller falls back).

This was validated against all 32 jobs in `src/data/jobs.ts`:
- Genuine company paragraphs detected: SonarSource (job-001), Fidelity
  Investments (job-006), Halter (job-010), Flusi (job-014), EVI (job-015).
- Recruitment-openings that start with the company name ("Linear is looking
  for…", "STERRY is seeking…") score below the threshold and correctly fall
  back to the curated brief.
- Jobs with no company paragraph fall back to the curated brief; `Arc.dev
  Partner` (no brief) falls back to the generic string.

## Files

- `src/components/jobs/JobBody.tsx` — add exported `getCompanySummary(company,
  description)` helper.
- `src/components/jobs/CompanySidebar.tsx` — resolve the displayed description
  with the helper (company paragraph → brief → generic fallback).
- `src/components/jobs/__tests__/JobBody.test.tsx` — new unit tests for
  `getCompanySummary`: definitional paragraphs return the paragraph, recruitment
  openings return `undefined`, threshold/score boundary cases.

## Non-goals

- No changes to `companyBriefs.ts` data (unless a brief is needed later).
- No removal of the company paragraph from the job body.
- No change to `JobDetailPage` props or data flow.