import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Textarea, Button } from '../ui'
import { useToast } from '../ui/Toast'
import { updateApplicationStatus } from '../../api/applications'
import { sendInterviewInvitation } from '../../api/emails'
import type { Application } from '../../types/application'


const interviewSchema = z.object({
  interviewType: z.enum(['phone', 'video', 'in-person']),
  interviewDate: z.string().min(1, 'Date is required'),
  interviewTime: z.string().min(1, 'Time is required'),
  interviewerName: z.string().min(1, 'Interviewer name is required'),
  interviewerTitle: z.string().min(1, 'Interviewer title is required'),
  meetingLink: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  meetingLocation: z.string().optional(),
  notes: z.string().optional(),
})

type InterviewFormData = z.infer<typeof interviewSchema>

interface InterviewScheduleModalProps {
  application: Application
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function InterviewScheduleModal({
  application,
  open,
  onOpenChange,
  onSuccess,
}: InterviewScheduleModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<InterviewFormData>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      interviewType: 'video',
      interviewDate: '',
      interviewTime: '',
      interviewerName: '',
      interviewerTitle: '',
      meetingLink: '',
      meetingLocation: '',
      notes: '',
    },
  })

  const interviewType = watch('interviewType')

  function handleClose() {
    reset()
    onOpenChange(false)
  }

  const onSubmit = async (data: InterviewFormData) => {
    setSubmitting(true)
    try {
      await updateApplicationStatus(application.id, 'interviewing')

      sendInterviewInvitation({
        to: application.applicantEmail,
        candidateName: application.applicantName,
        jobTitle: application.jobTitle,
        interviewType: data.interviewType,
        interviewDate: data.interviewDate,
        interviewTime: data.interviewTime,
        interviewerName: data.interviewerName,
        interviewerTitle: data.interviewerTitle,
        meetingLink: data.meetingLink || '',
        meetingLocation: data.meetingLocation || '',
      }).catch(() => {})

      showToast('success', `Interview scheduled for ${application.applicantName}`)
      handleClose()
      onSuccess()
    } catch {
      showToast('error', 'Failed to schedule interview. Please try again.')
    } finally {
      setSubmitting(false)
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
                      Schedule Interview — {application.applicantName}
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

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1">Interview Type</label>
                      <select
                        {...register('interviewType')}
                        className="w-full rounded-md border border-hairline bg-surface-1 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
                      >
                        <option value="video">Video</option>
                        <option value="phone">Phone</option>
                        <option value="in-person">In-Person</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Date"
                        type="date"
                        error={errors.interviewDate?.message}
                        {...register('interviewDate')}
                      />
                      <Input
                        label="Time"
                        type="time"
                        error={errors.interviewTime?.message}
                        {...register('interviewTime')}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Interviewer Name"
                        placeholder="Jane Smith"
                        error={errors.interviewerName?.message}
                        {...register('interviewerName')}
                      />
                      <Input
                        label="Interviewer Title"
                        placeholder="Engineering Manager"
                        error={errors.interviewerTitle?.message}
                        {...register('interviewerTitle')}
                      />
                    </div>

                    {interviewType === 'video' && (
                      <Input
                        label="Meeting Link"
                        placeholder="https://meet.google.com/abc-defg-hij"
                        error={errors.meetingLink?.message}
                        {...register('meetingLink')}
                      />
                    )}

                    {interviewType === 'in-person' && (
                      <Input
                        label="Meeting Location"
                        placeholder="123 Main St, Suite 100"
                        error={errors.meetingLocation?.message}
                        {...register('meetingLocation')}
                      />
                    )}

                    <Textarea
                      label="Notes (optional)"
                      id="notes"
                      rows={3}
                      placeholder="Any additional notes for the candidate..."
                      {...register('notes')}
                    />

                    <Button
                      variant="accent"
                      size="lg"
                      className="w-full"
                      type="submit"
                      disabled={submitting}
                    >
                      {submitting ? 'Scheduling...' : 'Schedule Interview'}
                    </Button>
                  </form>
                </motion.div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
