import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { FileText, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { AppUser } from '../../context/AuthContext'
import { updateProfile } from '../../api/auth'
import { apiUpload } from '../../api/client'

const MAX_RESUME_SIZE = 10 * 1024 * 1024

interface SeekerResumeStepProps {
  onSaved: () => void
}

export function SeekerResumeStep({ onSaved }: SeekerResumeStepProps) {
  const { user, setUser } = useApp()
  const [file, setFile] = useState<File | null>(null)
  const [existingResume] = useState(() => user?.resumeFileName ?? null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.files?.[0] ?? null
    setFile(next)
    setError('')
    if (next && next.type !== 'application/pdf') {
      setError('Please upload a PDF file')
    } else if (next && next.size > MAX_RESUME_SIZE) {
      setError('Resume must be under 10 MB')
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (saving) return
    if (!file) {
      onSaved()
      return
    }
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return
    }
    if (file.size > MAX_RESUME_SIZE) {
      setError('Resume must be under 10 MB')
      return
    }
    setSaving(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('resume', file)
      const res = await apiUpload<{ resumePath: string; resumeFileName: string }>('/upload/resume', formData)
      await updateProfile({
        resumePath: res.data.resumePath,
        resumeFileName: res.data.resumeFileName,
      })
      setUser({
        ...user,
        resumePath: res.data.resumePath,
        resumeFileName: res.data.resumeFileName,
      } as AppUser)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload your resume')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form id="onboarding-step" onSubmit={handleSubmit} className="space-y-4">
      {error && <p role="alert" className="text-sm text-error bg-error/10 px-3 py-2 rounded-md">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Resume file"
      />
      {file ? (
        <div className="flex items-center justify-between gap-3 p-3 rounded-md border border-hairline bg-surface-1">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="w-5 h-5 text-accent shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{file.name}</p>
              <p className="text-xs text-ink-muted">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFile(null)}
            aria-label="Remove resume"
            className="text-ink-muted hover:text-ink p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : existingResume ? (
        <div className="flex items-center justify-between gap-3 p-3 rounded-md border border-hairline bg-surface-1">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="w-5 h-5 text-accent shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{existingResume}</p>
              <p className="text-xs text-ink-muted">Resume already uploaded — choose a new file to replace it.</p>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full p-6 rounded-md border-2 border-dashed border-hairline text-center hover:border-ink/40 transition-colors"
        >
          <FileText className="w-6 h-6 text-ink-muted mx-auto mb-2" />
          <p className="text-sm font-medium text-ink">Choose a resume (PDF, up to 10 MB)</p>
          <p className="text-xs text-ink-muted mt-1">Optional — continue without one to skip.</p>
        </button>
      )}
      {saving && <p className="text-sm text-ink-muted">Uploading…</p>}
    </form>
  )
}
