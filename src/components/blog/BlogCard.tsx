import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import { Card } from '../ui/Card'
import { Tag } from '../ui/Tag'
import { formatDate } from '../../utils/date'
import { getBlogPostBySlug } from '../../api/blog'
import type { BlogPost } from '../../data/blog'

interface BlogCardProps {
  post: BlogPost
}

export function BlogCard({ post }: BlogCardProps) {
  const queryClient = useQueryClient()

  const prefetchPost = () => {
    queryClient.prefetchQuery({
      queryKey: ['blogPost', post.slug],
      queryFn: () => getBlogPostBySlug(post.slug),
      staleTime: 5 * 60 * 1000,
    })
  }

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.25, ease: 'easeOut' }} onMouseEnter={prefetchPost} onFocus={prefetchPost}>
      <Card variant="default">
      <img
        src={post.image}
        alt={post.title}
        className="w-full h-48 object-cover rounded-t-lg"
      />
      <div className="p-5">
        <Tag variant="category" className="mb-2">
          {post.category}
        </Tag>
        <Link to={`/blog/${post.slug}`} className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded">
          <h3 className="text-[22px] leading-[1.25] font-medium mb-2">
            {post.title}
          </h3>
        </Link>
        <p className="text-sm text-ink-muted mb-4 line-clamp-2">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-xs font-medium"
            aria-hidden="true"
          >
            {post.author.name.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-medium text-ink">{post.author.name}</p>
            <p className="text-xs text-ink-muted">
              {formatDate(post.date)} · {post.readTime} min read
            </p>
          </div>
        </div>
      </div>
    </Card></motion.div>
  )
}
