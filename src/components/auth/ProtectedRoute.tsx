import { Navigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('seeker' | 'employer')[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useApp()

  if (loading) return null

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
