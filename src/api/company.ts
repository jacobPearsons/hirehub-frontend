import { apiGet, apiPost, apiPut, apiUpload } from './client'

export interface CompanyInput {
  name: string
  website?: string
  industry?: string
  size?: string
  description?: string
  location?: string
}

export interface Company {
  id: string
  name: string
  website?: string | null
  industry?: string | null
  size?: string | null
  description?: string | null
  location?: string | null
  logo?: string | null
}

export interface CompanyInvite {
  id: string
  companyId: string
  email: string
  status: string
}

export function getCompany() {
  return apiGet<Company>('/company')
}

export function upsertCompany(input: CompanyInput) {
  return apiPut<Company>('/company', input)
}

export function uploadCompanyLogo(file: File) {
  const formData = new FormData()
  formData.append('logo', file)
  return apiUpload<{ logoUrl: string }>('/company/logo', formData)
}

export function inviteTeam(emails: string[]) {
  return apiPost<{ invites: CompanyInvite[] }>('/company/invites', { emails })
}
