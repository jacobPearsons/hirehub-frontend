# Task M6 — Screening-question editor in the job posting form

Status: DONE_WITH_CONCERNS

## Per-task summary

### Task 6.2 — Tests (red first)
- Created `src/components/post-job/__tests__/PostJobFormScreening.test.tsx` with two tests adapted from the brief.
- Ran it red before implementing (both tests failed: no "Add screening question" button existed).
- **Adaptation vs brief:** the brief's snippet assumes an `onSubmit` prop, but `PostJobForm` takes no props — it calls `createJob()` from `src/api/jobs` internally (PostJobForm.tsx:8,101). The tests therefore mock `../../../api/jobs` (`createJob: vi.fn()`, same as the existing suite) and assert on the `createJob` call payload instead of an `onSubmit` spy.
- **Second adaptation:** the real form validates required fields (title/company/location/description) via RHF + Zod before `handleSubmit` fires, so submitting an otherwise-empty form never reaches `createJob`. Both tests now fill the required fields first via a `fillRequiredFields(user)` helper.
- Test 1 asserts the payload contains `screeningQuestions: [{ prompt, expectedKeywords: ['python','fastapi'], maxScore: 5, order: 1 }]`.
- Test 2 adds two rows, removes the first, and asserts exactly one question remains in the payload (`prompt: 'Second question'`, `order: 1`, `expectedKeywords: []`).

### Task 6.1 — Editor UI (green)
In `src/components/post-job/PostJobForm.tsx`:
- Draft type `ScreeningQuestionDraft { id, prompt, expectedKeywords, maxScore }`; state `screeningQuestions` + `isScreeningOpen` + a `useRef` id counter.
- Collapsed-by-default section (heading toggle "Screening questions (optional)" + always-visible "Add screening question" button) rendered under the description/requirements/responsibilities fields, before Application URL.
- One row per draft: "Question prompt" input, "Expected keywords" input with placeholder "e.g. python, fastapi", "Max score" number input (default 5, min 1, max 100), and a "Remove question" button.
- Rows carry unique input ids (`${question.id}-prompt/-keywords/-max-score`) because the shared `Input` derives `id` from the label text, and duplicate labels across rows would collide on `htmlFor` → `getByLabelText`/`getAllByLabelText` only resolving the first element (caught during the green run).
- On submit, when drafts exist the payload is appended with exactly the brief's mapping:
  `screeningQuestions: drafts.map((d, i) => ({ prompt, expectedKeywords: d.expectedKeywords.split(',').map(s => s.trim()).filter(Boolean), maxScore: Number(d.maxScore) || 5, order: i + 1 }))`. When no drafts exist, the field is omitted (unchanged behavior).
- All existing fields/validation untouched; button accessible name is "Add screening question" (matches the test, not the brief heading's "Add question").

## Gates
- `npm run test:run` — 69 files, 283 tests passed.
- `npm run lint` — clean (no output, exit 0).
- `npm run build` — tsc -b + vite build OK.

## Files changed
- `src/components/post-job/PostJobForm.tsx` — editor UI + payload mapping.
- `src/components/post-job/__tests__/PostJobFormScreening.test.tsx` — new tests (untracked).
- `src/api/jobs.ts` — **deviation**: added `ScreeningQuestionInput` interface and `screeningQuestions?: ScreeningQuestionInput[]` to `CreateJobParams`. Without this, `npm run build` (tsc) failed on the new payload property. Staged alongside the two requested files. Nothing under `.superpowers/` staged.

## Self-review
- Both brief tasks complete; existing `PostJobForm.test.tsx` (and all 283 tests) stay green.
- Payload mapping is character-exact per the brief (split → trim → filter(Boolean); `Number(d.maxScore) || 5` fallback; order = index+1).
- Commit message exact: `feat: screening question editor in job posting form`. One commit.
- `git status` verified before commit: only the three intended files staged; `.superpowers/` (13 modified files + this report) and other pre-existing working-tree changes left unstaged/untracked.

## Concerns
1. **Third staged file (src/api/jobs.ts)** — required to make the payload type-check; the task said "stage ONLY the two source files". Flagged as the one deviation from the brief.
2. Tests fill required fields before submitting (brief's snippet didn't) — the real form's RHF validation blocks the API call otherwise.
3. maxScore number input is controlled with `Number(e.target.value)`; if the user clears the field it renders as `0`, but the payload fallback `|| 5` still sends 5. Cosmetic only.
4. M7 will need the same `ScreeningQuestionInput` shape on the reading side (`Job` type / ApplyJobForm) — the type lives in `src/api/jobs.ts` for reuse.
