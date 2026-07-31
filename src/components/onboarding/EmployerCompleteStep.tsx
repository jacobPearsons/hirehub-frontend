import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { AppUser } from '../../context/AuthContext'
import { updateProfile } from '../../api/auth'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

export function EmployerCompleteStep() {
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
      navigate('/post-job')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to finish setup')
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card variant="feature" className="p-6">
        <h2 className="text-lg font-semibold text-ink mb-4">Your company</h2>
        <dl className="space-y-3">
          <div className="flex items-center gap-3">
            <Building2 className="w-4 h-4 text-accent shrink-0" />
            <dt className="text-sm text-ink-muted w-24 shrink-0">Company</dt>
            <dd className="text-sm font-medium text-ink">{user?.companyName || 'Not set'}</dd>
          </div>
        </dl>
        {error && <p role="alert" className="mt-4 text-sm text-error bg-error/10 px-3 py-2 rounded-md">{error}</p>}
        <Button variant="primary" size="lg" className="mt-6" disabled={saving} onClick={handleComplete}>
          {saving ? 'Saving…' : 'Post your first job'}
        </Button>
      </Card>
    </div>
  )
}
