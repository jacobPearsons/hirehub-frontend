import { useState, useRef, type ChangeEvent } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, File as FileIcon } from 'lucide-react'
import { Input, Button, Textarea } from '../ui'
import { useToast } from '../ui/Toast'
import { useApp } from '../../context/AppContext'
import { apiUpload } from '../../api/client'
import { applicationSchema, type ApplicationFormData } from '../../schemas/auth'
import type { Job } from '../../data/jobs'

const MAX_FILE_SIZE = 10 * 1024 * 1024

interface ApplyJobFormProps {
  job: Job
  onSuccess: (resumeFileName?: string) => void
}

export function ApplyJobForm({ job, onSuccess }: ApplyJobFormProps) {
  const [resumeFileName, setResumeFileName] = useState<string | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user, addApplication } = useApp()
  const { showToast } = useToast()

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      fullName: user?.name || '',
      email: user?.email || '',
      coverLetter: '',
    },
  })

  const coverLetterValue = useWatch({ control, name: 'coverLetter' })
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
    setResumeFile(file)
  }

  function handleClearFile() {
    setResumeFileName(null)
    setResumeFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      const { createApplication } = await import('../../api/applications')
      let resumePath: string | undefined
      let uploadedFileName: string | undefined
      if (resumeFile) {
        const formData = new FormData()
        formData.append('resume', resumeFile)
        const res = await apiUpload<{ resumePath: string; resumeFileName: string }>('/upload/resume', formData)
        resumePath = res.data.resumePath
        uploadedFileName = res.data.resumeFileName
      }
      const res = await createApplication({
        jobId: job.id,
        applicantName: data.fullName,
        applicantEmail: data.email,
        coverLetter: data.coverLetter,
        resumePath,
        resumeFileName: uploadedFileName,
      })
      addApplication(res.data)
      onSuccess(uploadedFileName || resumeFileName || undefined)
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Application failed')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Full Name" placeholder="John Doe" error={errors.fullName?.message} {...register('fullName')} />
      <Input label="Email" type="email" placeholder="john@example.com" error={errors.email?.message} {...register('email')} />
      <div>
        <Textarea label="Cover Letter" id="coverLetter" rows={5} placeholder="Tell us why you're a great fit..." className="min-h-[120px]" error={errors.coverLetter?.message} {...register('coverLetter')} />
        <p className="mt-1 text-xs text-ink-tertiary text-right">
          {coverLetterValue?.length ?? 0}/{COVER_LETTER_MAX} characters
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
      <Button variant="accent" size="lg" className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Application'}
      </Button>
    </form>
  )
}
