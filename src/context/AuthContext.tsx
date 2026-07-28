import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react'
import { setAccessToken as setApiToken, getAccessToken } from '../api/client'
import { getMe } from '../api/auth'

export interface AppUser {
  id: string
  name: string
  email: string
  role: 'seeker' | 'employer'
  companyName?: string
  phone?: string | null
  bio?: string | null
  avatarUrl?: string | null
}

interface AuthContextValue {
  user: AppUser | null
  loading: boolean
  setUser: (user: AppUser | null) => void
  setLoading: (val: boolean) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function mapApiUser(user: { id: string; name: string; email: string; role: string; companyName?: string; phone?: string | null; bio?: string | null; avatarUrl?: string | null }): AppUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role === 'EMPLOYER' ? 'employer' : 'seeker',
    companyName: user.companyName,
    phone: user.phone,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    async function init() {
      const token = getAccessToken()

      if (token) {
        try {
          const res = await getMe()
          if (!controller.signal.aborted) {
            const user = mapApiUser(res.data)
            setUser(user)
            localStorage.setItem('hirehub-auth', JSON.stringify(user))
            return // Exit here — API data is authoritative
          }
        } catch {
          if (!controller.signal.aborted) {
            setApiToken(null)
          }
          // Fall through to localStorage fallback
        }
      }

      // Fallback: try cached user from localStorage
      try {
        const saved = localStorage.getItem('hirehub-auth')
        if (saved && !controller.signal.aborted) {
          setUser(JSON.parse(saved))
        }
      } catch { /* ignore parse errors */ }

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
