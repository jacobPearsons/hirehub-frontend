import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { useNotifications } from '../../context/NotificationsContext'
import { useApp } from '../../context/AppContext'
import { useToast } from '../ui/Toast'

export function NotificationBell() {
  const { user } = useApp()
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  if (!user) return null

  const handleMarkAllRead = () => {
    markAllRead()
    showToast('success', 'All notifications marked as read')
  }

  return (
    <div className="relative" ref={containerRef}>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-md text-ink-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-accent text-white text-[10px] font-semibold flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -8, scale: 0.98 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: reducedMotion ? 0 : 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-surface-1 border border-hairline rounded-[10px] shadow-lg z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-hairline">
              <h3 className="text-sm font-semibold text-ink">Notifications</h3>
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-accent hover:text-accent/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 rounded"
              >
                Mark all read
              </button>
            </div>
            {notifications.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink-muted">No notifications yet</p>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <li key={notification.id} className="border-b border-hairline-soft last:border-b-0">
                    <button
                      type="button"
                      onClick={() => markRead(notification.id)}
                      className={`w-full text-left px-4 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/30 ${notification.read ? 'hover:bg-canvas' : 'bg-accent/5 hover:bg-accent/10'}`}
                    >
                      <span className="flex items-start gap-2">
                        <span
                          aria-hidden="true"
                          className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notification.read ? 'bg-transparent' : 'bg-accent'}`}
                        />
                        <span className="flex-1 min-w-0">
                          <span className={`block text-sm truncate ${notification.read ? 'text-ink-muted font-normal' : 'text-ink font-semibold'}`}>
                            {notification.title}
                          </span>
                          <span className="block text-xs text-ink-muted mt-0.5 line-clamp-2">{notification.body}</span>
                          <span className="block text-[10px] text-ink-muted/70 mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
