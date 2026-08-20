# WS3: SkillInput Niche Suggestions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `SkillInput` show relevant, niche-specific suggestions — e.g. when the user's field is "Customer Service", suggest customer-service skills — instead of only the generic tech list.

**Architecture:** `SkillInput` currently filters a single flat `SUGGESTIONS` array. Add a `niche` prop (`'tech' | 'design' | 'business' | 'marketing' | 'hr' | 'healthcare' | 'trades' | 'legal' | 'education' | 'languages' | 'soft-skills' | 'office' | 'general'`) plus a per-niche suggestion map. When a niche is provided, the suggestion list uses that niche's suggestions; otherwise it falls back to the general list. Where `SkillInput` is used (e.g. `SeekerSkillsStep`), pass a niche derived from the user's headline/job title, with a small field selector.

**Data source:** `/home/jacobp/Desktop/Projecs/skillInput.md` (workspace root). This file is the canonical list of skill categories and per-category suggestions. Copy each category's skill list verbatim into `src/data/skills.ts`; do not re-invent or trim it. The `SKILL_CATEGORIES` object shape in that file maps 1:1 to the new `src/data/skills.ts` structure.

**Tech Stack:** React 19, Tailwind CSS 3, existing onboarding components.

## Global Constraints

- Follow HireHub DESIGN.md conventions: tokens via Tailwind, no `cn()`/`clsx()`, string concat ternaries
- Existing dependencies only — no new npm packages
- Keep the existing `SkillInput` public API backward compatible (`value`, `onChange`, `max`, `error`)
- Run `npm run test:run`, `npm run build`, `npm run lint` after each task

---

### Task 1: Create the skill data module from skillInput.md

**Files:**
- Create: `src/data/skills.ts`
- Reference: `/home/jacobp/Desktop/Projecs/skillInput.md`

**Interfaces:**
- Produces: `SKILL_CATEGORIES` record, `SKILL_NICHES` category list (for the picker), `ALL_SKILLS` flattened array, `SkillNiche` union type

- [ ] **Step 1: Read the source data**

Run: `cat /home/jacobp/Desktop/Projecs/skillInput.md`

- [ ] **Step 2: Write the failing test**

Create `src/data/__tests__/skills.test.ts`:

```tsx
import { SKILL_CATEGORIES, SKILL_NICHES, ALL_SKILLS } from '../skills'

describe('skills data', () => {
  it('covers every niche category with non-empty suggestions', () => {
    for (const { id, label } of SKILL_NICHES) {
      expect(SKILL_CATEGORIES[id].length).toBeGreaterThan(10)
      expect(label.length).toBeGreaterThan(0)
    }
  })

  it('flattens all categories into ALL_SKILLS without loss', () => {
    const flat = Object.values(SKILL_CATEGORIES).flat()
    expect(ALL_SKILLS).toEqual(flat)
  })

  it('keeps distinct values', () => {
    expect(new Set(ALL_SKILLS).size).toBe(ALL_SKILLS.length)
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test:run -- src/data/__tests__/skills.test.ts`
Expected: FAIL — `src/data/skills.ts` doesn't exist.

- [ ] **Step 4: Implement the data module**

`src/data/skills.ts` — copy the 12 category lists verbatim from `skillInput.md`. Each `id` maps to a category heading in that file:

```tsx
export type SkillNiche =
  | 'tech' | 'design' | 'business' | 'marketing' | 'hr' | 'healthcare'
  | 'trades' | 'legal' | 'education' | 'languages' | 'soft-skills' | 'office' | 'general'

export const SKILL_CATEGORIES: Record<Exclude<SkillNiche, 'general'>, string[]> = {
  tech: [/* 🖥️ Technology & Engineering — verbatim from skillInput.md */],
  design: [/* 🎨 Design & Creative */],
  business: [/* 📊 Business, Finance & Operations */],
  marketing: [/* 📈 Marketing, Sales & Communications */],
  hr: [/* 👥 Human Resources & People Operations */],
  healthcare: [/* 🏥 Healthcare & Life Sciences */],
  trades: [/* 🏗️ Trades, Construction & Manufacturing */],
  legal: [/* 🏛️ Legal, Government & Public Service */],
  education: [/* 🎓 Education & Training */],
  languages: [/* 🌍 Languages & Global Skills */],
  'soft-skills': [/* 🧠 Soft Skills & Professional Competencies */],
  office: [/* 🧰 General Office & Administrative */],
}

export const SKILL_NICHES = [
  { id: 'general', label: 'General' },
  { id: 'tech', label: 'Technology & Engineering' },
  { id: 'design', label: 'Design & Creative' },
  { id: 'business', label: 'Business, Finance & Operations' },
  { id: 'marketing', label: 'Marketing, Sales & Communications' },
  { id: 'hr', label: 'Human Resources & People Operations' },
  { id: 'healthcare', label: 'Healthcare & Life Sciences' },
  { id: 'trades', label: 'Trades, Construction & Manufacturing' },
  { id: 'legal', label: 'Legal, Government & Public Service' },
  { id: 'education', label: 'Education & Training' },
  { id: 'languages', label: 'Languages & Global Skills' },
  { id: 'soft-skills', label: 'Soft Skills & Professional Competencies' },
  { id: 'office', label: 'General Office & Administrative' },
] as const

export const GENERAL_SUGGESTIONS: string[] = [
  'Communication', 'Active Listening', 'Problem Solving', 'Teamwork', 'Leadership',
  'Time Management', 'Adaptability', 'Attention to Detail', 'Customer Service', 'Microsoft Excel',
]

export const ALL_SKILLS = Object.values(SKILL_CATEGORIES).flat()
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test:run -- src/data/__tests__/skills.test.ts`
Expected: PASS

- [ ] **Step 6: Full gate**

Run: `npm run test:run && npm run build && npm run lint`
Expected: all pass

- [ ] **Step 7: Commit**

```bash
git add src/data/skills.ts src/data/__tests__/skills.test.ts
git commit -m "feat(data): skill categories from skillInput.md"
```

---

### Task 2: Add niche suggestion maps to SkillInput

**Files:**
- Modify: `src/components/onboarding/SkillInput.tsx`

**Interfaces:**
- Consumes: new optional `niche?: SkillNiche` prop; `SKILL_CATEGORIES` + `GENERAL_SUGGESTIONS` from `src/data/skills`
- Produces: matches computed from the active niche

- [ ] **Step 1: Write the failing test**

Extend `src/components/onboarding/__tests__/SkillInput.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SkillInput } from '../SkillInput'

describe('SkillInput niche suggestions', () => {
  it('shows customer-service suggestions when niche is office', async () => {
    const user = userEvent.setup()
    render(<SkillInput value={[]} onChange={jest.fn()} niche="office" />)
    const input = screen.getByRole('textbox', { name: /skills/i })
    await user.type(input, 'Zendesk')
    expect(screen.getByText('Zendesk')).toBeInTheDocument()
  })

  it('shows general suggestions by default', async () => {
    const user = userEvent.setup()
    render(<SkillInput value={[]} onChange={jest.fn()} />)
    const input = screen.getByRole('textbox', { name: /skills/i })
    await user.type(input, 'React')
    expect(screen.getByText('React')).toBeInTheDocument()
  })
})
```

Note: 'Zendesk' lives under General Office & Administrative in `skillInput.md`; if the existing `GENERAL_SUGGESTIONS` is expected to keep tech entries, the second test's 'React' expectation still holds because general keeps tech-flavored entries.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/components/onboarding/__tests__/SkillInput.test.tsx`
Expected: FAIL — `niche` prop doesn't exist.

- [ ] **Step 3: Implement the niche map**

```tsx
import { SKILL_CATEGORIES, GENERAL_SUGGESTIONS, type SkillNiche } from '../../data/skills'

interface SkillInputProps {
  value: string[]
  onChange: (skills: string[]) => void
  max?: number
  error?: string
  niche?: SkillNiche
}

const SUGGESTIONS = (niche?: SkillNiche) =>
  niche && niche !== 'general' ? SKILL_CATEGORIES[niche] : GENERAL_SUGGESTIONS
```

Replace `matches` computation:

```tsx
const suggestions = SUGGESTIONS(niche)
const matches = suggestions.filter(
  (s) => s.toLowerCase().includes(text.toLowerCase()) && !value.includes(s),
)
```

Add `niche` to the destructured props and the component signature.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/components/onboarding/__tests__/SkillInput.test.tsx`
Expected: PASS

- [ ] **Step 5: Full gate**

Run: `npm run test:run && npm run build && npm run lint`
Expected: all pass

- [ ] **Step 6: Commit**

```bash
git add src/components/onboarding/SkillInput.tsx src/components/onboarding/__tests__/SkillInput.test.tsx
git commit -m "feat(onboarding): niche-specific skill suggestions"
```

---

### Task 3: Wire niche selection into SeekerSkillsStep

**Files:**
- Modify: `src/components/onboarding/SeekerSkillsStep.tsx` (find exact path via glob)

**Interfaces:**
- Consumes: `SKILL_NICHES` from `src/data/skills` and `SkillNiche` from `SkillInput` (Task 2)
- Produces: A field selector above the SkillInput whose chosen niche is passed to it

- [ ] **Step 1: Read the current SeekerSkillsStep**

Run: `cat src/components/onboarding/SeekerSkillsStep.tsx`

- [ ] **Step 2: Add a niche picker**

Add a `niche` state defaulting to `'general'` and render segmented buttons from `SKILL_NICHES`:

```tsx
const [niche, setNiche] = useState<SkillNiche>('general')

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
```

Pass `niche={niche}` to `<SkillInput … />`.

- [ ] **Step 3: Extend the test**

Update the `SeekerSkillsStep` test (or create one if it doesn't exist) to assert the niche buttons render and clicking "General Office & Administrative" passes `niche="office"`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/components/onboarding/__tests__/SeekerSkillsStep.test.tsx`
Expected: PASS

- [ ] **Step 5: Full gate**

Run: `npm run test:run && npm run build && npm run lint`
Expected: all pass

- [ ] **Step 6: Commit**

```bash
git add src/components/onboarding/SeekerSkillsStep.tsx src/components/onboarding/__tests__/SeekerSkillsStep.test.tsx
git commit -m "feat(onboarding): pick skill field niche for suggestions"
```

---

## Validation and Acceptance

1. `SkillInput` with `niche="office"` suggests office/admin skills (e.g. Zendesk) from `skillInput.md`
2. Default `SkillInput` behavior (general suggestions) is unchanged
3. Existing `SkillInput` callers compile without changes
4. `SeekerSkillsStep` lets users pick a field and gets relevant suggestions for all 12 categories
5. `src/data/skills.ts` matches the categories and skill lists in `/home/jacobp/Desktop/Projecs/skillInput.md`
6. All frontend gates pass
