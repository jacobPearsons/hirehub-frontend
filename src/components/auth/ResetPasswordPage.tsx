import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { usePageMeta } from '../../utils/usePageMeta'
import { AuthCard } from './AuthCard'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { resetPassword } from '../../api/auth'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  {usePageMeta({ title: 'Reset Password | HireHub Community', description: 'Set a new password for your account.' })}

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await resetPassword(token, newPassword)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthCard title="Invalid reset link">
        <p className="text-sm text-ink-muted mb-6">This password reset link is invalid or has expired.</p>
        <p className="text-center">
          <Link to="/forgot-password" className="text-accent hover:underline font-medium">Request a new reset link</Link>
        </p>
      </AuthCard>
    )
  }

  if (success) {
    return (
      <AuthCard title="Password reset">
        <div className="text-center">
          <CheckCircle aria-hidden="true" className="h-12 w-12 text-success mx-auto mb-4" />
          <h2 className="text-xl font-medium text-ink mb-2">Password reset successful</h2>
          <p className="text-sm text-ink-muted mb-6">Your password has been reset successfully.</p>
          <Link to="/login" className="text-accent hover:underline font-medium">Back to sign in</Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Set new password">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-danger bg-danger/10 px-3 py-2 rounded-md">{error}</p>}
        <Input label="New password" type="password" placeholder="Enter new password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
        <Input label="Confirm password" type="password" placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        <p className="text-sm text-ink-muted">At least 8 characters</p>
        <Button type="submit" variant="primary" size="md" className="w-full" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset password'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-muted">
        <Link to="/login" className="text-accent hover:underline font-medium">Back to sign in</Link>
      </p>
    </AuthCard>
  )
}
