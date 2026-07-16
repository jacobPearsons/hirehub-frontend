import { useQuery } from '@tanstack/react-query'
import { getBlogPostBySlug } from '../api/blog'

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blogPost', slug],
    queryFn: () => getBlogPostBySlug(slug),
    enabled: !!slug,
  })
}
