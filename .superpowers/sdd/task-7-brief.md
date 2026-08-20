### Task 7.1 — dynamic questions

- If the job has `screeningQuestions.length > 0`, render one labeled Textarea per question under the cover letter (`aria-label`/label = question prompt, `required`).
- State: `answers: Record<string, string>`; validate each answered before submit.
- On submit, include `screeningAnswers: questions.map((q) => ({ questionId: q.id, answerText: answers[q.id] ?? '' }))` in the apply payload.
- `src/data/jobs.ts` `Job` interface: add `screeningQuestions?: { id: string; prompt: string; expectedKeywords: string[]; maxScore: number; order: number }[]` so `mockJobs` and seeded jobs type-check. (If `Job` is a closed union from the API types, reconcile with 5.1.)

### Task 7.2 — tests `src/components/apply/__tests__/ApplyJobFormScreening.test.tsx`

```tsx
it('renders one answer field per screening question and submits answers', async () => {
  const onSubmit = vi.fn()
  const job = { ...mockJob, screeningQuestions: [
    { id: 'q1', prompt: 'Years of Python?', expectedKeywords: ['python'], maxScore: 10, order: 1 },
  ] }
  render(<ApplyJobForm job={job} onSuccess={onSubmit} onClose={vi.fn()} />)
  await userEvent.type(screen.getByLabelText('Years of Python?'), 'Five years')
  await userEvent.click(screen.getByRole('button', { name: /submit application/i }))
  expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
    screeningAnswers: [{ questionId: 'q1', answerText: 'Five years' }],
  }))
})
```

Run frontend gates → green. Commit: `feat: collect screening answers on application form`.

---

## M8 — PipelineTab Kanban

**New file:** `src/components/employer-dashboard/PipelineTab.tsx` + `src/utils/kanban.ts`. Requires `@dnd-kit/core` (+ `@dnd-kit/utilities`); confirm they are in `package.json` (or install `@dnd-kit/core` before starting).

