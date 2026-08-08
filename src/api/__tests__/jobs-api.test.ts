import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../client', () => ({
  apiGet: vi.fn(),
}))

import { apiGet } from '../client'
import { listJobs, searchJobTags, getJobFacets } from '../jobs'

const mockedGet = vi.mocked(apiGet)

beforeEach(() => mockedGet.mockReset())

describe('listJobs', () => {
  it('serializes all search params', async () => {
    mockedGet.mockResolvedValue({ data: [], pagination: { total: 0, cursor: null } })
    await listJobs({ search: 'react', location: 'austin', sort: 'salary_high', salaryMin: 100000, take: 12, remote: 'true' })
    const [url] = mockedGet.mock.calls[0]
    expect(url).toContain('search=react')
    expect(url).toContain('location=austin')
    expect(url).toContain('sort=salary_high')
    expect(url).toContain('salaryMin=100000')
    expect(url).toContain('remote=true')
  })
})

describe('searchJobTags', () => {
  it('calls /jobs/tags/search with q', async () => {
    mockedGet.mockResolvedValue({ data: [] })
    await searchJobTags('react')
    expect(mockedGet.mock.calls[0][0]).toContain('/jobs/tags/search?q=react')
  })
})

describe('getJobFacets', () => {
  it('calls /jobs/facets', async () => {
    mockedGet.mockResolvedValue({ data: {} })
    await getJobFacets()
    expect(mockedGet.mock.calls[0][0]).toContain('/jobs/facets')
  })
})
