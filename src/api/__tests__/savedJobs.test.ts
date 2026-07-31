import { describe, expect, it, afterEach, vi } from 'vitest'
import { listSavedJobs } from '../savedJobs'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('listSavedJobs', () => {
  it('flattens nested saved-job records into a Job[]', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [
          {
            id: 'saved-1',
            userId: 'user-1',
            jobId: 'job-1',
            job: { id: 'job-1', title: 'Senior Engineer', tags: ['react'] },
          },
        ],
      }),
    }))

    const res = await listSavedJobs()
    expect(res.data).toHaveLength(1)
    expect(res.data[0].id).toBe('job-1')
    expect(res.data[0].tags).toEqual(['react'])
    expect(res.data[0]).not.toHaveProperty('userId')
  })
})
