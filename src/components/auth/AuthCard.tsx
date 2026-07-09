import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AuthCardProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 relative overflow-hidden bg-canvas">
      <div className="absolute inset-0 opacity-30">
        <img
          src="/auth-bg.png"
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-canvas/60 via-canvas/20 to-canvas/80" />
      </div>
      <div className="relative max-w-md w-full bg-surface-1/95 backdrop-blur-sm rounded-lg p-8">
        <Link to="/" className="inline-block mb-6">
          <svg viewBox="0 0 220 52" fill="none" className="h-7 text-ink" aria-label="HireHub">
            <rect x="4" y="6" width="40" height="40" rx="8" fill="#ff5600"/>
            <path d="M16 16v20M16 26h16M32 16v20" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
            <text x="54" y="32" fontFamily="Inter, system-ui, sans-serif" fontSize="22" fontWeight="500" fill="currentColor" letterSpacing="-0.3">HireHub</text>
            <text x="54" y="45" fontFamily="Inter, system-ui, sans-serif" fontSize="11" fontWeight="400" fill="currentColor" opacity="0.6">Community</text>
          </svg>
        </Link>
        <h1 className="text-[28px] font-medium mb-1">{title}</h1>
        {subtitle && <p className="text-sm text-ink-muted mb-6">{subtitle}</p>}
        {children}
      </div>
    </div>
  )
}
