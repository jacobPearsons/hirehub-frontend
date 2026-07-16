import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { usePageMeta } from '../../utils/usePageMeta'
import { AuthCard } from './AuthCard'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { forgotPassword } from '../../api/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  {usePageMeta({ title: 'Forgot Password | HireHub Community', description: 'Reset your password and regain access to your account.' })}

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthCard title="Check your email">
        <div className="text-center">
          <CheckCircle aria-hidden="true" className="h-12 w-12 text-success mx-auto mb-4" />
          <h2 className="text-xl font-medium text-ink mb-2">Check your email</h2>
          <p className="text-sm text-ink-muted mb-6">
            We've sent a password reset link to your email address.
          </p>
          <p className="mt-6 text-center text-sm text-ink-muted">
            <Link to="/login" className="text-accent hover:underline font-medium">Back to sign in</Link>
          </p>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Reset your password">
      <p className="text-sm text-ink-muted mb-6">Enter your email and we'll send you a reset link.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-error bg-error/10 px-3 py-2 rounded-md">{error}</p>}
        <Input label="Email" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
        <Button type="submit" variant="primary" size="md" className="w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-muted">
        <Link to="/login" className="text-accent hover:underline font-medium">Back to sign in</Link>
      </p>
    </AuthCard>
  )
}
