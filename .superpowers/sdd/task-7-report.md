# Task M7 — collect screening answers on the application form

Commit: `3ae132d` `feat: collect screening answers on application form`

## Task 7.2 — tests (written first, ran red)

New file `src/components/apply/__tests__/ApplyJobFormScreening.test.tsx`.

Adapted the brief's test to the real submit path. The brief's snippet assumed `onSubmit`/`onClose` props and expected the submit handler to receive the payload; the real `ApplyJobForm` props are `job`/`onSuccess`/`resumeFile`/`resumeFileName`/`onResumeChange`, and submission goes through a dynamic import of `createApplication` (internal API call) then `onSuccess(resumeFileName?)`. Adaptations:

- Mock `createApplication` from `../../../api/applications` and assert it was called with `expect.objectContaining({ screeningAnswers: [{ questionId: 'q1', answerText: 'Five years' }] })` (keeps the exact core assertion of the brief).
- Mock `useApp` from `AppContext` with a resume-on-file seeker (cover-letter-only mode), so name/email/resume fields are hidden and the form stays focused on cover letter + screening answers.
- `onSuccess` is asserted to have been called (fires after the API resolves).
- Filled the cover letter (≥50 chars per `applicationSchema`) since RHF validation otherwise blocks submit.
- `job` built as `{ ...jobs[0], screeningQuestions: [...] }`.

Ran it red before implementation (missing label `Years of Python?`). Passed green after implementation.

## Task 7.1 — implementation

`src/components/apply/ApplyJobForm.tsx`:

- `const screeningQuestions = job.screeningQuestions ?? []`.
- State `answers: Record<string, string>` + `answerErrors: Record<string, string>` (validation errors per question).
- If `screeningQuestions.length > 0`, renders one `Textarea` per question under the cover letter: `label` = question prompt, `id="screening-<id>"`, `rows={4}`, `required`, shows per-question `error` when unanswered; typing clears that question's error.
- `onSubmit` validates each answered (trim) before proceeding; on failure sets `answerErrors` and returns.
- `createApplication` payload includes `screeningAnswers: screeningQuestions.map((q) => ({ questionId: q.id, answerText: answers[q.id] ?? '' }))` only when questions exist (spread conditionally).

`src/data/jobs.ts`:

- `Job` interface gained optional `screeningQuestions?: { id; prompt; expectedKeywords: string[]; maxScore: number; order: number }[]`, matching the brief's shape. `api/types.ts` re-exports this `Job`, so the single source of truth type-checks for both data and API layers (no closed-union conflict to reconcile with 5.1).

`src/api/applications.ts` already accepted `screeningAnswers?: { questionId; answerText }[]` on `createApplication` — no change needed there.

## Gates

| Gate | Result |
|------|--------|
| `npm run test:run` | ✅ 70 files / 284 tests passed |
| `npm run lint` | ✅ clean |
| `npm run build` | ✅ `tsc -b && vite build` succeeded |

## Files changed

- `src/components/apply/ApplyJobForm.tsx` (modified)
- `src/components/apply/__tests__/ApplyJobFormScreening.test.tsx` (new)
- `src/data/jobs.ts` (modified)

Verified via `git status`: only these three files staged; nothing under `.superpowers/` staged or committed.

## Self-review findings

- Existing `ApplyJobForm.test.tsx` still green (2 files, 5 tests).
- Payload mapping exact per brief (`questionId`/`answerText`, one entry per question).
- Validation blocks submit with unanswered questions; native `required` also present for a11y/UX.
- Lint/build/test all green before commit.
- Single commit `3ae132d` with the exact required message.

## Concerns / adaptations vs the brief

1. The brief's test assumed `onSubmit`/`onClose` props and `onSubmit` receiving the apply payload; real component uses internal API call + `onSuccess`. Test was adapted to assert on the mocked `createApplication` payload instead (core `screeningAnswers` assertion preserved verbatim).
2. Cover letter must be filled in the test because the real schema requires ≥50 chars.
3. `screeningAnswers` is included in the payload only when the job has screening questions (per brief's `if length > 0` gating); jobs without questions send an unchanged payload.
