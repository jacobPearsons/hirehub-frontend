# Remaining Frontend Gaps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the five remaining `changes.md` frontend gaps: sidebar logo-only collapse + centered profile content, SkillInput auto-niche detection, payment→chat auto-navigate, resume file persisting across modal close, and two new design prompts.

**Architecture:** Five independent, small frontend-only changes following the approved `docs/superpowers/specs/2026-08-03-remaining-gaps-design.md`. A pure `detectNiche` function in `src/data/skills.ts` (unit-tested, no I/O) feeds a paste-to-detect textarea in `SeekerSkillsStep`; `PaymentModal` gains a guarded 1.2s auto-nav timer; the resume file state lifts from `ApplyJobForm` into `ApplyJobModal`; the sidebar logo block branches on `collapsed`; two design-prompt sections are appended to the visual-context docs. No backend changes, no new packages.

**Tech Stack:** React 19 + TypeScript 6 (Vite 8), react-hook-form, Radix Dialog, framer-motion, Vitest 4 + Testing Library, Tailwind v4-style token classes.

## Global Constraints

- No new npm dependencies. Use existing HireHub conventions: semantic tokens (`bg-canvas`, `bg-surface-1/2`, `text-ink*`, `bg-accent`, `border-hairline`), `focus-visible:ring` on all interactive elements, `rounded-pill` chips.
- Work in `/home/jacobp/Desktop/Projecs/hirehub-frontend`. Commands: tests `npm run test:run -- <file>`, lint `npm run lint`, build `npm run build`, full suite `npm run test:run`.
- **Git discipline:** the working tree contains pre-existing uncommitted agent artifacts (`.superpowers/sdd/*`, `docs/superpowers/plans/*`, `errors.md`, `public/new/`). NEVER run `git add -A`/`git add .`; only `git add` the exact files each task lists, then `git commit -m "..."`.
- Design prompts must match the exact format in `public/DESIGN-VISUAL-CONTEXT.md` (Subject / Environment / Narrative / Emotion / Lighting / Camera / Lens / Composition / Color palette / Rendering style / Aspect ratio / Negative + `**Component rules (from <file>.tsx):**`). Prompts are documentation artifacts only — no UI code.
- Auto-navigate timer must be cleared on unmount and guarded against double-fire.
- Detection is a pure function: empty/gibberish input → `{ niche: 'general', matches: [] }`, nothing added to the user's skills silently.

---

## File Structure

| File | Change | Responsibility |
|------|--------|----------------|
| `src/components/layout/Sidebar.tsx` | Modify | Logo block branches on `collapsed` → logo-mark-only rail |
| `src/components/profile/ProfilePage.tsx` | Modify | Center the `max-w-2xl` content column |
| `src/data/skills.ts` | Modify | Add `NICHE_ALIASES`, `NicheDetection`, `detectNiche` |
| `src/data/__tests__/skills.test.ts` | Modify | Unit tests for `detectNiche` |
| `src/components/onboarding/SeekerSkillsStep.tsx` | Modify | Paste-to-detect textarea + suggested-skill chips |
| `src/components/onboarding/__tests__/SeekerSkillsStep.test.tsx` | Modify | Component test for detection behavior |
| `src/components/employers/PaymentModal.tsx` | Modify | Guarded 1.2s auto-nav to chat after success |
| `src/components/employers/__tests__/PaymentModal.test.tsx` | Modify | Auto-nav test |
| `src/components/apply/ApplyJobModal.tsx` | Modify | Lift `resumeFile`/`resumeFileName`; reset after submit |
| `src/components/apply/ApplyJobForm.tsx` | Modify | Consume lifted resume props instead of local state |
| `src/components/apply/__tests__/ApplyJobForm.test.tsx` | Modify | Pass new props; add file-select test |
| `src/components/apply/__tests__/ApplyJobModal.test.tsx` | Create | Persistence-across-close + reset-after-submit tests |
| `public/DESIGN-VISUAL-CONTEXT.md` | Modify | Append two prompt sections + priority-order update |
| `DESIGN-VISUAL-CONTEXT-ADDED.md` | Modify | Append the same two prompt sections |

---

### Task 1: Sidebar logo-only collapse + centered profile content

**Files:**
- Modify: `src/components/layout/Sidebar.tsx:66-77`
- Modify: `src/components/profile/ProfilePage.tsx:133`
- Test: `src/components/layout/__tests__/Sidebar.test.tsx`

**Interfaces:**
- Consumes: `collapsed?: boolean` prop already on `Sidebar`.
- Produces: nothing later tasks rely on.

- [ ] **Step 1: Write the failing test**

Append to `src/components/layout/__tests__/Sidebar.test.tsx` (inside the existing `describe('Sidebar', ...)` block, after the second `it`):

```tsx
  it('collapses the wordmark to the logo mark only', () => {
    const { rerender } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    )
    expect(screen.getByText('Community')).toBeInTheDocument()
    rerender(
      <MemoryRouter>
        <Sidebar collapsed />
      </MemoryRouter>,
    )
    expect(screen.queryByText('Community')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'HireHub' })).toBeInTheDocument()
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/components/layout/__tests__/Sidebar.test.tsx`
Expected: FAIL — `queryByText('Community')` is still found when collapsed (the full wordmark renders).

- [ ] **Step 3: Implement the sidebar logo branch**

In `src/components/layout/Sidebar.tsx`, replace the logo block (lines 66–77):

```tsx
      {/* Logo */}
      <div className={`h-14 border-b border-hairline shrink-0 ${collapsed ? 'flex justify-center' : 'flex items-center gap-3 px-4'}`}>
        <Link
          to="/"
          onClick={onNavClick}
          aria-label="HireHub"
          title="HireHub"
          className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 rounded"
        >
          {collapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className="h-8 w-8" aria-hidden="true">
              <rect x="4" y="4" width="40" height="40" rx="8" fill="#ff5600"/>
              <path d="M16 16v20M16 26h16M32 16v20" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 52" fill="none" className="h-7" aria-hidden="true">
              <rect x="4" y="6" width="40" height="40" rx="8" fill="#ff5600"/>
              <path d="M16 16v20M16 26h16M32 16v20" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
              <text x="54" y="32" fontFamily="Inter, system-ui, sans-serif" fontSize="22" fontWeight="500" fill="currentColor" letterSpacing="-0.3">HireHub</text>
              <text x="54" y="45" fontFamily="Inter, system-ui, sans-serif" fontSize="11" fontWeight="400" fill="currentColor" opacity="0.6">Community</text>
            </svg>
          )}
        </Link>
      </div>
```

- [ ] **Step 4: Center the ProfilePage content column**

In `src/components/profile/ProfilePage.tsx:133`, change:

```tsx
    <div className="max-w-2xl space-y-8">
```

to:

```tsx
    <div className="max-w-2xl mx-auto w-full space-y-8">
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test:run -- src/components/layout/__tests__/Sidebar.test.tsx`
Expected: PASS (all 3 tests).

- [ ] **Step 6: Lint and build**

Run: `npm run lint && npm run build`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/Sidebar.tsx src/components/profile/ProfilePage.tsx src/components/layout/__tests__/Sidebar.test.tsx
git commit -m "feat(layout): collapse sidebar to logo mark and center profile content"
```

---

### Task 2: `detectNiche` pure function + unit tests

**Files:**
- Modify: `src/data/skills.ts`
- Test: `src/data/__tests__/skills.test.ts`

**Interfaces:**
- Consumes: existing `SkillNiche` type and `categoryData` const in the same module.
- Produces:
  - `export const NICHE_ALIASES: Record<string, SkillNiche>` — phrase → niche map.
  - `export interface NicheDetection { niche: SkillNiche; matches: string[] }`
  - `export function detectNiche(text: string, selected: string[] = []): NicheDetection` — highest-scoring non-general niche from alias hits (weight 3 each) plus categoryData skill names present in the text (weight 1, skill names shorter than 4 chars ignored); `general` + `[]` fallback; `matches` = up to 8 skills of the chosen niche found in `text` and not in `selected`.

- [ ] **Step 1: Write the failing tests**

Append to `src/data/__tests__/skills.test.ts`. Update the first import line to:

```ts
import { SKILL_CATEGORIES, SKILL_NICHES, ALL_SKILLS, detectNiche } from '../skills'
```

and append this describe block:

```ts
describe('detectNiche', () => {
  it('detects the office niche from a customer-service description', () => {
    const { niche } = detectNiche(
      'customer service representative. handle support tickets with Zendesk and phone etiquette.',
    )
    expect(niche).toBe('office')
  })

  it('detects tech from a developer-heavy description', () => {
    const { niche } = detectNiche(
      'We are hiring a React developer who knows TypeScript, Docker, AWS and Node.js.',
    )
    expect(niche).toBe('tech')
  })

  it('falls back to general for gibberish', () => {
    const result = detectNiche('asdlkfjasd qwopuir asd fzxv')
    expect(result.niche).toBe('general')
    expect(result.matches).toEqual([])
  })

  it('returns matches present in the text, excluding already-selected skills', () => {
    const result = detectNiche('Need React and TypeScript', ['React'])
    expect(result.niche).toBe('tech')
    expect(result.matches).toContain('TypeScript')
    expect(result.matches).not.toContain('React')
  })

  it('returns an empty result for empty input', () => {
    expect(detectNiche('')).toEqual({ niche: 'general', matches: [] })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/data/__tests__/skills.test.ts`
Expected: FAIL — `detectNiche is not a function`.

- [ ] **Step 3: Implement `detectNiche`**

Append to the end of `src/data/skills.ts`:

```ts
export const NICHE_ALIASES: Record<string, SkillNiche> = {
  'customer service': 'office',
  'customer support': 'office',
  csr: 'office',
  support: 'office',
  'office admin': 'office',
  administrative: 'office',
  frontend: 'tech',
  'front end': 'tech',
  backend: 'tech',
  'back end': 'tech',
  'full stack': 'tech',
  software: 'tech',
  developer: 'tech',
  programming: 'tech',
  programmer: 'tech',
  engineer: 'tech',
  engineering: 'tech',
  react: 'tech',
  nodejs: 'tech',
  'node.js': 'tech',
  typescript: 'tech',
  javascript: 'tech',
  html: 'tech',
  css: 'tech',
  python: 'tech',
  sql: 'tech',
  aws: 'tech',
  cloud: 'tech',
  devops: 'tech',
  php: 'tech',
  'data science': 'tech',
  'data analysis': 'tech',
  design: 'design',
  'graphic design': 'design',
  'product design': 'design',
  'ux research': 'design',
  'video editing': 'design',
  accounting: 'business',
  finance: 'business',
  financial: 'business',
  bookkeeping: 'business',
  marketing: 'marketing',
  sales: 'marketing',
  seo: 'marketing',
  recruiting: 'hr',
  recruiter: 'hr',
  'talent acquisition': 'hr',
  hr: 'hr',
  'human resources': 'hr',
  nurse: 'healthcare',
  nursing: 'healthcare',
  medical: 'healthcare',
  healthcare: 'healthcare',
  welding: 'trades',
  welder: 'trades',
  electrician: 'trades',
  plumbing: 'trades',
  plumber: 'trades',
  construction: 'trades',
  hvac: 'trades',
  legal: 'legal',
  law: 'legal',
  lawyer: 'legal',
  paralegal: 'legal',
  teaching: 'education',
  teacher: 'education',
  education: 'education',
  esl: 'education',
  spanish: 'languages',
  bilingual: 'languages',
  translation: 'languages',
  communication: 'soft-skills',
  leadership: 'soft-skills',
  teamwork: 'soft-skills',
}

export interface NicheDetection {
  niche: SkillNiche
  matches: string[]
}

export function detectNiche(text: string, selected: string[] = []): NicheDetection {
  const lower = text.toLowerCase()
  const scores: Partial<Record<SkillNiche, number>> = {}

  for (const [phrase, niche] of Object.entries(NICHE_ALIASES)) {
    if (lower.includes(phrase)) scores[niche] = (scores[niche] ?? 0) + 3
  }

  for (const [niche, skills] of Object.entries(categoryData) as [Exclude<SkillNiche, 'general'>, string[]][]) {
    let score = 0
    for (const skill of skills) {
      const needle = skill.toLowerCase()
      if (needle.length >= 4 && lower.includes(needle)) score += 1
    }
    if (score > 0) scores[niche] = (scores[niche] ?? 0) + score
  }

  const ranked = (Object.entries(scores) as [SkillNiche, number][]).sort((a, b) => b[1] - a[1])
  if (ranked.length === 0) return { niche: 'general', matches: [] }

  const niche = ranked[0][0]
  const matches = ((categoryData as Record<SkillNiche, string[]>)[niche] ?? [])
    .filter((skill) => lower.includes(skill.toLowerCase()) && !selected.includes(skill))
    .slice(0, 8)

  return { niche, matches }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/data/__tests__/skills.test.ts`
Expected: PASS (all tests, old + new).

- [ ] **Step 5: Commit**

```bash
git add src/data/skills.ts src/data/__tests__/skills.test.ts
git commit -m "feat(skills): add detectNiche for job-description niche detection"
```

---

### Task 3: SeekerSkillsStep paste-to-detect textarea

**Files:**
- Modify: `src/components/onboarding/SeekerSkillsStep.tsx`
- Test: `src/components/onboarding/__tests__/SeekerSkillsStep.test.tsx`

**Interfaces:**
- Consumes: `detectNiche(text, selected)` and `NicheDetection` from `../../data/skills`; `Textarea` from `../ui`.
- Produces: when a pasted description detects a niche, `niche` state updates (so `SkillInput` suggestions follow) and tappable suggestion chips call the same add-skill logic (dedupe + max 15).

- [ ] **Step 1: Write the failing test**

Append to `src/components/onboarding/__tests__/SeekerSkillsStep.test.tsx`. Update the import line from `@testing-library/react` to include `act` and `fireEvent`:

```tsx
import { render, screen, fireEvent, act } from '@testing-library/react'
```

and append this `it` to the describe block:

```tsx
  it('detects a niche from pasted text and suggests skills', () => {
    vi.useFakeTimers()
    try {
      render(<SeekerSkillsStep onSaved={vi.fn()} />)
      fireEvent.change(screen.getByLabelText(/aiming for/i), {
        target: { value: 'customer service representative using Zendesk and phone etiquette' },
      })
      act(() => { vi.advanceTimersByTime(300) })
      expect(screen.getByRole('button', { name: 'General Office & Administrative' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByText(/suggested from your description/i)).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/components/onboarding/__tests__/SeekerSkillsStep.test.tsx`
Expected: FAIL — no element found for `getByLabelText(/aiming for/i)`.

- [ ] **Step 3: Implement the paste-to-detect UI**

Replace the entire body of `src/components/onboarding/SeekerSkillsStep.tsx` with:

```tsx
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useApp } from '../../context/AppContext'
import type { AppUser } from '../../context/AuthContext'
import { updateProfile } from '../../api/auth'
import { SKILL_NICHES, detectNiche, type NicheDetection, type SkillNiche } from '../../data/skills'
import { Textarea } from '../ui'
import { SkillInput } from './SkillInput'

interface SeekerSkillsStepProps {
  onSaved: () => void
}

export function SeekerSkillsStep({ onSaved }: SeekerSkillsStepProps) {
  const { user, setUser } = useApp()
  const [skills, setSkills] = useState<string[]>(user?.skills ?? [])
  const [niche, setNiche] = useState<SkillNiche>('general')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [detected, setDetected] = useState<NicheDetection | null>(null)
  const debounceRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(debounceRef.current), [])

  function handlePasteChange(value: string) {
    setPasteText(value)
    window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      const result = detectNiche(value, skills)
      if (result.niche !== 'general') setNiche(result.niche)
      setDetected(result)
    }, 300)
  }

  function handleAddSuggested(skill: string) {
    if (skills.includes(skill) || skills.length >= 15) return
    setSkills([...skills, skill])
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (saving) return
    if (skills.length < 3) {
      setError('Add at least 3 skills')
      return
    }
    if (skills.length > 15) {
      setError('Add at most 15 skills')
      return
    }
    setSaving(true)
    setError('')
    try {
      await updateProfile({ skills })
      setUser({ ...user, skills } as AppUser)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save your skills')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form id="onboarding-step" onSubmit={handleSubmit} className="space-y-4">
      {error && <p role="alert" className="text-sm text-error bg-error/10 px-3 py-2 rounded-md">{error}</p>}
      <Textarea
        label="Aiming for (optional)"
        id="niche-detector"
        rows={3}
        placeholder="Paste the job description or target role you're aiming for — we'll suggest a niche and matching skills."
        value={pasteText}
        onChange={(e) => handlePasteChange(e.target.value)}
        className="min-h-[80px]"
      />
      {detected && detected.niche !== 'general' && detected.matches.length > 0 && (
        <div>
          <p className="text-sm text-ink-muted mb-1">Suggested from your description</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Suggested skills">
            {detected.matches.map((skill) => {
              const added = skills.includes(skill)
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleAddSuggested(skill)}
                  aria-pressed={added}
                  disabled={added || skills.length >= 15}
                  className={`px-2.5 py-0.5 rounded-pill text-sm font-medium transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
                    added ? 'bg-accent/10 text-accent' : 'bg-surface-2 text-ink-muted hover:text-ink'
                  }`}
                >
                  {skill}
                </button>
              )
            })}
          </div>
        </div>
      )}
      <div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Skill field">
          {SKILL_NICHES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setNiche(id)}
              aria-pressed={niche === id}
              className={`px-3 py-1.5 rounded-pill text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
                niche === id ? 'bg-accent/10 text-accent' : 'bg-surface-2 text-ink-muted hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <SkillInput value={skills} onChange={setSkills} niche={niche} />
      {saving && <p className="text-sm text-ink-muted">Saving…</p>}
    </form>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/components/onboarding/__tests__/SeekerSkillsStep.test.tsx`
Expected: PASS (all 3 tests).

- [ ] **Step 5: Lint and build**

Run: `npm run lint && npm run build`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/onboarding/SeekerSkillsStep.tsx src/components/onboarding/__tests__/SeekerSkillsStep.test.tsx
git commit -m "feat(onboarding): paste-to-detect niche and suggested skills"
```

---

### Task 4: Payment → chat auto-navigate

**Files:**
- Modify: `src/components/employers/PaymentModal.tsx`
- Test: `src/components/employers/__tests__/PaymentModal.test.tsx`

**Interfaces:**
- Consumes: `onPaid: (conversationId: string) => void` prop (unchanged); `openSupportConversation()` from `../../api/messages` (unchanged).
- Produces: after successful payment the modal shows the success screen for ~1.2s then calls `onPaid(conversationId)` once; the "Start chatting…" button remains as a fallback and is disabled while navigating.

- [ ] **Step 1: Write the failing test**

Update `src/components/employers/__tests__/PaymentModal.test.tsx`. Change the `@testing-library/react` import to add `waitFor`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
```

and append this `it` to the describe block:

```tsx
  it('auto-navigates to chat about 1.2s after a successful payment', async () => {
    const user = userEvent.setup()
    const onPaid = vi.fn()
    mockUseApp.mockReturnValue({ user: { id: 'u1', name: 'Acme', email: 'acme@x.com', role: 'employer' } })
    mockOpenSupportConversation.mockResolvedValue({ success: true, data: conversation })

    render(
      <MemoryRouter>
        <PaymentModal tier={tier} open onOpenChange={() => {}} onPaid={onPaid} />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/card number/i), '4242 4242 4242 4242')
    await user.click(screen.getByRole('button', { name: /pay/i }))

    await screen.findByText(/thank you/i)
    expect(onPaid).not.toHaveBeenCalled()

    await waitFor(() => expect(onPaid).toHaveBeenCalledWith('conv-1'), { timeout: 2000 })
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/components/employers/__tests__/PaymentModal.test.tsx`
Expected: FAIL — `onPaid` is never called (no auto-nav yet).

- [ ] **Step 3: Implement the guarded auto-nav**

In `src/components/employers/PaymentModal.tsx`:

Change the first import to:

```tsx
import { useEffect, useRef, useState, type FormEvent } from 'react'
```

Replace the state block (lines 19–27) and the `handleClose` / `handleSubmit` / `handleStartChatting` functions with:

```tsx
export function PaymentModal({ tier, open, onOpenChange, onPaid }: PaymentModalProps) {
  const { user } = useApp()
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [navigating, setNavigating] = useState(false)
  const conversationIdRef = useRef<string | null>(null)
  const navigatingRef = useRef(false)
  const navigateTimerRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(navigateTimerRef.current), [])

  function handleClose() {
    window.clearTimeout(navigateTimerRef.current)
    navigatingRef.current = false
    setNavigating(false)
    setCardNumber('')
    setExpiry('')
    setCvc('')
    setError(null)
    setSuccess(false)
    onOpenChange(false)
  }

  function handleStartChatting() {
    const id = conversationIdRef.current
    if (!id || navigatingRef.current) return
    navigatingRef.current = true
    setNavigating(true)
    onPaid(id)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setPaying(true)
    setError(null)
    try {
      const res = await openSupportConversation()
      conversationIdRef.current = res.data.id
      setSuccess(true)
      navigateTimerRef.current = window.setTimeout(handleStartChatting, 1200)
    } catch {
      setError('Something went wrong with your payment. Please try again.')
    } finally {
      setPaying(false)
    }
  }
```

In the success-state JSX, replace the fallback button (currently line 141) with:

```tsx
                      <Button variant="accent" size="lg" className="w-full" onClick={handleStartChatting} disabled={navigating}>
                        {navigating ? 'Starting chat…' : 'Start chatting with the HireHub team'}
                      </Button>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/components/employers/__tests__/PaymentModal.test.tsx`
Expected: PASS (all 3 tests). The existing manual-click test must still pass.

- [ ] **Step 5: Lint and build**

Run: `npm run lint && npm run build`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/employers/PaymentModal.tsx src/components/employers/__tests__/PaymentModal.test.tsx
git commit -m "feat(employers): auto-navigate to support chat after payment"
```

---

### Task 5: Resume file survives modal close

**Files:**
- Modify: `src/components/apply/ApplyJobModal.tsx`
- Modify: `src/components/apply/ApplyJobForm.tsx`
- Test: `src/components/apply/__tests__/ApplyJobForm.test.tsx` (update)
- Test: `src/components/apply/__tests__/ApplyJobModal.test.tsx` (create)

**Interfaces:**
- `ApplyJobForm` props become: `job: Job`, `onSuccess: (resumeFileName?: string) => void`, `resumeFile: File | null`, `resumeFileName: string | null`, `onResumeChange: (file: File | null, name: string | null) => void`.
- `ApplyJobModal` owns `resumeFile`/`resumeFileName` (lifted) and a separate `submittedFileName` (for the `ApplyLanding` display); `handleSuccess` resets the lifted state so the next application starts fresh.

- [ ] **Step 1: Write the failing tests**

Update `src/components/apply/__tests__/ApplyJobForm.test.tsx` — change the import to include `userEvent`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
```

In both existing render calls inside the describe block, add the three new required props:

```tsx
        <ApplyJobForm job={jobs[0]} onSuccess={vi.fn()} resumeFile={null} resumeFileName={null} onResumeChange={vi.fn()} />
```

Then append this `it` to the first describe block (the one with `seekerWithResume`):

```tsx
  it('reports the chosen file up to the modal', async () => {
    mockUseApp.mockReturnValue({ user: null, addApplication: vi.fn() })
    const onResumeChange = vi.fn()
    render(
      <ToastProvider>
        <ApplyJobForm job={jobs[0]} onSuccess={vi.fn()} resumeFile={null} resumeFileName={null} onResumeChange={onResumeChange} />
      </ToastProvider>
    )
    const user = userEvent.setup()
    await user.upload(screen.getByLabelText(/upload resume/i), new File(['pdf'], 'cv.pdf', { type: 'application/pdf' }))
    expect(onResumeChange).toHaveBeenCalledWith(expect.any(File), 'cv.pdf')
  })
```

Create `src/components/apply/__tests__/ApplyJobModal.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApplyJobModal } from '../ApplyJobModal'
import { jobs } from '../../../data/jobs'

const { mockUseApp } = vi.hoisted(() => ({ mockUseApp: vi.fn() }))

vi.mock('../../../context/AppContext', () => ({
  useApp: () => mockUseApp(),
}))

vi.mock('../ApplyJobForm', () => ({
  ApplyJobForm: ({ resumeFile, resumeFileName, onResumeChange, onSuccess }: {
    resumeFile: File | null
    resumeFileName: string | null
    onResumeChange: (file: File | null, name: string | null) => void
    onSuccess: (name?: string) => void
  }) => (
    <div data-testid="apply-form" data-file={resumeFile?.name ?? ''} data-name={resumeFileName ?? ''}>
      <button type="button" onClick={() => onResumeChange(new File(['x'], 'cv.pdf'), 'cv.pdf')}>select-file</button>
      <button type="button" onClick={() => onSuccess('cv.pdf')}>submit</button>
    </div>
  ),
}))

vi.mock('../ApplyLanding', () => ({
  ApplyLanding: ({ resumeFileName }: { resumeFileName?: string }) => (
    <div data-testid="landing" data-name={resumeFileName ?? ''}>landing</div>
  ),
}))

describe('ApplyJobModal', () => {
  beforeEach(() => {
    mockUseApp.mockReturnValue({ user: { id: 'u1', name: 'Jane', email: 'j@x.com', role: 'seeker' } })
  })

  it('keeps a selected resume file across close and reopen', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<ApplyJobModal job={jobs[0]} open onOpenChange={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'select-file' }))
    expect(screen.getByTestId('apply-form')).toHaveAttribute('data-file', 'cv.pdf')

    rerender(<ApplyJobModal job={jobs[0]} open={false} onOpenChange={() => {}} />)
    rerender(<ApplyJobModal job={jobs[0]} open onOpenChange={() => {}} />)

    expect(screen.getByTestId('apply-form')).toHaveAttribute('data-file', 'cv.pdf')
  })

  it('clears the selected resume after a successful submit', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<ApplyJobModal job={jobs[0]} open onOpenChange={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'select-file' }))
    await user.click(screen.getByRole('button', { name: 'submit' }))
    expect(screen.getByTestId('landing')).toHaveAttribute('data-name', 'cv.pdf')

    rerender(<ApplyJobModal job={jobs[0]} open={false} onOpenChange={() => {}} />)
    rerender(<ApplyJobModal job={jobs[0]} open onOpenChange={() => {}} />)

    expect(screen.getByTestId('apply-form')).toHaveAttribute('data-file', '')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/components/apply/__tests__/ApplyJobForm.test.tsx src/components/apply/__tests__/ApplyJobModal.test.tsx`
Expected: FAIL — ApplyJobForm tests fail on missing props (TypeScript), and ApplyJobModal test reports `data-file=""` after reopen (state lives in the form, which unmounted).

- [ ] **Step 3: Lift the resume state into `ApplyJobModal`**

In `src/components/apply/ApplyJobModal.tsx`, replace the state + handler block (lines 16–30) with:

```tsx
export function ApplyJobModal({ job, open, onOpenChange }: ApplyJobModalProps) {
  const { user } = useApp()
  const [success, setSuccess] = useState(false)
  const [submittedFileName, setSubmittedFileName] = useState<string | undefined>()
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeFileName, setResumeFileName] = useState<string | null>(null)

  function handleSuccess(filename?: string) {
    setSubmittedFileName(filename)
    setResumeFile(null)
    setResumeFileName(null)
    setSuccess(true)
  }

  function handleClose() {
    setSuccess(false)
    setSubmittedFileName(undefined)
    onOpenChange(false)
  }

  function handleResumeChange(file: File | null, name: string | null) {
    setResumeFile(file)
    setResumeFileName(name)
  }
```

In the same file, replace the success/form branch (lines 75–79) with:

```tsx
                  {success ? (
                    <ApplyLanding job={job} user={user} resumeFileName={submittedFileName} />
                  ) : (
                    <ApplyJobForm
                      job={job}
                      onSuccess={handleSuccess}
                      resumeFile={resumeFile}
                      resumeFileName={resumeFileName}
                      onResumeChange={handleResumeChange}
                    />
                  )}
```

- [ ] **Step 4: Update `ApplyJobForm` to consume the lifted props**

In `src/components/apply/ApplyJobForm.tsx`, change the first import to:

```tsx
import { useRef, type ChangeEvent } from 'react'
```

Replace the props interface and destructure (lines 14–21) with:

```tsx
interface ApplyJobFormProps {
  job: Job
  onSuccess: (resumeFileName?: string) => void
  resumeFile: File | null
  resumeFileName: string | null
  onResumeChange: (file: File | null, name: string | null) => void
}

export function ApplyJobForm({ job, onSuccess, resumeFile, resumeFileName, onResumeChange }: ApplyJobFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
```

Replace `handleFileChange` and `handleClearFile` (lines 42–58) with:

```tsx
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
      showToast('error', 'File is too large. Maximum size is 10MB.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    onResumeChange(file, file.name)
  }

  function handleClearFile() {
    onResumeChange(null, null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }
```

The rest of the file (the `onSubmit` body and JSX) is unchanged — it already references `resumeFile` and `resumeFileName` by those names, which now resolve to the props.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test:run -- src/components/apply/__tests__/ApplyJobForm.test.tsx src/components/apply/__tests__/ApplyJobModal.test.tsx`
Expected: PASS (all tests).

- [ ] **Step 6: Lint and build**

Run: `npm run lint && npm run build`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/apply/ApplyJobModal.tsx src/components/apply/ApplyJobForm.tsx src/components/apply/__tests__/ApplyJobForm.test.tsx src/components/apply/__tests__/ApplyJobModal.test.tsx
git commit -m "fix(apply): keep selected resume across modal close, reset after submit"
```

---

### Task 6: Design prompts (Dashboard Mobile 9:16 + Profile Card light/dark)

**Files:**
- Modify: `public/DESIGN-VISUAL-CONTEXT.md`
- Modify: `DESIGN-VISUAL-CONTEXT-ADDED.md`

**Interfaces:**
- Consumes: nothing (documentation only).
- Produces: two new prompt sections available to image-generation tooling; `## Priority Generation Order` includes them.

- [ ] **Step 1: Append the two sections to `public/DESIGN-VISUAL-CONTEXT.md`**

Insert the block below immediately before the `## Priority Generation Order` heading (currently line 669) in `public/DESIGN-VISUAL-CONTEXT.md`:

````markdown
## Section: Dashboard Mobile (9:16)

**Emotional objective:** Quiet Focus + Competence

**Primary prompt (mobile dashboard overview — 9:16):**
```
Subject: A single hand holding a smartphone in a portrait orientation, thumb
       resting at the side, the HireHub dashboard overview legible on screen:
       a profile summary card at the top (avatar, name, headline, location),
       three tinted stat cards in a row (Applications, Saved Jobs, Interviews),
       a 4-column detail strip (email, salary expectation, employment type,
       work mode), and a wrap of small muted skill chips. The faint
       overview-grid background pattern sits behind the stat cards.
Environment: A softly lit desk or café corner behind the hand and phone, falling
           into a warm neutral blur that matches the brand canvas.
Narrative: Opportunity status at a glance — the quick check-in between tasks,
          thumb away from tapping.
Emotion: Quiet focus and competence; the data reads instantly.
Lighting: Soft natural light from camera-left, gentle warm falloff.
Camera: Straight-on to the screen at a slight downward angle, intimate distance.
Lens: 50mm f/2.8.
Composition: Phone occupies the center two-thirds of frame, screen bright and
            legible, ~30% warm negative space around it for editorial feel.
Color palette: Canvas #F5F1EC, Surface-1 #FFFFFF cards, Surface-2 #EBE7E1
              stat-card icon tints, Ink #111111 text, Ink-muted #626260 labels,
              Accent #FF5600 on the interview icon and Edit-profile link,
              Hairline #D3CEC6 borders.
Rendering style: Editorial photography of a real UI screen, crisp type, warm
                neutral color grade, 2-3% film grain.
Aspect ratio: 9:16
Negative: No cold blue tones, no stock hand-and-phone tropes, no visible
          background UI, no oversaturation, no heavy drop shadows.
```

**Component rules (from DashboardShell.tsx / OverviewTab.tsx):**
- Screen canvas: `bg-canvas` warm neutral; the profile summary and stat cards are `bg-surface-1` with `border-hairline`.
- Stat cards: `w-12 h-12 rounded-full` icon chips tinted `bg-blue-100 text-blue-600`, `bg-purple-100 text-purple-600`, `bg-green-100 text-green-600` — the only color beyond ink and accent; numbers `text-2xl font-semibold text-ink`.
- Accent `#ff5600` appears only as the Edit-profile link and the hover arrow — keep it sparse in the hero image.
- The grid behind the stat cards is `/overview-grid-bg.svg`, `text-ink` at low opacity — the "city of opportunities" pattern.
- Typography: Inter — name `text-lg font-semibold text-ink`, labels `text-sm text-ink-muted`, detail labels `text-xs text-ink-tertiary`.

---

## Section: Dashboard Profile Card (Light / Dark)

**Emotional objective:** Approachable + Credible

**Primary prompt (profile card avatar — neutral subject, light mode):**
```
Subject: One neutral professional subject (early 30s, warm medium-brown skin,
       short dark hair, soft amber sweater) photographed from the chest up at a
       slight angle, looking just off-camera with a calm, genuine smile. Framed
       as the avatar space of a profile card — small in frame, centered in the
       upper third.
Environment: A softly blurred warm interior — cream wall and warm lamplight —
           reading as the card background, not a studio backdrop.
Narrative: A real person, present and approachable — a face a candidate would
          scroll past and remember.
Emotion: Warm credibility — professional without being posed.
Lighting: Soft window light from camera-right, gentle warmth on skin.
Camera: Eye level, chest-up crop, intimate but not close.
Lens: 85mm f/2.0.
Composition: Subject centered in the upper third, ~50% negative space below and
            around for the card's name, headline, location, detail grid, skill
            chips, and resume row.
Color palette: Canvas #F5F1EC, Surface-1 #FFFFFF, Ink #111111, Ink-muted
              #626260, Ink-tertiary #9C9FA5, Accent #FF5600 (small detail),
              Hairline #D3CEC6.
Rendering style: Editorial portrait photography, warm neutral grade, 3% grain.
Aspect ratio: 4:3
Negative: No corporate blue suits, no forced smiles, no studio strobes, no cold
          tones, no stock-photo posing, no text overlays.
```

**Alt variant (same subject and scene, dark mode):**
```
Subject: The same subject, same pose, same expression, same crop — nothing
       changes except the surface tones around them.
Environment: The same interior rendered with the theme inverted — the warm canvas
           darkens to a deep warm charcoal, card surfaces to a dark warm gray,
           ink flips to warm white, hairlines become low-opacity warm outlines.
Narrative: The same person in the same room at a different hour — identity is
          unchanged by theme.
Emotion: Warm credibility in low light — same warmth, darker surfaces.
Lighting: Same window light, slightly dimmed to match the darker surfaces.
Camera: Same framing and distance as the light variant.
Composition: Identical placement — the light/dark pair must read as one card in
            two themes, so negative space and crop are pixel-consistent.
Color palette: Dark canvas ≈ #1F1C19, dark card surface ≈ #2A2622, ink →
              warm white #F5F1EC, accent #FF5600 retained, hairlines ≈ #3A3530
              at low opacity.
Rendering style: Same as primary, matching dark color grade.
Aspect ratio: 4:3
Negative: Same as primary, plus no pure-black backgrounds and no saturated blues.
```

**Component rules (from OverviewTab.tsx):**
- Card: `Card variant="default" className="p-5"` — `bg-surface-1` in light, its dark-theme equivalent in dark; hairline border.
- Avatar: `Avatar size="lg"` with initials fallback; name `text-lg font-semibold text-ink truncate`, headline `text-sm text-ink-muted truncate`, location a `MapPin` icon + `text-sm text-ink-muted`.
- Detail grid: `grid grid-cols-2 sm:grid-cols-4 gap-3` — each cell a `text-xs text-ink-tertiary` label over a `text-ink font-medium truncate` value.
- Skill chips: `bg-surface-2 text-ink-muted rounded-pill` — muted by design; accent is reserved for the Edit-profile link.
- Resume row: `text-sm text-ink-muted` with the file name in `text-ink font-medium`.

---
````

- [ ] **Step 2: Update the priority order in `public/DESIGN-VISUAL-CONTEXT.md`**

In the `## Priority Generation Order` block (lines 669–689), add after the final line `17. NotFound ambient -> warm recovery`:

```
18. Dashboard Mobile (9:16)                         -> mobile overview imagery
19. Dashboard profile card (light/dark)             -> themed profile card avatar
```

- [ ] **Step 3: Append the same two sections to `DESIGN-VISUAL-CONTEXT-ADDED.md`**

Append the identical block from Step 1 (the two `## Section:` blocks, including their component-rules lists, separated by `---`) to the end of `DESIGN-VISUAL-CONTEXT-ADDED.md`. No priority list exists in this file, so none is updated.

- [ ] **Step 4: Verify both files**

Run: `grep -c "## Section: Dashboard Mobile" public/DESIGN-VISUAL-CONTEXT.md DESIGN-VISUAL-CONTEXT-ADDED.md`
Expected: `1` for each file.
Run: `grep -c "## Section: Dashboard Profile Card" public/DESIGN-VISUAL-CONTEXT.md DESIGN-VISUAL-CONTEXT-ADDED.md`
Expected: `1` for each file.

- [ ] **Step 5: Full-suite verification**

Run: `npm run test:run`
Expected: all tests pass.
Run: `npm run lint && npm run build`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add public/DESIGN-VISUAL-CONTEXT.md DESIGN-VISUAL-CONTEXT-ADDED.md
git commit -m "docs: add dashboard mobile and profile-card design prompts"
```

---

## Manual verification checklist (post-plan)

- Toggle the sidebar collapse control at an `md`+ viewport → the rail shows only the centered orange logo mark; `ProfilePage` content is centered.
- In onboarding Skills step, paste a customer-service job description → the "General Office & Administrative" chip auto-selects and tappable suggestions appear; pasting gibberish changes nothing.
- Complete a demo payment → success screen shows, then auto-navigates to `?tab=messages&conv=<id>` within ~1.2s; the fallback button still works.
- In an application, select a PDF resume, close the modal, reopen it → the file name is still selected; after submitting, a fresh open starts with no file.
