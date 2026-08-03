import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useBlogPosts } from '../useBlogPosts'
import { listBlogPosts } from '../../api/blog'

vi.mock('../../api/blog', () => ({
  listBlogPosts: vi.fn(),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const mockPosts = [
  {
    slug: 'hello-world',
    title: 'Hello World',
    excerpt: 'A post about hello.',
    content: 'First paragraph.',
    image: 'https://example.com/hello.png',
    category: 'Career Advice',
    author: { name: 'Jane Doe', avatar: 'https://example.com/jane.png', role: 'Recruiter' },
    date: '2026-01-01',
    readTime: 3,
    featured: false,
  },
]

describe('useBlogPosts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns loading state initially', () => {
    vi.mocked(listBlogPosts).mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useBlogPosts({ take: 20 }), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('returns data after successful fetch', async () => {
    vi.mocked(listBlogPosts).mockResolvedValue({
      data: mockPosts,
      pagination: { total: 1, cursor: null },
    })

    const { result } = renderHook(() => useBlogPosts({ take: 20 }), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockPosts)
  })

  it('returns error state when API fails', async () => {
    vi.mocked(listBlogPosts).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useBlogPosts({ take: 20 }), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('Network error')
  })
})
