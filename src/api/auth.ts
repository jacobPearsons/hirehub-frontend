import { apiPost, apiGet, apiFetch, apiPatch, apiUpload } from './client'
import type { AuthUser, LoginResponse, RegisterResponse } from './types'

export async function login(email: string, password: string) {
  return apiPost<LoginResponse>('/auth/login', { email, password })
}

export async function register(data: {
  name: string
  email: string
  password: string
  role?: string
  companyName?: string
}) {
  return apiPost<RegisterResponse>('/auth/register', data)
}

export async function logout() {
  return apiPost<void>('/auth/logout')
}

export async function getMe() {
  return apiGet<AuthUser>('/auth/me')
}

export async function forgotPassword(email: string) {
  return apiPost<void>('/auth/forgot-password', { email })
}

export async function resetPassword(token: string, password: string) {
  return apiPost<void>('/auth/reset-password', { token, password })
}

export async function refreshToken() {
  return apiFetch<{ accessToken: string }>('/auth/refresh', { method: 'POST' })
}

export interface ProfileUpdate {
  name?: string
  email?: string
  phone?: string | null
  bio?: string | null
  companyName?: string | null
}

export async function updateProfile(data: ProfileUpdate) {
  return apiPatch<AuthUser>('/auth/profile', data)
}

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
  return apiPatch<never>('/auth/password', data)
}

export async function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('avatar', file)
  return apiUpload<{ avatarUrl: string }>('/auth/avatar', formData)
}
