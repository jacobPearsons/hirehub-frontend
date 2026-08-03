import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { X, FileText, Mail, Phone, Globe, MapPin, Calendar } from 'lucide-react'
import { Avatar, Button } from '../ui'
import { useToast } from '../ui/Toast'
import { resumeFileUrl } from '../../api/applications'
import { useCandidateProfileQuery } from '../../hooks/useCandidateProfileQuery'
import { useApplications } from '../../context/ApplicationsContext'
import { InterviewScheduleModal, InterviewDetails } from '../interview'
import { OfferLetterModal } from '../offer'
import type { Application } from '../../types/application'

interface CandidateDetailDrawerProps {
  application: Application
  open: boolean
  onOpenChange: (open: boolean) => void
  onActionComplete: () => void
}

function DetailRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <span className="text-ink-tertiary mt-0.5 flex-shrink-0" aria-hidden="true">{icon}</span>
      <div className="min-w-0">
        <p className="text-ink-tertiary text-xs">{label}</p>
        <div className="text-ink break-words">{children}</div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mb-2">{title}</h3>
      {children}
    </div>
  )
}

export function CandidateDetailDrawer({
  application,
  open,
  onOpenChange,
  onActionComplete,
}: CandidateDetailDrawerProps) {
  const { data, isLoading, isError, refetch } = useCandidateProfileQuery(application.id, open)
  const [interviewOpen, setInterviewOpen] = useState(false)
  const [offerOpen, setOfferOpen] = useState(false)
  const { showToast } = useToast()
  const { updateApplicationStatus } = useApplications()

  const candidate = data?.data.candidate ?? null
  const error = isError ? 'Failed to load candidate profile.' : null

  async function handleStatusChange(status: Application['status'], message: string) {
    try {
      await updateApplicationStatus(application.id, status)
      showToast('success', message)
      onActionComplete()
    } catch {
      showToast('error', `Failed to ${message.toLowerCase()}. Please try again.`)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 bg-black/50 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface-1 shadow-xl border-l border-hairline overflow-y-auto"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <div className="sticky top-0 bg-surface-1/95 backdrop-blur-sm border-b border-hairline px-6 py-4 flex items-center justify-between">
                  <Dialog.Title className="text-lg font-semibold text-ink">Candidate Profile</Dialog.Title>
                  <Dialog.Description className="sr-only">
                    Full candidate profile, resume, and hiring actions.
                  </Dialog.Description>
                  <Dialog.Close asChild>
                    <button
                      className="p-1 rounded-md text-ink-tertiary hover:text-ink hover:bg-surface-2 transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="p-6 space-y-6">
                  {isLoading && (
                    <div className="flex items-center justify-center py-16 text-ink-muted text-sm">
                      Loading candidate profile…
                    </div>
                  )}

                  {error && (
                    <div className="py-16 text-center">
                      <p className="text-error text-sm">{error}</p>
                      <Button variant="accent" size="sm" className="mt-4" onClick={() => refetch()}>
                        Retry
                      </Button>
                    </div>
                  )}

                  {candidate && !isLoading && (
                    <>
                      <div className="flex items-center gap-4">
                        <Avatar name={candidate.name} src={candidate.avatarUrl} size="lg" />
                        <div className="min-w-0">
                          <h2 className="text-lg font-semibold text-ink truncate">{candidate.name}</h2>
                          {candidate.headline && <p className="text-sm text-ink-muted truncate">{candidate.headline}</p>}
                          {candidate.location && (
                            <p className="text-xs text-ink-tertiary flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" aria-hidden="true" />
                              {candidate.location}
                            </p>
                          )}
                        </div>
                      </div>

                      <Section title="Contact">
                        <div className="space-y-3">
                          <DetailRow icon={<Mail className="w-4 h-4" />} label="Email">
                            <a href={`mailto:${candidate.email}`} className="text-accent hover:underline">{candidate.email}</a>
                          </DetailRow>
                          {candidate.phone && (
                            <DetailRow icon={<Phone className="w-4 h-4" />} label="Phone">
                              <a href={`tel:${candidate.phone}`} className="text-accent hover:underline">{candidate.phone}</a>
                            </DetailRow>
                          )}
                          {application.portfolioUrl && (
                            <DetailRow icon={<Globe className="w-4 h-4" />} label="Portfolio">
                              <a href={application.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline break-all">
                                {application.portfolioUrl}
                              </a>
                            </DetailRow>
                          )}
                          {candidate.resumePath && (
                            <DetailRow icon={<FileText className="w-4 h-4" />} label="Resume">
                              <a
                                href={resumeFileUrl(candidate.resumePath)}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Open resume${candidate.resumeFileName ? `: ${candidate.resumeFileName}` : ''}`}
                                className="text-accent hover:underline inline-flex items-center gap-1.5"
                              >
                                {candidate.resumeFileName || 'Download resume'}
                              </a>
                            </DetailRow>
                          )}
                        </div>
                      </Section>

                      {candidate.skills && candidate.skills.length > 0 && (
                        <Section title="Skills">
                          <div className="flex flex-wrap gap-2">
                            {candidate.skills.map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-pill text-xs font-medium bg-surface-2 text-ink"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </Section>
                      )}

                      {candidate.bio && (
                        <Section title="About">
                          <p className="text-sm text-ink whitespace-pre-line">{candidate.bio}</p>
                        </Section>
                      )}

                      {(candidate.salaryMin != null || candidate.employmentType || candidate.remoteOnly != null) && (
                        <Section title="Job Preferences">
                          <div className="space-y-3">
                            {candidate.salaryMin != null && (
                              <DetailRow icon={<Calendar className="w-4 h-4" />} label="Salary range">
                                {candidate.currency} {candidate.salaryMin.toLocaleString()}
                                {candidate.salaryMax != null ? ` – ${candidate.salaryMax.toLocaleString()}` : ''}
                              </DetailRow>
                            )}
                            {candidate.employmentType && (
                              <p className="text-sm text-ink capitalize">{candidate.employmentType.replace('-', ' ')}</p>
                            )}
                            {candidate.remoteOnly != null && (
                              <p className="text-sm text-ink">{candidate.remoteOnly ? 'Remote only' : 'Open to on-site'}</p>
                            )}
                          </div>
                        </Section>
                      )}

                      <Section title="Cover Letter">
                        <p className="text-sm text-ink whitespace-pre-line">{application.coverLetter}</p>
                      </Section>

                      {application.interviewDetails && (
                        <Section title="Hiring Progress">
                          <InterviewDetails details={application.interviewDetails} />
                        </Section>
                      )}

                      <Section title="Actions">
                        <div className="flex flex-wrap gap-2">
                          {application.status !== 'reviewing' && (
                            <Button
                              variant="accent"
                              size="sm"
                              onClick={() => handleStatusChange('reviewing', 'Marked as under review')}
                            >
                              Mark reviewing
                            </Button>
                          )}
                          {application.status !== 'interviewing' && (
                            <Button variant="accent" size="sm" onClick={() => setInterviewOpen(true)}>
                              Schedule Interview
                            </Button>
                          )}
                          {application.status !== 'offer' && (
                            <Button variant="accent" size="sm" onClick={() => setOfferOpen(true)}>
                              Make offer
                            </Button>
                          )}
                          {application.status !== 'rejected' && (
                            <button
                              className="text-xs font-medium text-error hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded"
                              onClick={() => handleStatusChange('rejected', 'Application rejected')}
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </Section>
                    </>
                  )}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>

      {interviewOpen && (
        <InterviewScheduleModal
          application={application}
          open={interviewOpen}
          onOpenChange={setInterviewOpen}
          onSuccess={() => { setInterviewOpen(false); onActionComplete() }}
        />
      )}
      {offerOpen && (
        <OfferLetterModal
          application={application}
          open={offerOpen}
          onOpenChange={setOfferOpen}
          onSuccess={() => { setOfferOpen(false); onActionComplete() }}
        />
      )}
    </Dialog.Root>
  )
}
