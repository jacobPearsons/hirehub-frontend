import { describe, expect, it, afterEach, vi } from 'vitest'
import { apiDelete, apiGet, setAccessToken } from '../client'

afterEach(() => {
  vi.unstubAllGlobals()
  setAccessToken(null)
})

describe('apiFetch', () => {
  it('short-circuits on 204 no-content responses so apiDelete does not throw', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => {
        throw new Error('no body')
      },
    }))

    const res = await apiDelete('/roles/bindings/x')
    expect(res.success).toBe(true)
    expect(res.data).toBeUndefined()
  })

  it('refreshes the token and retries when a request returns 403', async () => {
    const outbound: { url: string; auth: string | null }[] = []
    const fetchMock = vi.fn((input: unknown, init?: RequestInit) => {
      outbound.push({
        url: String(input),
        auth: (init?.headers as Record<string, string> | undefined)?.['Authorization'] ?? null,
      })
      if (String(input).includes('/auth/refresh')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: { accessToken: 'fresh-token' } }),
        })
      }
      if (outbound.length === 1) {
        return Promise.resolve({
          ok: false,
          status: 403,
          json: async () => ({ success: false, error: 'Insufficient permissions' }),
        })
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: { ok: true } }),
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    setAccessToken('stale-token')
    const res = await apiGet('/admin/applications')

    expect(res.success).toBe(true)
    expect(res.data).toEqual({ ok: true })
    expect(outbound).toHaveLength(3)
    expect(outbound[0].url).toContain('/api/admin/applications')
    expect(outbound[0].auth).toBe('Bearer stale-token')
    expect(outbound[1].url).toContain('/api/auth/refresh')
    expect(outbound[2].url).toContain('/api/admin/applications')
    expect(outbound[2].auth).toBe('Bearer fresh-token')
  })
})