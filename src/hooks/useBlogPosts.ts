import { useQuery } from '@tanstack/react-query'
import { listBlogPosts } from '../api/blog'
import type { BlogListParams } from '../api/types'

export function useBlogPosts(params: BlogListParams = {}) {
  return useQuery({
    queryKey: ['blogPosts', params],
    queryFn: () => listBlogPosts(params),
  })
}
