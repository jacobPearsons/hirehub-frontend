import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useApp } from '../../context/AppContext'
import type { AppUser } from '../../context/AuthContext'
import { updateProfile, type ProfileUpdate } from '../../api/auth'

const optionalNumber = z.preprocess(
  (v) => (v === '' || v == null ? undefined : Number(v)),
  z.number().min(0, 'Salary must be 0 or more').optional(),
)

const preferencesSchema = z.object({
  remoteOnly: z.boolean().optional(),
  salaryMin: optionalNumber,
  salaryMax: optionalNumber,
  currency: z.string().optional(),
  employmentType: z.string().optional(),
})

type PreferencesFormData = z.input<typeof preferencesSchema>

const CURRENCIES = ['USD', 'EUR', 'GBP']
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship']

interface SeekerPreferencesStepProps {
  onSaved: () => void
}

export function SeekerPreferencesStep({ onSaved }: SeekerPreferencesStepProps) {
  const { user, setUser } = useApp()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      remoteOnly: user?.remoteOnly ?? false,
      salaryMin: user?.salaryMin ?? '',
      salaryMax: user?.salaryMax ?? '',
      currency: user?.currency ?? '',
      employmentType: user?.employmentType ?? '',
    },
  })

  const onSubmit = async (data: PreferencesFormData) => {
    setError('')
    const payload: ProfileUpdate = {}
    if (data.remoteOnly) payload.remoteOnly = true
    if (typeof data.salaryMin === 'number') payload.salaryMin = data.salaryMin
    if (typeof data.salaryMax === 'number') payload.salaryMax = data.salaryMax
    if (data.currency) payload.currency = data.currency
    if (data.employmentType) payload.employmentType = data.employmentType
    try {
      await updateProfile(payload)
      setUser({ ...user, ...payload } as AppUser)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save your preferences')
    }
  }

  const selectClass = 'w-full px-3 py-2.5 rounded-md border border-hairline bg-surface-1 text-ink placeholder:text-ink-tertiary outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ink/40'

  return (
    <form id="onboarding-step" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <p role="alert" className="text-sm text-error bg-error/10 px-3 py-2 rounded-md">{error}</p>}
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" className="w-4 h-4 accent-ink" {...register('remoteOnly')} />
        <span className="text-sm font-medium text-ink">Remote only</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="salary-min" className="block text-sm font-medium text-ink mb-1">Minimum salary</label>
          <input
            id="salary-min"
            type="number"
            min={0}
            placeholder="60000"
            aria-invalid={errors.salaryMin ? 'true' : undefined}
            className={selectClass}
            {...register('salaryMin')}
          />
          {errors.salaryMin?.message && <p role="alert" className="mt-1 text-sm text-error">{errors.salaryMin.message}</p>}
        </div>
        <div>
          <label htmlFor="salary-max" className="block text-sm font-medium text-ink mb-1">Maximum salary</label>
          <input
            id="salary-max"
            type="number"
            min={0}
            placeholder="120000"
            aria-invalid={errors.salaryMax ? 'true' : undefined}
            className={selectClass}
            {...register('salaryMax')}
          />
          {errors.salaryMax?.message && <p role="alert" className="mt-1 text-sm text-error">{errors.salaryMax.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-ink mb-1">Currency</label>
          <select id="currency" className={selectClass} {...register('currency')}>
            <option value="">Not set</option>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="employment-type" className="block text-sm font-medium text-ink mb-1">Employment type</label>
          <select id="employment-type" className={selectClass} {...register('employmentType')}>
            <option value="">Not set</option>
            {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      {isSubmitting && <p className="text-sm text-ink-muted">Saving…</p>}
    </form>
  )
}
