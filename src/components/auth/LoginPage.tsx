import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { usePageMeta } from '../../utils/usePageMeta'
import { AuthCard } from './AuthCard'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { login } from '../../api/auth'
import { setAccessToken } from '../../api/client'
import { mapApiUser } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'

export default function LoginPage() {
  const meta = usePageMeta({ title: 'Sign In | HireHub Community', description: 'Sign in to your HireHub account.' })
  const navigate = useNavigate()
  const { setUser } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(email, password)
      setAccessToken(res.data.accessToken)
      setUser(mapApiUser(res.data.user))
      navigate(
        res.data.user.role === 'EMPLOYER' ? '/employer/dashboard'
        : res.data.user.role === 'ADMIN' ? '/admin'
        : '/dashboard',
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {meta}
      <AuthCard title="Welcome back" subtitle="Sign in to your HireHub account">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-error bg-error/10 px-3 py-2 rounded-md">{error}</p>}
          <Input label="Email" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
          <div className="relative">
            <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-ink-tertiary hover:text-ink transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
              <input type="checkbox" className="h-4 w-4 rounded border-hairline text-ink focus-visible:ring-2 focus-visible:ring-ink/40" />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-sm text-accent hover:underline">Forgot password?</Link>
          </div>
          <Button type="submit" variant="primary" size="md" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-muted">
          Don't have an account?{' '}
          <Link to="/signup" className="text-accent hover:underline font-medium">Sign up</Link>
        </p>
      </AuthCard>
    </>
  )
}
