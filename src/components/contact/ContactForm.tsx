import { useState, type FormEvent } from 'react'
import { CheckCircle } from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { submitContact } from '../../api/contact'

export function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await submitContact({ name, email, subject, message })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setLoading(false)
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
    <form onSubmit={handleSubmit}>
      {error && <p className="text-sm text-danger bg-danger/10 px-3 py-2 rounded-md mb-4">{error}</p>}
      <Input label="Name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
      <div className="mt-4">
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
      </div>
      <div className="mt-4">
        <Input label="Subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="What's this about?" />
      </div>
      <div className="flex flex-col gap-1.5 mt-4">
        <label htmlFor="contact-message" className="text-sm font-medium text-ink">Message</label>
        <textarea id="contact-message" value={message} onChange={e => setMessage(e.target.value)} placeholder="Your message..."
          className="w-full rounded-md border border-hairline bg-surface-1 text-ink placeholder:text-ink-tertiary outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink px-3 py-2.5 text-sm min-h-[120px]" />
      </div>
      <div className="mt-4">
        <Button variant="primary" size="lg" type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send message'}
        </Button>
      </div>
    </form>
  )
}
