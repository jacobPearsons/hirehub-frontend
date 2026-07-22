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
import { sendOfferLetter } from '../../api/emails'
import { useApplications } from '../../context/ApplicationsContext'
import type { Application } from '../../types/application'


const offerSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required'),
  employmentType: z.enum(['full-time', 'part-time', 'contract']),
  startDate: z.string().min(1, 'Start date is required'),
  hourlyRate: z.number().min(0, 'Rate must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  schedule: z.string().min(1, 'Schedule is required'),
  managerName: z.string().min(1, 'Manager name is required'),
  managerTitle: z.string().min(1, 'Manager title is required'),
  responsibilities: z.string().min(1, 'Responsibilities are required'),
  contingencies: z.string().min(1, 'Contingencies are required'),
  expirationDate: z.string().min(1, 'Expiration date is required'),
})

type OfferFormData = z.infer<typeof offerSchema>

interface OfferLetterModalProps {
  application: Application
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function OfferLetterModal({
  application,
  open,
  onOpenChange,
  onSuccess,
}: OfferLetterModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useToast()
  const { updateApplicationOffer } = useApplications()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      jobTitle: application.jobTitle,
      employmentType: 'full-time',
      startDate: '',
      hourlyRate: 0,
      currency: 'USD',
      schedule: '',
      managerName: '',
      managerTitle: '',
      responsibilities: '',
      contingencies: '',
      expirationDate: '',
    },
  })

  function handleClose() {
    reset()
    onOpenChange(false)
  }

  const onSubmit = async (data: OfferFormData) => {
    setSubmitting(true)
    try {
      await updateApplicationStatus(application.id, 'offer')

      const offerDetails = {
        jobTitle: data.jobTitle,
        employmentType: data.employmentType,
        startDate: data.startDate,
        hourlyRate: data.hourlyRate,
        currency: data.currency,
        schedule: data.schedule,
        managerName: data.managerName,
        managerTitle: data.managerTitle,
        responsibilities: data.responsibilities.split('\n').filter(r => r.trim()),
        contingencies: data.contingencies.split('\n').filter(c => c.trim()),
        expirationDate: data.expirationDate,
      }

      await updateApplicationOffer(application.id, offerDetails)

      sendOfferLetter({
        to: application.applicantEmail,
        candidateName: application.applicantName,
        jobTitle: data.jobTitle,
        employmentType: data.employmentType,
        startDate: data.startDate,
        hourlyRate: String(data.hourlyRate),
        currency: data.currency,
        schedule: data.schedule,
        managerName: data.managerName,
        managerTitle: data.managerTitle,
        expirationDate: data.expirationDate,
      }).catch(() => {})

      showToast('success', `Offer letter sent to ${application.applicantName}`)
      handleClose()
      onSuccess()
    } catch {
      showToast('error', 'Failed to create offer letter. Please try again.')
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
                  className="bg-surface-1 rounded-xl p-6 w-full max-w-lg shadow-xl border border-hairline max-h-[85vh] overflow-y-auto"
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.96 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title className="text-lg font-semibold text-ink">
                      Create Offer Letter — {application.applicantName}
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
                    <Input
                      label="Job Title"
                      placeholder="Software Engineer"
                      error={errors.jobTitle?.message}
                      {...register('jobTitle')}
                    />

                    <div>
                      <label className="block text-sm font-medium text-ink mb-1">Employment Type</label>
                      <select
                        {...register('employmentType')}
                        className="w-full rounded-md border border-hairline bg-surface-1 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
                      >
                        <option value="full-time">Full-Time</option>
                        <option value="part-time">Part-Time</option>
                        <option value="contract">Contract</option>
                      </select>
                    </div>

                    <Input
                      label="Start Date"
                      type="date"
                      error={errors.startDate?.message}
                      {...register('startDate')}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Hourly Rate"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        error={errors.hourlyRate?.message}
                        {...register('hourlyRate', { valueAsNumber: true })}
                      />
                      <Input
                        label="Currency"
                        placeholder="USD"
                        error={errors.currency?.message}
                        {...register('currency')}
                      />
                    </div>

                    <Input
                      label="Schedule"
                      placeholder="Monday to Friday, 9:00 AM – 5:00 PM"
                      error={errors.schedule?.message}
                      {...register('schedule')}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Manager Name"
                        placeholder="Jane Smith"
                        error={errors.managerName?.message}
                        {...register('managerName')}
                      />
                      <Input
                        label="Manager Title"
                        placeholder="Engineering Manager"
                        error={errors.managerTitle?.message}
                        {...register('managerTitle')}
                      />
                    </div>

                    <Textarea
                      label="Key Responsibilities"
                      rows={4}
                      placeholder={"One responsibility per line:\nDesign and build features\nCode reviews\nMentor junior developers"}
                      error={errors.responsibilities?.message}
                      {...register('responsibilities')}
                    />

                    <Textarea
                      label="Contingencies"
                      rows={3}
                      placeholder={"One contingency per line:\nBackground check\nDrug screening"}
                      error={errors.contingencies?.message}
                      {...register('contingencies')}
                    />

                    <Input
                      label="Offer Expiration Date"
                      type="date"
                      error={errors.expirationDate?.message}
                      {...register('expirationDate')}
                    />

                    <Button
                      variant="accent"
                      size="lg"
                      className="w-full"
                      type="submit"
                      disabled={submitting}
                    >
                      {submitting ? 'Sending Offer...' : 'Send Offer Letter'}
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
