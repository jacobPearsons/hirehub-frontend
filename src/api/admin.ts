import { apiGet, apiPut, apiPost, apiDelete } from './client'
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

export interface Role {
  id: string
  name: string
  description: string | null
  capabilities: string[]
}

export interface RoleBinding {
  id: string
  roleId: string
  userId: string
  contextType: string
  contextId: string | null
  expiresAt: string | null
  createdAt: string
  role?: Role
}

export async function listRoles() {
  const res = await apiGet<Role[]>('/roles')
  return res.data
}

export async function listRoleBindings() {
  const res = await apiGet<RoleBinding[]>('/roles/bindings')
  return res.data
}

export async function updateRoleCapabilities(roleId: string, capabilities: string[]) {
  const res = await apiPut<Role>(`/roles/${roleId}`, { capabilities })
  return res.data
}

export async function createRoleBinding(roleId: string, userId: string) {
  const res = await apiPost<RoleBinding>(`/roles/${roleId}/bindings`, { userId })
  return res.data
}

export async function deleteRoleBinding(bindingId: string) {
  await apiDelete(`/roles/bindings/${bindingId}`)
}
