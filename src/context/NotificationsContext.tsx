import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef, type ReactNode } from 'react'
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications'
import { API_BASE, getAccessToken } from '../api/client'
import { useAuth } from './AuthContext'
import { useToast } from '../components/ui/Toast'
import type { Notification } from '../types/notification'

declare global {
  interface EventSourceEventMap {
    notification: MessageEvent
  }
}

interface NotificationsContextValue {
  notifications: Notification[]
  unreadCount: number
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  refresh: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const mountedRef = useRef(true)

  const unreadCount = notifications.filter(n => !n.read).length

  const fetchList = useCallback(async (signal?: AbortSignal) => {
    if (!getAccessToken()) return
    try {
      const res = await listNotifications()
      if (!signal?.aborted) {
        setNotifications(res.data.items)
      }
    } catch { /* intentionally empty */ }
  }, [])

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotifications([])
      return
    }

    mountedRef.current = true
    const controller = new AbortController()
    let es: EventSource | null = null
    let retryTimer: number | null = null

    function connect() {
      if (!mountedRef.current) return
      const token = getAccessToken()
      if (!token) return

      es = new EventSource(`${API_BASE}/notifications/stream?token=${token}`)

      es.addEventListener('notification', (e) => {
        try {
          const notification = JSON.parse(e.data) as Notification
          setNotifications(prev => prev.some(n => n.id === notification.id) ? prev : [notification, ...prev])
          showToast('info', notification.title)
        } catch { /* intentionally empty */ }
      })

      es.onerror = () => {
        es?.close()
        es = null
        if (mountedRef.current) {
          if (retryTimer) window.clearTimeout(retryTimer)
          retryTimer = window.setTimeout(connect, 3000)
        }
      }
    }

    fetchList(controller.signal)
    connect()

    return () => {
      controller.abort()
      mountedRef.current = false
      es?.close()
      es = null
      if (retryTimer) window.clearTimeout(retryTimer)
    }
  }, [user, showToast, fetchList])

  const markRead = useCallback(async (id: string) => {
    try {
      await markNotificationRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch {
      showToast('error', 'Failed to mark notification as read')
    }
  }, [showToast])

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch {
      showToast('error', 'Failed to mark all notifications as read')
    }
  }, [showToast])

  const refresh = useCallback(async () => {
    await fetchList()
  }, [fetchList])

  const value = useMemo(
    () => ({ notifications, unreadCount, markRead, markAllRead, refresh }),
    [notifications, unreadCount, markRead, markAllRead, refresh],
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}
