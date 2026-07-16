import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { usePageMeta } from '../../utils/usePageMeta'
import { AuthCard } from './AuthCard'
import { SocialAuth } from './SocialAuth'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { register } from '../../api/auth'
import { setAccessToken } from '../../api/client'
import { useApp } from '../../context/AppContext'

export default function SignupPage() {
  const meta = usePageMeta({ title: 'Sign Up | HireHub Community', description: 'Create your HireHub account and start your journey.' })
  const navigate = useNavigate()
  const { setUser } = useApp()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'SEEKER' | 'EMPLOYER'>('SEEKER')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const res = await register({ name: fullName, email, password, role })
      setAccessToken(res.data.accessToken)
      setUser({
        id: res.data.user.id,
        name: res.data.user.name,
        email: res.data.user.email,
        role: res.data.user.role === 'EMPLOYER' ? 'employer' : 'seeker',
        companyName: res.data.user.companyName,
      })
      navigate(res.data.user.role === 'EMPLOYER' ? '/employer/dashboard' : '/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {meta}
      <AuthCard title="Create your account" subtitle="Join HireHub Community today">
        <SocialAuth />
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-error bg-error/10 px-3 py-2 rounded-md">{error}</p>}
          <Input label="Full name" type="text" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} />
          <Input label="Email" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
          <div className="relative">
            <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-ink-tertiary hover:text-ink transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <Input label="Confirm password" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[34px] text-ink-tertiary hover:text-ink transition-colors"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
              <input type="radio" name="role" checked={role === 'SEEKER'} onChange={() => setRole('SEEKER')} className="h-4 w-4 text-ink" />
              Job Seeker
            </label>
            <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
              <input type="radio" name="role" checked={role === 'EMPLOYER'} onChange={() => setRole('EMPLOYER')} className="h-4 w-4 text-ink" />
              Employer
            </label>
          </div>
          <Button type="submit" variant="primary" size="md" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline font-medium">Sign in</Link>
        </p>
      </AuthCard>
    </>
  )
}
