import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import BlogPostPage from '../BlogPostPage'

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useParams: vi.fn(() => ({ slug: 'hello-world' })),
  }
})

vi.mock('../../../api/blog', () => ({
  getBlogPostBySlug: vi.fn(),
}))

vi.mock('../../../utils/usePageMeta', () => ({
  usePageMeta: vi.fn(),
}))

const mockPost = {
  slug: 'hello-world',
  title: 'Hello World',
  excerpt: 'A post about hello.',
  content: 'First paragraph.\n\nSecond paragraph.',
  image: 'https://example.com/hello.png',
  category: 'Career Advice',
  author: { name: 'Jane Doe', avatar: 'https://example.com/jane.png', role: 'Recruiter' },
  date: '2026-01-01',
  readTime: 3,
  featured: false,
}

function renderBlogPostPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/blog/hello-world']}>
        <BlogPostPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('BlogPostPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the skeleton while loading', async () => {
    const { getBlogPostBySlug } = await import('../../../api/blog')
    ;(getBlogPostBySlug as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}))

    renderBlogPostPage()
    expect(screen.getByRole('status', { name: /loading blog post/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Hello World' })).not.toBeInTheDocument()
  })

  it('renders the post after loading', async () => {
    const { getBlogPostBySlug } = await import('../../../api/blog')
    ;(getBlogPostBySlug as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockPost })

    renderBlogPostPage()
    expect(await screen.findByRole('heading', { name: 'Hello World' })).toBeInTheDocument()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('renders not-found state when the API errors', async () => {
    const { getBlogPostBySlug } = await import('../../../api/blog')
    ;(getBlogPostBySlug as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Not found'))

    renderBlogPostPage()
    expect(await screen.findByText('Post not found')).toBeInTheDocument()
  })
})
