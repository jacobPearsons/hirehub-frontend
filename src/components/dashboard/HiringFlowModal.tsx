import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Check, Clock, Calendar } from 'lucide-react'
import { InterviewDetails } from '../interview/InterviewDetails'
import type { Application, ApplicationStatus } from '../../types/application'

const STAGES: { key: ApplicationStatus; label: string; description: string }[] = [
  { key: 'applied', label: 'Applied', description: 'Your application has been received by the employer.' },
  { key: 'reviewing', label: 'Under Review', description: 'The hiring team is reviewing your profile and resume.' },
  { key: 'interviewing', label: 'Interviewing', description: 'Selected candidates move on to interviews.' },
  { key: 'offer', label: 'Offer', description: 'The employer has extended an offer.' },
]

const STATUS_ORDER: Record<ApplicationStatus, number> = {
  applied: 0,
  reviewing: 1,
  interviewing: 2,
  rejected: 2,
  offer: 3,
}

interface HiringFlowModalProps {
  application: Application
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HiringFlowModal({ application, open, onOpenChange }: HiringFlowModalProps) {
  const currentIdx = STATUS_ORDER[application.status] ?? 0

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
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-surface-1 rounded-xl p-6 w-full max-w-lg shadow-xl border border-hairline max-h-[85vh] overflow-y-auto"
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.96 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title className="text-lg font-semibold text-ink">
                      Hiring Flow — {application.jobTitle}
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button
                        className="p-1 rounded-md text-ink-tertiary hover:text-ink hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <p className="text-sm text-ink-muted mb-6">
                    We’ll keep you updated here at every stage of the process. No chasing required.
                  </p>

                  <ol className="space-y-0">
                    {STAGES.map((stage, i) => {
                      const isReached = i <= currentIdx
                      const isCurrent = i === currentIdx && application.status !== 'rejected'
                      return (
                        <li key={stage.key} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <span
                              className={`flex items-center justify-center w-8 h-8 rounded-full border transition-colors ${
                                isReached
                                  ? 'bg-accent/10 border-accent text-accent'
                                  : 'border-hairline text-ink-tertiary'
                              }`}
                            >
                              {isReached ? <Check className="w-4 h-4" aria-hidden="true" /> : <Clock className="w-4 h-4" aria-hidden="true" />}
                            </span>
                            {i < STAGES.length - 1 && (
                              <span className={`w-px flex-1 min-h-6 ${isReached ? 'bg-accent/30' : 'bg-hairline'}`} />
                            )}
                          </div>
                          <div className="pb-6">
                            <p className={`text-sm font-medium ${isCurrent ? 'text-accent' : isReached ? 'text-ink' : 'text-ink-muted'}`}>
                              {stage.label}
                              {isCurrent && <span className="ml-2 text-xs text-accent">Current</span>}
                            </p>
                            <p className="text-xs text-ink-muted mt-0.5">{stage.description}</p>
                          </div>
                        </li>
                      )
                    })}
                  </ol>

                  {application.status === 'rejected' && (
                    <p className="mt-2 text-sm text-error bg-error/10 px-3 py-2 rounded-md">
                      This application was not advanced. We encourage you to keep applying — new roles are posted weekly.
                    </p>
                  )}

                  {application.status === 'interviewing' && application.interviewDetails && (
                    <div className="mt-2 pt-4 border-t border-hairline">
                      <p className="flex items-center gap-1.5 text-sm font-medium text-ink mb-2">
                        <Calendar className="w-4 h-4 text-accent" aria-hidden="true" /> Upcoming interview
                      </p>
                      <InterviewDetails details={application.interviewDetails} />
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
