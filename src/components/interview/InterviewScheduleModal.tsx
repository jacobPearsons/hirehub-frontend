import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Input, Textarea, Button } from '../ui'
import { useToast } from '../ui/Toast'
import { sendInterviewInvitation } from '../../api/emails'
import { openInterviewConversation } from '../../api/messages'
import { useApplications } from '../../context/ApplicationsContext'
import { useApp } from '../../context/AppContext'
import { useJob } from '../../hooks/useJob'
import type { Application } from '../../types/application'

const interviewSchema = z.object({
  interviewType: z.enum(['phone', 'video', 'website-chat']),
  interviewDate: z.string().min(1, 'Date is required'),
  interviewTime: z.string().min(1, 'Time is required'),
  interviewerName: z.string().min(1, 'Interviewer name is required'),
  interviewerTitle: z.string().min(1, 'Interviewer title is required'),
  meetingLink: z.string().url('Must be a valid URL').optional().or(z.literal('')),
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
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[] | null>(null)
  const { showToast } = useToast()
  const { user } = useApp()
  const navigate = useNavigate()
  const { updateApplicationInterview, updateApplicationStatus } = useApplications()
  const { data: job } = useJob(application.jobId)

  const {
    register,
    handleSubmit,
    control,
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
      notes: '',
    },
  })

  const interviewType = useWatch({ control, name: 'interviewType' })
  const questionOptions = (interviewType === 'website-chat' ? job?.screeningQuestions : undefined) ?? []

  function handleClose() {
    reset()
    onOpenChange(false)
  }

  const onSubmit = async (data: InterviewFormData) => {
    setSubmitting(true)
    try {
      if (data.interviewType === 'website-chat') {
        const selectedIds = selectedQuestionIds ?? questionOptions.map((q) => q.id)
        const questions = questionOptions
          .filter((q) => selectedIds.includes(q.id))
          .map((q) => ({ id: q.id, prompt: q.prompt }))

        await updateApplicationInterview(application.id, {
          interviewType: 'website-chat',
          interviewDate: data.interviewDate,
          interviewTime: data.interviewTime,
          interviewerName: data.interviewerName,
          interviewerTitle: data.interviewerTitle,
          notes: data.notes || undefined,
          scheduledAt: new Date().toISOString(),
          questions,
        })

        await updateApplicationStatus(application.id, 'interviewing')

        const { data: conversationRes } = await openInterviewConversation(application.id)
        const base = user?.role === 'employer' ? '/employer/dashboard' : '/dashboard'
        navigate(`${base}?tab=messages&conv=${conversationRes.conversation.id}`)
        return
      }

      await updateApplicationStatus(application.id, 'interviewing')

      const interviewDetails = {
        interviewType: data.interviewType,
        interviewDate: data.interviewDate,
        interviewTime: data.interviewTime,
        interviewerName: data.interviewerName,
        interviewerTitle: data.interviewerTitle,
        meetingLink: data.meetingLink || undefined,
        notes: data.notes || undefined,
        scheduledAt: new Date().toISOString(),
      }

      await updateApplicationInterview(application.id, interviewDetails)

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
                        {...register('interviewType', { onChange: () => setSelectedQuestionIds(null) })}
                        className="w-full rounded-md border border-hairline bg-surface-1 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
                      >
                        <option value="video">Video</option>
                        <option value="phone">Phone</option>
                        <option value="website-chat">Website Chat</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    {interviewType === 'website-chat' && questionOptions.length > 0 && (
                      <div>
                        <p className="block text-sm font-medium text-ink mb-1">Interview Questions</p>
                        <div className="space-y-2 rounded-md border border-hairline bg-surface-1 p-3">
                          {questionOptions.map((question) => {
                            const checked = selectedQuestionIds === null || selectedQuestionIds.includes(question.id)
                            return (
                              <label key={question.id} className="flex items-start gap-2 text-sm text-ink">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    setSelectedQuestionIds((prev) => {
                                      const base = prev ?? questionOptions.map((q) => q.id)
                                      return base.includes(question.id)
                                        ? base.filter((id) => id !== question.id)
                                        : [...base, question.id]
                                    })
                                  }
                                  className="mt-0.5 rounded border-hairline text-accent focus-visible:ring-2 focus-visible:ring-ink/30"
                                />
                                <span>{question.prompt}</span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
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
