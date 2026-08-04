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
