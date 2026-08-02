import { Menu, LogOut } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Avatar } from '../ui/Avatar'
import { logout } from '../../api/auth'
import { setAccessToken } from '../../api/client'
import { ThemeToggle } from '../ui/ThemeToggle'
import { NotificationBell } from './NotificationBell'
import { useNavigate } from 'react-router-dom'

interface InfobarProps {
  onMenuToggle: () => void
}

export function Infobar({ onMenuToggle }: InfobarProps) {
  const { user, setUser } = useApp()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await logout() } catch { /* intentionally empty */ }
    setAccessToken(null)
    setUser(null)
    navigate('/')
  }

  return (
    <div className="flex items-center justify-between px-4 md:px-6 h-14 border-b border-hairline bg-canvas shrink-0">
      <button
        type="button"
        onClick={onMenuToggle}
        className="md:hidden text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 rounded-md p-1"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <div className="flex items-center gap-3 ml-auto">
        <NotificationBell />
        <ThemeToggle />
        {user && (
          <>
            <Avatar name={user.name} src={user.avatarUrl} size="sm" />
            <span className="text-sm text-ink font-medium hidden sm:inline">{user.name}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-ink-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 rounded p-1"
              aria-label="Log out"
            >
              <LogOut size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
