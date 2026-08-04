import { Link, useLocation, useNavigate } from 'react-router-dom'
import { X, LogOut } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Avatar } from '../ui/Avatar'
import { logout } from '../../api/auth'
import { setAccessToken } from '../../api/client'
import { seekerNavItems, employerNavItems, adminNavItems, type SidebarItem } from './sidebar-constants'

interface SidebarProps {
  mobile?: boolean
  isOpen?: boolean
  onClose?: () => void
  collapsed?: boolean
}

function isNavActive(pathname: string, search: string, to: string): boolean {
  const [toPath, toSearch] = to.split('?')
  if (toSearch) {
    return pathname === toPath && search === `?${toSearch}`
  }
  if (pathname === toPath) {
    return search === ''
  }
  return toPath === '/jobs' && pathname.startsWith('/jobs/')
}

function NavItem({ item, onClick, collapsed }: { item: SidebarItem; onClick?: () => void; collapsed?: boolean }) {
  const Icon = item.icon
  const { pathname, search } = useLocation()
  const active = isNavActive(pathname, search, item.to)
  return (
    <Link
      to={item.to}
      onClick={onClick}
      title={item.label}
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
        active
          ? 'bg-accent/10 text-accent'
          : 'text-ink-muted hover:text-ink hover:bg-surface-2'
      } ${collapsed ? 'justify-center px-0' : ''}`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  )
}

function SidebarContent({ onNavClick, collapsed }: { onNavClick?: () => void; collapsed?: boolean }) {
  const { user, setUser } = useApp()
  const navigate = useNavigate()

  const navItems =
    user?.role === 'employer' ? employerNavItems : user?.role === 'admin' ? adminNavItems : seekerNavItems

  const handleLogout = async () => {
    try { await logout() } catch { /* intentionally empty */ }
    setAccessToken(null)
    setUser(null)
    navigate('/')
    onNavClick?.()
  }

  return (
    <nav className="flex flex-col h-full bg-canvas">
      {/* Logo */}
      <div className={`h-14 border-b border-hairline shrink-0 ${collapsed ? 'flex justify-center' : 'flex items-center gap-3 px-4'}`}>
        <Link
          to="/"
          onClick={onNavClick}
          aria-label="HireHub"
          title="HireHub"
          className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 rounded"
        >
          {collapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className="h-8 w-8" aria-hidden="true">
              <rect x="4" y="4" width="40" height="40" rx="8" fill="#ff5600"/>
              <path d="M16 16v20M16 26h16M32 16v20" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 52" fill="none" className="h-7" aria-hidden="true">
              <rect x="4" y="6" width="40" height="40" rx="8" fill="#ff5600"/>
              <path d="M16 16v20M16 26h16M32 16v20" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
              <text x="54" y="32" fontFamily="Inter, system-ui, sans-serif" fontSize="22" fontWeight="500" fill="currentColor" letterSpacing="-0.3">HireHub</text>
              <text x="54" y="45" fontFamily="Inter, system-ui, sans-serif" fontSize="11" fontWeight="400" fill="currentColor" opacity="0.6">Community</text>
            </svg>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavItem key={item.label} item={item} onClick={onNavClick} collapsed={collapsed} />
        ))}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-hairline p-3 shrink-0">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2.5">
              <Avatar name={user.name} src={user.avatarUrl} size="sm" />
              <span className="text-sm text-ink font-medium truncate">{user.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-auto text-ink-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 rounded"
                aria-label="Log out"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

export function Sidebar({ mobile, isOpen, onClose, collapsed }: SidebarProps) {
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
              type="button"
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
    <div className={`hidden md:flex ${collapsed ? 'w-14' : 'w-56'} shrink-0 border-r border-hairline transition-all duration-200`}>
      <SidebarContent collapsed={collapsed} />
    </div>
  )
}
