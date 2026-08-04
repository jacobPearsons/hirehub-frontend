import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { ApplyJobForm } from './ApplyJobForm'
import { ApplyLanding } from './ApplyLanding'
import { useApp } from '../../context/AppContext'
import type { Job } from '../../data/jobs'

interface ApplyJobModalProps {
  job: Job
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ApplyJobModal({ job, open, onOpenChange }: ApplyJobModalProps) {
  const { user } = useApp()
  const [success, setSuccess] = useState(false)
  const [submittedFileName, setSubmittedFileName] = useState<string | undefined>()
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeFileName, setResumeFileName] = useState<string | null>(null)
  const [prevOpen, setPrevOpen] = useState(open)

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (!open) {
      setSuccess(false)
      setSubmittedFileName(undefined)
    }
  }

  function handleSuccess(filename?: string) {
    setSubmittedFileName(filename)
    setResumeFile(null)
    setResumeFileName(null)
    setSuccess(true)
  }

  function handleClose() {
    setSuccess(false)
    setSubmittedFileName(undefined)
    onOpenChange(false)
  }

  function handleResumeChange(file: File | null, name: string | null) {
    setResumeFile(file)
    setResumeFileName(name)
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
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
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-surface-1 rounded-xl p-6 w-full max-w-lg shadow-xl border border-hairline"
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.96 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title className="text-lg font-semibold text-ink">
                      Apply for {job.title}
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button
                        className="p-1 rounded-md text-ink-tertiary hover:text-ink hover:bg-surface-2 transition-colors"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </Dialog.Close>
                  </div>

                  {success ? (
                    <ApplyLanding job={job} user={user} resumeFileName={submittedFileName} />
                  ) : (
                    <ApplyJobForm
                      job={job}
                      onSuccess={handleSuccess}
                      resumeFile={resumeFile}
                      resumeFileName={resumeFileName}
                      onResumeChange={handleResumeChange}
                    />
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
