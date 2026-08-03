import { useState } from 'react'
import { X } from 'lucide-react'
import { z } from 'zod'
import { inviteTeam } from '../../api/company'
import { Textarea } from '../ui/Textarea'

interface EmployerInviteStepProps {
  onSaved: () => void
}

const MAX_INVITES = 20
const emailSchema = z.string().email()

export function EmployerInviteStep({ onSaved }: EmployerInviteStepProps) {
  const [raw, setRaw] = useState('')
  const [emails, setEmails] = useState<string[]>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const parse = (text: string): string[] =>
    text
      .split(/[\s,]+/)
      .map((e) => e.trim())
      .filter(Boolean)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return
    setError('')
    const parsed = parse(raw)
    if (parsed.length) {
      const invalid = parsed.find((email) => !emailSchema.safeParse(email).success)
      if (invalid) {
        setError(`Not a valid email: ${invalid}`)
        return
      }
      if (parsed.length + emails.length > MAX_INVITES) {
        setError(`You can invite up to ${MAX_INVITES} people`)
        return
      }
      setEmails([...emails, ...parsed])
      setRaw('')
    }
    if (emails.length || parsed.length) {
      setSaving(true)
      try {
        await inviteTeam([...emails, ...parsed])
        onSaved()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send invites')
        setSaving(false)
      }
    } else {
      onSaved()
    }
  }

  const removeEmail = (email: string) => setEmails(emails.filter((e) => e !== email))

  return (
    <form id="onboarding-step" onSubmit={onSubmit} className="space-y-4">
      {error && <p role="alert" className="text-sm text-error bg-error/10 px-3 py-2 rounded-md">{error}</p>}
      {emails.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {emails.map((email) => (
            <span key={email} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-sm font-medium bg-accent/10 text-ink">
              {email}
              <button
                type="button"
                onClick={() => removeEmail(email)}
                aria-label={`Remove ${email}`}
                className="text-ink-muted hover:text-ink"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      <Textarea
        label="Team emails"
        placeholder="alice@acme.com, bob@acme.com"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        rows={3}
      />
      <p className="text-xs text-ink-muted">Comma or newline separated — up to {MAX_INVITES} people.</p>
      {saving && <p className="text-sm text-ink-muted">Sending…</p>}
    </form>
  )
}
