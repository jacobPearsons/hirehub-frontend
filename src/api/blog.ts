import { apiGet } from './client'
import type { BlogPost, BlogListParams } from './types'

export async function listBlogPosts(params?: BlogListParams) {
  const searchParams = new URLSearchParams()
  if (params?.cursor) searchParams.set('cursor', params.cursor)
  if (params?.take) searchParams.set('take', String(params.take))

  const qs = searchParams.toString()
  return apiGet<BlogPost[]>(`/blog-posts${qs ? `?${qs}` : ''}`)
}

export async function getBlogPostBySlug(slug: string) {
  return apiGet<BlogPost>(`/blog-posts/${slug}`)
}
