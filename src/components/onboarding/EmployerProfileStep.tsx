import { useRef, useState } from 'react'
import { FileImage } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { uploadCompanyLogo, upsertCompany } from '../../api/company'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'

interface EmployerProfileStepProps {
  onSaved: () => void
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 2 * 1024 * 1024

export function EmployerProfileStep({ onSaved }: EmployerProfileStepProps) {
  const { user } = useApp()
  const fileRef = useRef<HTMLInputElement>(null)
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [logoName, setLogoName] = useState('')
  const [logoError, setLogoError] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleLogo = (file?: File) => {
    setLogoError('')
    if (!file) return
    if (!ACCEPTED.includes(file.type)) {
      setLogoError('Logo must be JPEG, PNG or WebP')
      return
    }
    if (file.size > MAX_BYTES) {
      setLogoError('Logo must be under 2 MB')
      return
    }
    setLogoName(file.name)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    setError('')
    try {
      let logo: string | undefined
      const file = fileRef.current?.files?.[0]
      if (file) {
        const res = await uploadCompanyLogo(file)
        logo = res.data.logoUrl
      }
      await upsertCompany({
        name: user?.companyName ?? '',
        description: description || undefined,
        location: location || undefined,
        ...(logo ? { logo } : {}),
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save your company profile')
      setSaving(false)
    }
  }

  return (
    <form id="onboarding-step" onSubmit={onSubmit} className="space-y-4">
      {error && <p role="alert" className="text-sm text-error bg-error/10 px-3 py-2 rounded-md">{error}</p>}
      <div>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED.join(',')}
          aria-label="Company logo"
          className="hidden"
          onChange={(e) => handleLogo(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full p-6 rounded-md border-2 border-dashed border-hairline text-center hover:border-ink/40 transition-colors"
        >
          <FileImage className="w-6 h-6 text-ink-muted mx-auto mb-2" />
          <p className="text-sm font-medium text-ink">{logoName || 'Upload a logo (JPEG, PNG or WebP)'}</p>
          <p className="text-xs text-ink-muted mt-1">Up to 2 MB — optional, skip to continue.</p>
        </button>
        {logoError && <p role="alert" className="mt-1 text-sm text-error">{logoError}</p>}
      </div>
      <Textarea label="Company description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={4} />
      <Input label="Location" placeholder="e.g. Lisbon, Portugal" value={location} onChange={(e) => setLocation(e.target.value)} />
      {saving && <p className="text-sm text-ink-muted">Saving…</p>}
    </form>
  )
}
