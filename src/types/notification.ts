export type NotificationType = 'APPLICATION_STATUS' | 'NEW_MESSAGE' | 'SYSTEM'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  data?: unknown
  read: boolean
  createdAt: string
}
