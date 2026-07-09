import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePageMeta } from '../../utils/usePageMeta'
import { AuthCard } from './AuthCard'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { login } from '../../api/auth'
import { setAccessToken } from '../../api/client'
import { useApp } from '../../context/AppContext'

export default function LoginPage() {
  {usePageMeta({ title: 'Sign In | HireHub Community', description: 'Sign in to your HireHub account.' })}
  const navigate = useNavigate()
  const { setUser } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(email, password)
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
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your HireHub account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-danger bg-danger/10 px-3 py-2 rounded-md">{error}</p>}
        <Input label="Email" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
        <Input label="Password" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
            <input type="checkbox" className="h-4 w-4 rounded border-hairline text-ink focus:ring-ink/30" />
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
  )
}
