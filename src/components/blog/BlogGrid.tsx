import { motion } from 'framer-motion'
import { BlogCard } from './BlogCard'
import { EmptyState } from '../ui/EmptyState'
import type { BlogPost } from '../../data/blog'

interface BlogGridProps {
  posts: BlogPost[]
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

export function BlogGrid({ posts }: BlogGridProps) {
  if (posts.length === 0) {
    return <EmptyState title="No posts yet" />
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
    >
      {posts.map((post) => (
        <motion.div key={post.slug} variants={itemVariants}>
          <BlogCard post={post} />
        </motion.div>
      ))}
    </motion.div>
  )
}
