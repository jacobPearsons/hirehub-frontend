import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react'
import { setAccessToken as setApiToken, getAccessToken } from '../api/client'
import { getMe, refreshToken } from '../api/auth'

export interface AppUser {
  id: string
  name: string
  email: string
  role: 'seeker' | 'employer' | 'admin'
  companyName?: string
  phone?: string | null
  bio?: string | null
  avatarUrl?: string | null
  headline?: string | null
  location?: string | null
  skills?: string[]
  resumePath?: string | null
  resumeFileName?: string | null
  salaryMin?: number | null
  salaryMax?: number | null
  currency?: string | null
  remoteOnly?: boolean | null
  employmentType?: string | null
  onboardingCompleted?: boolean
}

interface AuthContextValue {
  user: AppUser | null
  loading: boolean
  setUser: (user: AppUser | null) => void
  setLoading: (val: boolean) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function mapApiUser(user: {
  id: string
  name: string
  email: string
  role: string
  companyName?: string
  phone?: string | null
  bio?: string | null
  avatarUrl?: string | null
  headline?: string | null
  location?: string | null
  skills?: string[]
  resumePath?: string | null
  resumeFileName?: string | null
  salaryMin?: number | null
  salaryMax?: number | null
  currency?: string | null
  remoteOnly?: boolean | null
  employmentType?: string | null
  onboardingCompleted?: boolean
}): AppUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role === 'EMPLOYER' ? 'employer' : user.role === 'ADMIN' ? 'admin' : 'seeker',
    companyName: user.companyName,
    phone: user.phone,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    headline: user.headline,
    location: user.location,
    skills: user.skills,
    resumePath: user.resumePath,
    resumeFileName: user.resumeFileName,
    salaryMin: user.salaryMin,
    salaryMax: user.salaryMax,
    currency: user.currency,
    remoteOnly: user.remoteOnly,
    employmentType: user.employmentType,
    onboardingCompleted: user.onboardingCompleted,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(() => {
    const stored = localStorage.getItem('hirehub-auth')
    if (stored) {
      try {
        return JSON.parse(stored) as AppUser
      } catch {
        localStorage.removeItem('hirehub-auth')
      }
    }
    return null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    async function init() {
      if (!getAccessToken()) {
        try {
          const refreshRes = await refreshToken()
          if (refreshRes.success) {
            setApiToken(refreshRes.data.accessToken)
          }
        } catch {
          // No valid refresh cookie — user must log in
        }
      }

      const token = getAccessToken()

      if (token) {
        try {
          const res = await getMe()
          if (!controller.signal.aborted) {
            const user = mapApiUser(res.data)
            setUser(user)
            localStorage.setItem('hirehub-auth', JSON.stringify(user))
            setLoading(false)
            return // Exit here — API data is authoritative
          }
        } catch {
          if (!controller.signal.aborted) {
            setApiToken(null)
            setUser(null)
          }
        }
      }

      if (!controller.signal.aborted) {
        setLoading(false)
      }
    }

    init()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (user) {
      localStorage.setItem('hirehub-auth', JSON.stringify(user))
    } else {
      localStorage.removeItem('hirehub-auth')
    }
  }, [user])

  const value = useMemo(
    () => ({ user, loading, setUser, setLoading }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
