## Task 7 — Seeker steps + wizard (seeker path)

TDD: `src/components/onboarding/__tests__/OnboardingWizard.test.tsx` seeker `describe`
written first (see below).

Steps (each `<form id="onboarding-step">`, error state shown inline on API
failure, success calls `onSaved()` which advances + shows "Saved" indicator):

`src/components/onboarding/SeekerBasicsStep.tsx` — RHF + zod. Fields:
`name` (min 1, max 100), `headline` (max 120), `location` (max 100). Prefill
from `useApp().user`. Submit → `updateProfile({ name, headline, location })` →
`setUser({ ...user, name, headline, location } as AppUser)` → `onSaved()`.
This step is mandatory; the wizard does not render Skip for it.

`src/components/onboarding/SeekerResumeStep.tsx` — file input (PDF only, ≤ 10 MB)
+ preview of chosen file name. Submit with no file → `onSaved()` (skip-by-
continue). With file: `formData.append('resume', file)`,
`apiUpload('/upload/resume', formData)` → `updateProfile({ resumePath:
res.data.resumePath, resumeFileName: res.data.resumeFileName })` → setUser →
`onSaved()`. Validate client-side: non-PDF → error "Please upload a PDF file";
> 10 MB → error "Resume must be under 10 MB".

`src/components/onboarding/SeekerSkillsStep.tsx` — `SkillInput`, prefill from
`user.skills`. Submit: `skills.length < 3` → inline error "Add at least 3
skills"; `> 15` → "Add at most 15 skills"; else
`updateProfile({ skills })` → setUser → `onSaved()`.

`src/components/onboarding/SeekerPreferencesStep.tsx` — RHF. Checkbox
`remoteOnly`; `salaryMin` / `salaryMax` (number, min 0, optional); `currency`
select (USD/EUR/GBP); `employmentType` select (Full-time/Part-time/Contract/
Internship). Submit builds payload with only defined values →
`updateProfile(payload)` → setUser → `onSaved()`.

`src/components/onboarding/SeekerCompleteStep.tsx` — summary card (headline,
location, skills count, remote/salary if set) + primary Button "Go to job
board": `updateProfile({ onboardingCompleted: true })` → `setUser({ ...user,
onboardingCompleted: true } as AppUser)` → `navigate('/jobs')`.

`src/components/onboarding/OnboardingWizard.tsx`:

```tsx
import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Button } from '../ui/Button'
import { OnboardingProgress } from './OnboardingProgress'
import { SeekerBasicsStep } from './SeekerBasicsStep'
import { SeekerResumeStep } from './SeekerResumeStep'
import { SeekerSkillsStep } from './SeekerSkillsStep'
import { SeekerPreferencesStep } from './SeekerPreferencesStep'
import { SeekerCompleteStep } from './SeekerCompleteStep'

interface StepDef {
  title: string
  optional: boolean
  component: (props: { onSaved: () => void }) => ReactNode
}

const SEEKER_STEPS: StepDef[] = [
  { title: 'Basics', optional: false, component: SeekerBasicsStep },
  { title: 'Resume', optional: true, component: SeekerResumeStep },
  { title: 'Skills', optional: true, component: SeekerSkillsStep },
  { title: 'Preferences', optional: true, component: SeekerPreferencesStep },
  { title: 'Done', optional: false, component: SeekerCompleteStep },
]

export default function OnboardingWizard() {
  const { user } = useApp()
  const [stepIndex, setStepIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const steps = SEEKER_STEPS
  const step = steps[stepIndex]
  const StepComponent = step.component
  const isLast = stepIndex === steps.length - 1

  const handleSaved = () => {
    setSaving(false)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0))
  const goNext = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1))

  return (
    <div className="min-h-screen bg-canvas">
      <OnboardingProgress current={stepIndex} total={steps.length} labels={steps.map((s) => s.title)} />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-ink mb-1">Let's get your profile ready</h1>
        <p className="text-sm text-ink-muted mb-8">{step.optional ? 'Optional — skip any time.' : 'A few details help employers find you.'}</p>
        {isLast ? (
          <StepComponent onSaved={handleSaved} />
        ) : (
          <>
            <StepComponent onSaved={handleSaved} />
            <div className="sticky bottom-0 mt-8 -mx-6 px-6 py-4 bg-canvas/95 backdrop-blur border-t border-hairline flex items-center gap-3">
              {stepIndex > 0 && (
                <Button variant="ghost" size="md" onClick={goBack}>Back</Button>
              )}
              {step.optional && (
                <Button variant="ghost" size="md" onClick={goNext}>Skip</Button>
              )}
              <span className="flex-1" />
              {saved && (
                <span className="inline-flex items-center gap-1 text-sm text-success">
                  <CheckCircle className="w-4 h-4" /> Saved
                </span>
              )}
              <Button
                variant="primary"
                size="md"
                type="submit"
                form="onboarding-step"
                disabled={saving}
                onClick={() => setSaving(true)}
              >
                Continue
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
```

`OnboardingWizard.test.tsx` (seeker describe):
- mocks: `vi.mock('../../api/auth')` (`updateProfile: vi.fn()`),
  `vi.mock('../../api/client')` (`apiUpload: vi.fn()`),
  `vi.mock('../../context/AppContext')` (`useApp` → seeker user, no
  onboardingCompleted), `vi.mock('../../../utils/usePageMeta')`. Wrap in
  `MemoryRouter` + `ToastProvider`. Note the component path from the test dir is
  `../../context/AppContext`, `../../api/auth` (test lives next to the wizard).
- Tests: renders progress "Step 1 of 5"; entering headline + Continue calls
  `updateProfile` and advances to "Step 2 of 5"; Skills step blocks Continue
  below 3 skills with the inline error; completing the flow (final step CTA)
  calls `updateProfile({ onboardingCompleted: true })`.

Verify: seeker tests green; `npm run build` green.
Commit: `feat(onboarding): seeker wizard steps`.

