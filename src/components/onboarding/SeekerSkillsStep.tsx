import { useState, type FormEvent } from 'react'
import { useApp } from '../../context/AppContext'
import type { AppUser } from '../../context/AuthContext'
import { updateProfile } from '../../api/auth'
import { SKILL_NICHES, type SkillNiche } from '../../data/skills'
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
