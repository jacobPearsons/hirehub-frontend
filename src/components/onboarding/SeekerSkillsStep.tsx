import { useState, type FormEvent } from 'react'
import { useApp } from '../../context/AppContext'
import type { AppUser } from '../../context/AuthContext'
import { updateProfile } from '../../api/auth'
import { SkillInput } from './SkillInput'

interface SeekerSkillsStepProps {
  onSaved: () => void
}

export function SeekerSkillsStep({ onSaved }: SeekerSkillsStepProps) {
  const { user, setUser } = useApp()
  const [skills, setSkills] = useState<string[]>(user?.skills ?? [])
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
      <SkillInput value={skills} onChange={setSkills} />
      {saving && <p className="text-sm text-ink-muted">Saving…</p>}
    </form>
  )
}
