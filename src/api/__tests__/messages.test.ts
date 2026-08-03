import { describe, expect, it, afterEach, vi } from 'vitest'
import { openSupportConversation } from '../messages'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('openSupportConversation', () => {
  it('posts to /conversations/support and returns the conversation', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          id: 'conv-1',
          employerId: 'employer-1',
          candidateId: 'candidate-1',
          employer: { id: 'employer-1', name: 'HireHub Team', role: 'ADMIN' },
          candidate: { id: 'candidate-1', name: 'Jane Doe', role: 'CANDIDATE' },
          messages: [],
          updatedAt: '2026-08-01T00:00:00.000Z',
        },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)


    const conversation = await openSupportConversation()
    expect(conversation.data.id).toBe('conv-1')

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('http://localhost:4000/api/conversations/support')
    expect(options.method).toBe('POST')
  })
})
