import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Users } from 'lucide-react'
import { Card } from '../ui'
import { SkeletonGrid } from '../ui/SkeletonGrid'
import { EmptyState } from '../ui/EmptyState'
import { ErrorState } from '../ui/ErrorState'
import { InterviewScheduleModal } from '../interview'
import { OfferLetterModal } from '../offer'
import { CandidateDetailDrawer } from '../candidate'
import { useEmployerJobsQuery } from '../../hooks/useEmployerJobsQuery'
import { useApplications } from '../../context/ApplicationsContext'
import { useAuth } from '../../context/AuthContext'
import { canManageApplications } from '../../utils/permissions'
import { STATUS_CONFIG } from '../../utils/status'
import type { Application, ApplicationStatus } from '../../types/application'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

export function ApplicantsTab() {
  const { applications: allApps, updateApplicationStatus: updateContextStatus } = useApplications()
  const { user } = useAuth()
  const canManage = canManageApplications(user)
  const { data, isLoading, isError, refetch } = useEmployerJobsQuery()
  const [interviewModalApp, setInterviewModalApp] = useState<Application | null>(null)
  const [offerModalApp, setOfferModalApp] = useState<Application | null>(null)
  const [viewApp, setViewApp] = useState<Application | null>(null)

  const employerJobIds = data?.data.map((job) => job.id) ?? []

  const apps = allApps.filter(app => employerJobIds.includes(app.jobId))

  async function handleStatusChange(id: string, status: ApplicationStatus) {
    updateContextStatus(id, status)
  }

  if (isLoading) {
    return (
      <SkeletonGrid count={4} columns={2} />
    )
  }

  if (isError) {
    return <ErrorState message="Failed to load jobs." onRetry={() => refetch()} />
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
          const status = STATUS_CONFIG[app.status]
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
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <button
                        onClick={() => setViewApp(app)}
                        className="text-xs font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded"
                      >
                        View profile
                      </button>
                      {canManage && app.status !== 'screening' && (
                        <button
                          onClick={() => handleStatusChange(app.id, 'screening')}
                          className="text-xs font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded"
                        >
                          Mark reviewing
                        </button>
                      )}
                      {canManage && app.status !== 'interviewing' && (
                        <button
                          onClick={() => setInterviewModalApp(app)}
                          className="text-xs font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded"
                        >
                          Schedule Interview
                        </button>
                      )}
                      {canManage && app.status !== 'offer' && (
                        <button
                          onClick={() => setOfferModalApp(app)}
                          className="text-xs font-medium text-success hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded"
                        >
                          Make offer
                        </button>
                      )}
                      {canManage && app.status !== 'rejected' && (
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
      {canManage && interviewModalApp && (
        <InterviewScheduleModal
          application={interviewModalApp}
          open={!!interviewModalApp}
          onOpenChange={(open) => { if (!open) setInterviewModalApp(null) }}
          onSuccess={() => setInterviewModalApp(null)}
        />
      )}
      {canManage && offerModalApp && (
        <OfferLetterModal
          application={offerModalApp}
          open={!!offerModalApp}
          onOpenChange={(open) => { if (!open) setOfferModalApp(null) }}
          onSuccess={() => setOfferModalApp(null)}
        />
      )}
      {viewApp && (
        <CandidateDetailDrawer
          application={viewApp}
          open={!!viewApp}
          onOpenChange={(open) => { if (!open) setViewApp(null) }}
          onActionComplete={() => setViewApp(null)}
          readOnly={!canManage}
        />
      )}
    </>
  )
}
