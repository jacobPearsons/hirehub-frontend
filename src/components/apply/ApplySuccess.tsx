import { CheckCircle } from 'lucide-react'
import { Button } from '../ui'
import type { Job } from '../../data/jobs'

interface ApplySuccessProps {
  job: Job
  resumeFileName?: string
  onClose: () => void
}

export function ApplySuccess({ job, resumeFileName, onClose }: ApplySuccessProps) {
  return (
    <div className="flex flex-col items-center text-center py-8">
      <CheckCircle className="w-16 h-16 text-success mb-4" aria-hidden="true" />
      <h2 className="text-xl font-semibold text-ink mb-2">Application Submitted!</h2>
      <p className="text-ink-muted mb-1">
        Your application for {job.title} at {job.company} has been received.
      </p>
      {resumeFileName && (
        <p className="text-sm text-ink-tertiary mb-1">
          Resume attached: {resumeFileName}
        </p>
      )}
      <p className="text-sm text-ink-tertiary mb-8">
        The employer will review your application and get back to you.
      </p>
      <Button variant="accent" size="lg" onClick={onClose}>
        Done
      </Button>
    </div>
  )
}
