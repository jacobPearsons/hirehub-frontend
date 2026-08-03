import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useBlogPost } from '../useBlogPost'
import { getBlogPostBySlug } from '../../api/blog'

vi.mock('../../api/blog', () => ({
  getBlogPostBySlug: vi.fn(),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const mockPost = {
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
}

describe('useBlogPost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('is disabled when slug is empty', () => {
    const { result } = renderHook(() => useBlogPost(''), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
    expect(getBlogPostBySlug).not.toHaveBeenCalled()
  })

  it('returns data after successful fetch', async () => {
    vi.mocked(getBlogPostBySlug).mockResolvedValue({ data: mockPost })

    const { result } = renderHook(() => useBlogPost('hello-world'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockPost)
    expect(getBlogPostBySlug).toHaveBeenCalledWith('hello-world')
  })

  it('returns error state when API fails', async () => {
    vi.mocked(getBlogPostBySlug).mockRejectedValue(new Error('Not found'))

    const { result } = renderHook(() => useBlogPost('nope'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('Not found')
  })
})
