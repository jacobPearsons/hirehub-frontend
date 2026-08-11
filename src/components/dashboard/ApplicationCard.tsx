import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Workflow } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../ui'
import { InterviewDetails } from '../interview/InterviewDetails'
import { OfferLetterView } from '../offer/OfferLetterView'
import { OrientationCard } from '../orientation/OrientationCard'
import { PreBoardingChecklist } from '../preboarding/PreBoardingChecklist'
import { HiringFlowModal } from './HiringFlowModal'
import { STATUS_CONFIG } from '../../utils/status'
import type { Application, ApplicationStatus } from '../../types/application'

interface ApplicationCardProps {
  application: Application
  onStatusUpdate?: (applicationId: string, status: ApplicationStatus) => void
}

export function ApplicationCard({ application, onStatusUpdate }: ApplicationCardProps) {
  const [flowOpen, setFlowOpen] = useState(false)
  const status = STATUS_CONFIG[application.status]
  const submittedDate = new Date(application.submittedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
      <Card variant="default" className="p-5">
        <div className="flex items-start gap-3 sm:gap-4">
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

        {application.status === 'offer' &&
          application.offerDetails?.accepted === true &&
          application.preBoardingChecklist && (
            <div className="mt-4 pt-4 border-t border-hairline">
              <PreBoardingChecklist application={application} />
            </div>
          )}

        {application.status === 'offer' &&
          application.offerDetails?.accepted === true &&
          application.orientationDetails && (
            <div className="mt-4 pt-4 border-t border-hairline">
              <OrientationCard
                details={application.orientationDetails}
                preBoardingComplete={application.preBoardingChecklist?.every(item => item.completed)}
              />
            </div>
          )}

        <div className="mt-4 pt-4 border-t border-hairline flex items-center gap-2">
          <Link
            to={`/jobs/${application.jobId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-accent hover:text-accent/80 hover:bg-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 transition-colors"
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            View Job
          </Link>
          <button
            type="button"
            onClick={() => setFlowOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-ink hover:text-ink-muted hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 transition-colors"
          >
            <Workflow className="w-4 h-4" aria-hidden="true" />
            Hiring Flow
          </button>
        </div>
      </Card>
      <HiringFlowModal application={application} open={flowOpen} onOpenChange={setFlowOpen} />
    </motion.div>
  )
}
