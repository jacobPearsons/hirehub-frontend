import { describe, expect, it, afterEach, vi } from 'vitest'
import { apiDelete } from '../client'

afterEach(() => {
  vi.unstubAllGlobals()
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
})
