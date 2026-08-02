import { apiGet, apiPost } from './client'
import type { Notification } from '../types/notification'

export async function listNotifications() {
  const res = await apiGet<{ items: Notification[]; unreadCount: number }>('/notifications')
  return { ...res, data: res.data }
}

export async function markNotificationRead(id: string) {
  const res = await apiPost<Notification>(`/notifications/${id}/read`)
  return { ...res, data: res.data }
}

export async function markAllNotificationsRead() {
  const res = await apiPost<{ count: number }>('/notifications/read-all')
  return { ...res, data: res.data }
}
