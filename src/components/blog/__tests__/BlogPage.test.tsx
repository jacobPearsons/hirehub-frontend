import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BlogPage from '../BlogPage'

vi.mock('../../../api/blog', () => ({
  listBlogPosts: vi.fn(),
}))

vi.mock('../../../utils/usePageMeta', () => ({
  usePageMeta: vi.fn(),
}))

function renderBlogPage() {
  return render(
    <MemoryRouter initialEntries={['/blog']}>
      <BlogPage />
    </MemoryRouter>
  )
}

describe('BlogPage', () => {
  it('shows loading skeleton initially', async () => {
    const { listBlogPosts } = await import('../../../api/blog')
    ;(listBlogPosts as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}))

    renderBlogPage()
    expect(screen.queryByRole('heading', { name: /blog$/i })).not.toBeInTheDocument()
  })

  it('renders Blog heading after loading', async () => {
    const { listBlogPosts } = await import('../../../api/blog')
    ;(listBlogPosts as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [] })

    renderBlogPage()
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /blog$/i })).toBeInTheDocument()
    })
  })

  it('renders category filter buttons', async () => {
    const { listBlogPosts } = await import('../../../api/blog')
    ;(listBlogPosts as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [] })

    renderBlogPage()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /hiring tips/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /company culture/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /career advice/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /industry news/i })).toBeInTheDocument()
    })
  })
})
