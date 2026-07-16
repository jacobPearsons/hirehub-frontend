import { motion } from 'framer-motion'
import { Card } from '../ui'
import { InterviewDetails } from '../interview/InterviewDetails'
import { OfferLetterView } from '../offer/OfferLetterView'
import type { Application, ApplicationStatus } from '../../types/application'

const statusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
  applied: { label: 'Applied', color: 'bg-accent/10 text-accent' },
  reviewing: { label: 'Under Review', color: 'bg-ink-muted/10 text-ink-muted' },
  interviewing: { label: 'Interviewing', color: 'bg-surface-2 text-ink' },
  rejected: { label: 'Rejected', color: 'bg-error/10 text-error' },
  offer: { label: 'Offer', color: 'bg-success/10 text-success' },
}

interface ApplicationCardProps {
  application: Application
  onStatusUpdate?: (applicationId: string, status: ApplicationStatus) => void
}

export function ApplicationCard({ application, onStatusUpdate }: ApplicationCardProps) {
  const status = statusConfig[application.status]
  const submittedDate = new Date(application.submittedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
      <Card variant="default" className="p-5">
        <div className="flex items-start gap-4">
          <img
            src={application.companyLogo}
            alt={application.company}
            className="w-10 h-10 rounded-md bg-surface-2 object-contain flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-medium text-ink">{application.jobTitle}</h3>
                <p className="text-sm text-ink-muted">{application.company}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-pill text-xs font-medium flex-shrink-0 ${status.color}`}>
                {status.label}
              </span>
            </div>
            <p className="text-xs text-ink-tertiary mt-2">Submitted {submittedDate}</p>
          </div>
        </div>

        {application.status === 'interviewing' && application.interviewDetails && (
          <div className="mt-4 pt-4 border-t border-hairline">
            <InterviewDetails details={application.interviewDetails} />
          </div>
        )}

        {application.status === 'offer' && application.offerDetails && onStatusUpdate && (
          <div className="mt-4 pt-4 border-t border-hairline">
            <OfferLetterView application={application} onStatusUpdate={onStatusUpdate} />
          </div>
        )}
      </Card>
    </motion.div>
  )
}
