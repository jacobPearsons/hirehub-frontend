import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Users } from 'lucide-react'
import { Card } from '../ui'
import { SkeletonGrid } from '../ui/SkeletonGrid'
import { EmptyState } from '../ui/EmptyState'
import { ErrorState } from '../ui/ErrorState'
import { InterviewScheduleModal } from '../interview'
import { OfferLetterModal } from '../offer'
import { listJobs } from '../../api/jobs'
import { useApp } from '../../context/AppContext'
import { useApplications } from '../../context/ApplicationsContext'
import type { Application, ApplicationStatus } from '../../types/application'

const statusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
  applied: { label: 'Applied', color: 'bg-accent/10 text-accent' },
  reviewing: { label: 'Under Review', color: 'bg-ink-muted/10 text-ink-muted' },
  interviewing: { label: 'Interviewing', color: 'bg-surface-2 text-ink' },
  rejected: { label: 'Rejected', color: 'bg-error/10 text-error' },
  offer: { label: 'Offer', color: 'bg-success/10 text-success' },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

export function ApplicantsTab() {
  const { user } = useApp()
  const { applications: allApps, updateApplicationStatus: updateContextStatus } = useApplications()
  const [employerJobIds, setEmployerJobIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [interviewModalApp, setInterviewModalApp] = useState<Application | null>(null)
  const [offerModalApp, setOfferModalApp] = useState<Application | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    if (user?.companyName) {
      listJobs({ take: 100 })
        .then(res => {
          const jobIds = res.data
            .filter(job => job.company.toLowerCase() === user.companyName!.toLowerCase())
            .map(job => job.id)
          setEmployerJobIds(jobIds)
        })
        .catch(() => setError('Failed to load jobs.'))
        .finally(() => setLoading(false))
    } else {
      setEmployerJobIds([])
      setLoading(false)
    }
  }, [user?.companyName])

  const apps = allApps.filter(app => employerJobIds.includes(app.jobId))

  async function handleStatusChange(id: string, status: ApplicationStatus) {
    updateContextStatus(id, status)
  }

  if (loading) {
    return (
      <SkeletonGrid count={4} columns={2} />
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />
  }

  if (apps.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-12 h-12" />}
        title="No applicants yet"
        description="When candidates start applying, their applications will appear here."
      />
    )
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {apps.map((app) => {
          const status = statusConfig[app.status]
          const submittedDate = new Date(app.submittedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })

          return (
            <motion.div key={app.id} variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
              <Card variant="default" className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-md bg-surface-2 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-ink-muted" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-medium text-ink">{app.applicantName}</h3>
                        <p className="text-sm text-ink-muted">
                          Applied for <span className="font-medium text-ink">{app.jobTitle}</span> at {app.company}
                        </p>
                        <p className="text-xs text-ink-tertiary mt-0.5">{submittedDate}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-pill text-xs font-medium flex-shrink-0 ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-ink-muted mt-3 line-clamp-2">{app.coverLetter}</p>
                    <div className="flex items-center gap-2 mt-3">
                      {app.status !== 'reviewing' && (
                        <button
                          onClick={() => handleStatusChange(app.id, 'reviewing')}
                          className="text-xs font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded"
                        >
                          Mark reviewing
                        </button>
                      )}
                      {app.status !== 'interviewing' && (
                        <button
                          onClick={() => setInterviewModalApp(app)}
                          className="text-xs font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded"
                        >
                          Schedule Interview
                        </button>
                      )}
                      {app.status !== 'offer' && (
                        <button
                          onClick={() => setOfferModalApp(app)}
                          className="text-xs font-medium text-success hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded"
                        >
                          Make offer
                        </button>
                      )}
                      {app.status !== 'rejected' && (
                        <button
                          onClick={() => handleStatusChange(app.id, 'rejected')}
                          className="text-xs font-medium text-error hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded"
                        >
                          Reject
                        </button>
                      )}
                      {app.portfolioUrl && (
                        <a
                          href={app.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-ink-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded"
                        >
                          Portfolio →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>
      {interviewModalApp && (
        <InterviewScheduleModal
          application={interviewModalApp}
          open={!!interviewModalApp}
          onOpenChange={(open) => { if (!open) setInterviewModalApp(null) }}
          onSuccess={() => setInterviewModalApp(null)}
        />
      )}
      {offerModalApp && (
        <OfferLetterModal
          application={offerModalApp}
          open={!!offerModalApp}
          onOpenChange={(open) => { if (!open) setOfferModalApp(null) }}
          onSuccess={() => setOfferModalApp(null)}
        />
      )}
    </>
  )
}
