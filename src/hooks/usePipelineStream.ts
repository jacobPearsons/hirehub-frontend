import { useEffect, useState } from 'react'
import { useNotifications } from '../context/NotificationsContext'
import { useAuth } from '../context/AuthContext'

const APPLICATION_UPDATED_EVENT = 'application:updated'

export function usePipelineStream(): number {
  const { user } = useAuth()
  const { subscribe, unsubscribe } = useNotifications()
  const [streamVersion, setStreamVersion] = useState(0)

  useEffect(() => {
    if (user?.role !== 'employer') return

    const handleEvent = () => setStreamVersion((version) => version + 1)
    subscribe(APPLICATION_UPDATED_EVENT, handleEvent)
    return () => unsubscribe(APPLICATION_UPDATED_EVENT, handleEvent)
  }, [user?.role, subscribe, unsubscribe])

  return streamVersion
}
