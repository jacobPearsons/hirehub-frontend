const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000/api'

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

interface ApiSuccess<T> {
  success: true
  data: T
  pagination?: { total: number; cursor: string | null }
}

interface ApiError {
  success: false
  error: string
}

type ApiResponse<T> = ApiSuccess<T> | ApiError

async function attemptRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!res.ok) return false
    const json = await res.json()
    if (json.success && json.data?.accessToken) {
      setAccessToken(json.data.accessToken)
      return true
    }
    return false
  } catch {
    return false
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiSuccess<T>> {
  const url = `${API_BASE}${endpoint}`

  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  }

  if (!(options?.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  let res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (res.status === 401 && accessToken) {
    const refreshed = await attemptRefresh()
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`
      res = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      })
    } else {
      setAccessToken(null)
      window.location.href = '/login'
      throw new Error('Session expired')
    }
  }

  const json: ApiResponse<T> = await res.json()

  if (!res.ok || !json.success) {
    throw new Error((json as ApiError).error || 'Request failed')
  }

  return json
}

export function apiGet<T>(endpoint: string) {
  return apiFetch<T>(endpoint)
}

export function apiPost<T>(endpoint: string, body?: unknown) {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

export function apiPatch<T>(endpoint: string, body?: unknown) {
  return apiFetch<T>(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  })
}

export function apiPut<T>(endpoint: string, body?: unknown) {
  return apiFetch<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  })
}

export function apiDelete(endpoint: string) {
  return apiFetch<void>(endpoint, { method: 'DELETE' })
}

export async function apiUpload<T>(endpoint: string, formData: FormData) {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    body: formData,
  })
}
