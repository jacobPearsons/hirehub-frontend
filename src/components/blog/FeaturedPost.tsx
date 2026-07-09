import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card } from '../ui/Card'
import { Tag } from '../ui/Tag'
import { formatDate } from '../../utils/date'
import type { BlogPost } from '../../data/blog'

interface FeaturedPostProps {
  post: BlogPost
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
    <Card variant="default">
      <div className="flex flex-col md:flex-row">
        <Link to={`/blog/${post.slug}`} className="w-full md:w-1/2 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded-l-lg">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-64 md:h-80 object-cover rounded-l-lg"
          />
        </Link>
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <Tag variant="category" className="mb-3">
            {post.category}
          </Tag>
          <Link
            to={`/blog/${post.slug}`}
            className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded"
          >
            <h2 className="text-[28px] leading-[1.2] font-medium mb-3">
              {post.title}
            </h2>
          </Link>
          <p className="text-base text-ink-muted mb-4 line-clamp-3">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-xs font-medium"
              aria-hidden="true"
            >
              {post.author.name.charAt(0)}
            </div>
            <p className="text-xs font-medium text-ink">
              {post.author.name}
              <span className="text-ink-muted font-normal">
                {' '}· {formatDate(post.date)}
              </span>
            </p>
          </div>
        </div>
      </div>
    </Card></motion.div>
  )
}
