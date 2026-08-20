### Task 6.1 — editor UI

- Local draft type: `{ id: string; prompt: string; expectedKeywords: string; maxScore: number }`.
- Section (collapsed by default, visible under the description/requirements fields): heading "Screening questions (optional)", an "Add question" button, and one row per draft: prompt input, expected-keywords input (comma-separated, placeholder "e.g. python, fastapi"), maxScore number input (default 5, min 1, max 100), remove button.
- On submit, if drafts exist, append `screeningQuestions` to the payload: `drafts.map((d, i) => ({ prompt: d.prompt, expectedKeywords: d.expectedKeywords.split(',').map((s) => s.trim()).filter(Boolean), maxScore: Number(d.maxScore) || 5, order: i + 1 }))`.
- Keep all existing fields/validation/tests intact.

### Task 6.2 — tests `src/components/post-job/__tests__/PostJobFormScreening.test.tsx`

Adapt to the actual props (read the existing test file first):

```tsx
it('adds a screening question row and submits it in the payload', async () => {
  const onSubmit = vi.fn()
  render(<PostJobForm onSubmit={onSubmit} />)
  await userEvent.click(screen.getByRole('button', { name: /add screening question/i }))
  await userEvent.type(screen.getByLabelText(/question prompt/i), 'Years of Python?')
  await userEvent.type(screen.getByLabelText(/expected keywords/i), 'python, fastapi')
  await userEvent.click(screen.getByRole('button', { name: /submit job listing/i }))
  expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
    screeningQuestions: [expect.objectContaining({ prompt: 'Years of Python?', expectedKeywords: ['python', 'fastapi'], maxScore: 5 })],
  }))
})

it('removes a screening question row before submitting', async () => {
  // add two rows, remove one, submit, expect one question in the payload
})
```

Run frontend gates → green. Commit: `feat: screening question editor in job posting form`.

---

## M7 — ApplyJobForm dynamic screening answers

**File:** `src/components/apply/ApplyJobForm.tsx` (+ existing tests). Read it first to learn how the job is provided (`job` prop with `screeningQuestions`? or fetched).

