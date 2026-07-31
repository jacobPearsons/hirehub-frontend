import { useState, type ReactNode } from 'react'
import { CheckCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Button } from '../ui/Button'
import { OnboardingProgress } from './OnboardingProgress'
import { SeekerBasicsStep } from './SeekerBasicsStep'
import { SeekerResumeStep } from './SeekerResumeStep'
import { SeekerSkillsStep } from './SeekerSkillsStep'
import { SeekerPreferencesStep } from './SeekerPreferencesStep'
import { SeekerCompleteStep } from './SeekerCompleteStep'
import { EmployerCompanyStep } from './EmployerCompanyStep'
import { EmployerProfileStep } from './EmployerProfileStep'
import { EmployerInviteStep } from './EmployerInviteStep'
import { EmployerCompleteStep } from './EmployerCompleteStep'

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

const EMPLOYER_STEPS: StepDef[] = [
  { title: 'Company', optional: false, component: EmployerCompanyStep },
  { title: 'Profile', optional: true, component: EmployerProfileStep },
  { title: 'Team', optional: true, component: EmployerInviteStep },
  { title: 'Done', optional: false, component: EmployerCompleteStep },
]

export default function OnboardingWizard() {
  const { user } = useApp()
  const [stepIndex, setStepIndex] = useState(0)
  const [saved, setSaved] = useState(false)

  const steps = user?.role === 'employer' ? EMPLOYER_STEPS : SEEKER_STEPS
  const step = steps[stepIndex]
  const StepComponent = step.component
  const isLast = stepIndex === steps.length - 1

  const handleSaved = () => {
    setSaved(true)
    setStepIndex((i) => Math.min(i + 1, steps.length - 1))
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
