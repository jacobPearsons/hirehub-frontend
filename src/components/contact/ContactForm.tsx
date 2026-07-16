import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle } from 'lucide-react'
import { Input, Textarea } from '../ui'
import { Button } from '../ui/Button'
import { submitContact } from '../../api/contact'
import { contactSchema, type ContactFormData } from '../../schemas/auth'

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setError('')
    try {
      await submitContact(data)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center py-16">
        <CheckCircle className="w-12 h-12 text-success mb-4" aria-hidden="true" />
        <h2 className="text-2xl font-medium text-ink mb-2">Thanks for reaching out!</h2>
        <p className="text-ink-muted">We'll get back to you within 24 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && <p role="alert" className="text-sm text-error bg-error/10 px-3 py-2 rounded-md mb-4">{error}</p>}
      <Input label="Name" placeholder="Your name" error={errors.name?.message} {...register('name')} />
      <div className="mt-4">
        <Input label="Email" type="email" placeholder="your@email.com" error={errors.email?.message} {...register('email')} />
      </div>
      <div className="mt-4">
        <Input label="Subject" placeholder="What's this about?" error={errors.subject?.message} {...register('subject')} />
      </div>
      <div className="mt-4">
        <Textarea label="Message" placeholder="Your message..." className="min-h-[120px]" error={errors.message?.message} {...register('message')} />
      </div>
      <div className="mt-4">
        <Button variant="primary" size="lg" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send message'}
        </Button>
      </div>
    </form>
  )
}
