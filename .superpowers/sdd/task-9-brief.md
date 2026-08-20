### Task 9.1 — screening + timeline sections

- If `application.screeningResult`: render a "Screening" section — score bar `score / maxPossible`, and each `screeningAnswers` row with question prompt, answer text, per-answer score.
- If `application.timeline?.length`: render a "Timeline" section — chronological steps `fromStatus → toStatus` with actor + relative/absolute date (reuse existing date formatting used in the drawer).
- Update the status buttons to use `STATUS_CONFIG` labels and to hide buttons when `canTransition(application.status, candidate)` is false.

### Task 9.2 — tests `src/components/candidate/__tests__/CandidateDetailDrawerScreening.test.tsx`

Render the drawer with an application that has `screeningResult`, one `screeningAnswer`, and 2 timeline entries; assert the prompt, answer text, score text, and both timeline labels appear. Run frontend gates → green. Commit: `feat: show screening scores and status timeline in candidate drawer`.

---

## M10 — Realtime pipeline stream

**Files:** `src/context/NotificationsContext.tsx` (read first — it already owns the `EventSource` for `/notifications/stream` and forwards `notification` and `new-message` events), `src/hooks/usePipelineStream.ts` (new), `src/components/employer-dashboard/PipelineTab.tsx` (wire).

