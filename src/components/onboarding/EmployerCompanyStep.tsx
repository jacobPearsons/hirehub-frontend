import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useApp } from '../../context/AppContext'
import type { AppUser } from '../../context/AuthContext'
import { upsertCompany } from '../../api/company'
import { Input } from '../ui/Input'

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(200, 'Company name must be under 200 characters'),
  website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  industry: z.string().optional(),
  size: z.string().optional(),
})

type CompanyFormData = z.infer<typeof companySchema>

interface EmployerCompanyStepProps {
  onSaved: () => void
}

export function EmployerCompanyStep({ onSaved }: EmployerCompanyStepProps) {
  const { user, setUser } = useApp()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: user?.companyName ?? '',
    },
  })

  const onSubmit = async (data: CompanyFormData) => {
    setError('')
    try {
      await upsertCompany({
        name: data.name,
        website: data.website || undefined,
        industry: data.industry || undefined,
        size: data.size || undefined,
      })
      setUser({ ...user, companyName: data.name } as AppUser)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save your company')
    }
  }

  return (
    <form id="onboarding-step" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <p role="alert" className="text-sm text-error bg-error/10 px-3 py-2 rounded-md">{error}</p>}
      <Input label="Company name" placeholder="Acme Inc" error={errors.name?.message} {...register('name')} />
      <Input label="Website" placeholder="https://acme.com" error={errors.website?.message} {...register('website')} />
      <Input label="Industry" placeholder="e.g. Software" error={errors.industry?.message} {...register('industry')} />
      <Input label="Company size" placeholder="e.g. 11-50" error={errors.size?.message} {...register('size')} />
      {isSubmitting && <p className="text-sm text-ink-muted">Saving…</p>}
    </form>
  )
}
