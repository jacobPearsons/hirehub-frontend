import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useApp } from '../../context/AppContext'
import type { AppUser } from '../../context/AuthContext'
import { updateProfile } from '../../api/auth'
import { Input } from '../ui/Input'

const basicsSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be under 100 characters'),
  headline: z.string().max(120, 'Headline must be under 120 characters').optional(),
  location: z.string().max(100, 'Location must be under 100 characters').optional(),
})

type BasicsFormData = z.infer<typeof basicsSchema>

interface SeekerBasicsStepProps {
  onSaved: () => void
}

export function SeekerBasicsStep({ onSaved }: SeekerBasicsStepProps) {
  const { user, setUser } = useApp()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BasicsFormData>({
    resolver: zodResolver(basicsSchema),
    defaultValues: {
      name: user?.name ?? '',
      headline: user?.headline ?? '',
      location: user?.location ?? '',
    },
  })

  const onSubmit = async (data: BasicsFormData) => {
    setError('')
    try {
      await updateProfile({
        name: data.name,
        headline: data.headline,
        location: data.location,
      })
      setUser({ ...user, name: data.name, headline: data.headline, location: data.location } as AppUser)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save your basics')
    }
  }

  return (
    <form id="onboarding-step" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <p role="alert" className="text-sm text-error bg-error/10 px-3 py-2 rounded-md">{error}</p>}
      <Input label="Name" placeholder="Your full name" error={errors.name?.message} {...register('name')} />
      <Input label="Headline" placeholder="e.g. Senior React Engineer" error={errors.headline?.message} {...register('headline')} />
      <Input label="Location" placeholder="e.g. Lisbon, Portugal" error={errors.location?.message} {...register('location')} />
      {isSubmitting && <p className="text-sm text-ink-muted">Saving…</p>}
    </form>
  )
}
