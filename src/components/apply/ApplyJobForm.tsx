import { useState, useRef, type ChangeEvent, type FormEvent } from 'react'
import { X, File as FileIcon } from 'lucide-react'
import { Input, Button, Textarea } from '../ui'
import { useToast } from '../ui/Toast'
import { useApp } from '../../context/AppContext'
import { createApplication } from '../../api/applications'
import type { Job } from '../../data/jobs'

const MAX_FILE_SIZE = 10 * 1024 * 1024

interface ApplyJobFormProps {
  job: Job
  onSuccess: (resumeFileName?: string) => void
}

export function ApplyJobForm({ job, onSuccess }: ApplyJobFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [resumeFileName, setResumeFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user, addApplication } = useApp()

  const { showToast } = useToast()
  const [fullName, setFullName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState('')
  const [coverLetter, setCoverLetter] = useState('')

  const COVER_LETTER_MAX = 2000

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
      showToast('error', 'File is too large. Maximum size is 10MB.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    setResumeFileName(file.name)
  }

  function handleClearFile() {
    setResumeFileName(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!fullName || !email || coverLetter.length < 50) {
      setError('Please fill in all required fields (cover letter needs at least 50 characters)')
      return
    }
    setSubmitting(true)
    try {
      const res = await createApplication({
        jobId: job.id,
        applicantName: fullName,
        applicantEmail: email,
        applicantPhone: phone || undefined,
        coverLetter,
      })
      addApplication(res.data)
      onSuccess(resumeFileName || undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Application failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-danger bg-danger/10 px-3 py-2 rounded-md">{error}</p>}
      <Input label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" />
      <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" />
      <Input label="Phone (optional)" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" />
      <div>
        <Textarea label="Cover Letter" id="coverLetter" rows={5} value={coverLetter} onChange={e => setCoverLetter(e.target.value.slice(0, COVER_LETTER_MAX))}
          placeholder="Tell us why you're a great fit..." className="min-h-[120px]" />
        <p className="mt-1 text-xs text-ink-tertiary text-right">
          {coverLetter.length}/{COVER_LETTER_MAX} characters
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-1">Resume (optional)</label>
        {resumeFileName ? (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-md border border-hairline bg-surface-1">
            <FileIcon className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
            <span className="text-sm text-ink truncate flex-1">{resumeFileName}</span>
            <button type="button" onClick={handleClearFile} className="p-0.5 rounded text-ink-tertiary hover:text-error transition-colors" aria-label="Remove resume">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center justify-center gap-2 px-4 py-6 rounded-md border-2 border-dashed border-hairline bg-surface-1 hover:border-ink/40 transition-colors">
            <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="sr-only" aria-label="Upload resume (PDF)" />
            <FileIcon className="w-5 h-5 text-ink-muted" aria-hidden="true" />
            <span className="text-sm text-ink-muted">Click to upload PDF resume</span>
          </label>
        )}
        <p className="mt-1 text-xs text-ink-tertiary">Accepted: PDF only, up to 10MB</p>
      </div>
      <Button variant="accent" size="lg" className="w-full" type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Application'}
      </Button>
    </form>
  )
}
