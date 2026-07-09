import { apiPost } from './client'

export async function submitContact(data: {
  name: string
  email: string
  subject: string
  message: string
}) {
  return apiPost<void>('/contact', data)
}
