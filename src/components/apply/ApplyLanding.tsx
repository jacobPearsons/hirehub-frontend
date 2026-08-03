import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { Button } from '../ui'
import type { Job } from '../../data/jobs'
import type { AppUser } from '../../context/AppContext'

interface ApplyLandingProps {
  job: Job
  user: AppUser | null
  resumeFileName?: string
}

export function ApplyLanding({ job, user, resumeFileName }: ApplyLandingProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 opacity-25" aria-hidden="true">
        <img
          src="/apply-success-bg.png"
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="relative flex flex-col items-center text-center py-8">
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
        {user ? (
          <div className="flex flex-col items-center gap-4">
            <Link to="/dashboard">
              <Button variant="accent" size="lg">
                Go to dashboard
              </Button>
            </Link>
            <Link
              to="/jobs"
              className="text-sm text-accent font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 rounded"
            >
              Browse more jobs
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/signup">
              <Button variant="accent" size="lg">
                Create an account
              </Button>
            </Link>
            <Link to="/jobs">
              <Button variant="primary" size="lg">
                Browse more jobs
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
