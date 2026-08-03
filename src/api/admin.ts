import { apiGet } from './client'
import { normalizeApplication, type BackendApplication } from './applications'

export interface AdminEmployer {
  id: string
  name: string
  email: string
  companyName: string | null
  avatarUrl: string | null
  location: string | null
  createdAt: string
  _count: { jobListings: number }
}

export async function listAdminApplications() {
  const res = await apiGet<BackendApplication[]>('/admin/applications')
  return { ...res, data: res.data.map(normalizeApplication) }
}

export async function listAdminEmployers() {
  return apiGet<AdminEmployer[]>('/admin/employers')
}
