import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, MapPin, Wrench, Globe } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { AppUser } from '../../context/AuthContext'
import { updateProfile } from '../../api/auth'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

export function SeekerCompleteStep() {
  const { user, setUser } = useApp()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleComplete = async () => {
    if (saving) return
    setSaving(true)
    setError('')
    try {
      await updateProfile({ onboardingCompleted: true })
      setUser({ ...user, onboardingCompleted: true } as AppUser)
      navigate('/jobs')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to finish setup')
      setSaving(false)
    }
  }

  const rows: { icon: typeof Briefcase; label: string; value: string }[] = []
  if (user?.headline) rows.push({ icon: Briefcase, label: 'Headline', value: user.headline })
  if (user?.location) rows.push({ icon: MapPin, label: 'Location', value: user.location })
  if (user?.skills?.length) rows.push({ icon: Wrench, label: 'Skills', value: `${user.skills.length} skills` })
  if (user?.remoteOnly) rows.push({ icon: Globe, label: 'Work', value: 'Remote only' })

  return (
    <div className="space-y-6">
      <Card variant="feature" className="p-6">
        <h2 className="text-lg font-semibold text-ink mb-4">Your profile</h2>
        {rows.length === 0 ? (
          <p className="text-sm text-ink-muted">Your profile is ready — add details anytime from your dashboard.</p>
        ) : (
          <dl className="space-y-3">
            {rows.map((row) => {
              const Icon = row.icon
              return (
                <div key={row.label} className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-accent shrink-0" />
                  <dt className="text-sm text-ink-muted w-24 shrink-0">{row.label}</dt>
                  <dd className="text-sm font-medium text-ink">{row.value}</dd>
                </div>
              )
            })}
          </dl>
        )}
        {error && <p role="alert" className="mt-4 text-sm text-error bg-error/10 px-3 py-2 rounded-md">{error}</p>}
        <Button variant="primary" size="lg" className="mt-6" disabled={saving} onClick={handleComplete}>
          {saving ? 'Saving…' : 'Go to job board'}
        </Button>
      </Card>
    </div>
  )
}
