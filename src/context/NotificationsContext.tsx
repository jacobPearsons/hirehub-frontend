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

export type SSEHandler = (event: MessageEvent) => void

type SSEHandlerRegistry = Map<string, Set<SSEHandler>>

function attachEventDispatcher(es: EventSource, registry: SSEHandlerRegistry, attached: Set<string>, eventName: string) {
  if (attached.has(eventName)) return
  attached.add(eventName)
  es.addEventListener(eventName, (e: Event) => {
    const messageEvent = e as MessageEvent
    registry.get(eventName)?.forEach((handler) => handler(messageEvent))
  })
}

interface NotificationsContextValue {
  notifications: Notification[]
  unreadCount: number
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  refresh: () => Promise<void>
  subscribe: (eventName: string, handler: SSEHandler) => void
  unsubscribe: (eventName: string, handler: SSEHandler) => void
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const mountedRef = useRef(true)
  const esRef = useRef<EventSource | null>(null)
  const eventHandlersRef = useRef<SSEHandlerRegistry>(new Map())
  const attachedEventNamesRef = useRef<Set<string>>(new Set())

  const subscribe = useCallback((eventName: string, handler: SSEHandler) => {
    const handlers = eventHandlersRef.current.get(eventName) ?? new Set()
    const isNewEvent = handlers.size === 0
    handlers.add(handler)
    eventHandlersRef.current.set(eventName, handlers)
    if (isNewEvent && esRef.current) {
      attachEventDispatcher(esRef.current, eventHandlersRef.current, attachedEventNamesRef.current, eventName)
    }
  }, [])

  const unsubscribe = useCallback((eventName: string, handler: SSEHandler) => {
    const handlers = eventHandlersRef.current.get(eventName)
    if (!handlers) return
    handlers.delete(handler)
    if (handlers.size === 0) eventHandlersRef.current.delete(eventName)
  }, [])

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

      const nextEs = new EventSource(`${API_BASE}/notifications/stream?token=${token}`)
      es = nextEs
      esRef.current = nextEs
      attachedEventNamesRef.current = new Set()

      nextEs.addEventListener('notification', (e) => {
        try {
          const notification = JSON.parse(e.data) as Notification
          setNotifications(prev => prev.some(n => n.id === notification.id) ? prev : [notification, ...prev])
          showToast('info', notification.title)
        } catch { /* intentionally empty */ }
      })

      eventHandlersRef.current.forEach((_handlers, eventName) => {
        attachEventDispatcher(nextEs, eventHandlersRef.current, attachedEventNamesRef.current, eventName)
      })

      nextEs.onerror = () => {
        nextEs.close()
        es = null
        esRef.current = null
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
      esRef.current = null
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
    () => ({ notifications, unreadCount, markRead, markAllRead, refresh, subscribe, unsubscribe }),
    [notifications, unreadCount, markRead, markAllRead, refresh, subscribe, unsubscribe],
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}
