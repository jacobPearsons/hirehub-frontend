import { NavLink, Link, useNavigate } from 'react-router-dom'
import { X, LogOut } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { logout } from '../../api/auth'
import { setAccessToken } from '../../api/client'
import { seekerNavItems, employerNavItems } from './sidebar-constants'

interface SidebarProps {
  mobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

function NavItem({ item, onClick }: { item: { label: string; to: string; icon: React.ComponentType<{ className?: string }> }; onClick?: () => void }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
          isActive
            ? 'bg-accent/10 text-accent'
            : 'text-ink-muted hover:text-ink hover:bg-surface-2'
        }`
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{item.label}</span>
    </NavLink>
  )
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const { user, setUser } = useApp()
  const navigate = useNavigate()

  const navItems = user?.role === 'employer' ? employerNavItems : seekerNavItems

  const handleLogout = async () => {
    try { await logout() } catch {}
    setAccessToken(null)
    setUser(null)
    navigate('/')
    onNavClick?.()
  }

  return (
    <nav className="flex flex-col h-full bg-canvas">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-hairline shrink-0">
        <Link to="/" onClick={onNavClick} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 52" fill="none" className="h-7" aria-hidden="true">
            <rect x="4" y="6" width="40" height="40" rx="8" fill="#ff5600"/>
            <path d="M16 16v20M16 26h16M32 16v20" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
            <text x="54" y="32" fontFamily="Inter, system-ui, sans-serif" fontSize="22" fontWeight="500" fill="currentColor" letterSpacing="-0.3">HireHub</text>
            <text x="54" y="45" fontFamily="Inter, system-ui, sans-serif" fontSize="11" fontWeight="400" fill="currentColor" opacity="0.6">Community</text>
          </svg>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavItem key={item.label} item={item} onClick={onNavClick} />
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-hairline p-3 shrink-0">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5">
            <span className="text-sm text-ink-muted truncate">{user.name}</span>
            <button
              onClick={handleLogout}
              className="ml-auto text-ink-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 rounded"
              aria-label="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export function Sidebar({ mobile, isOpen, onClose }: SidebarProps) {
  if (mobile) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/40" onClick={onClose} />
            <div className="fixed left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-canvas border-r border-hairline shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-4 h-14 border-b border-hairline shrink-0">
                <span className="font-medium text-ink text-sm">Menu</span>
                <button
                  onClick={onClose}
                  className="p-2 text-ink-muted hover:text-ink rounded-lg hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarContent onNavClick={onClose} />
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="hidden md:flex w-56 shrink-0 border-r border-hairline">
      <SidebarContent />
    </div>
  )
}
