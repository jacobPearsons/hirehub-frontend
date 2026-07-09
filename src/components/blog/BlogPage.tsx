import { useState, useEffect } from 'react'
import { HeroContent } from '../ui/HeroContent'
import { Section, Container, Reveal } from '../ui'
import { usePageMeta } from '../../utils/usePageMeta'
import { FeaturedPost } from './FeaturedPost'
import { CategoryFilter } from './CategoryFilter'
import { BlogGrid } from './BlogGrid'
import { listBlogPosts } from '../../api/blog'
import type { BlogPost } from '../../data/blog'

const categories = ['All', 'Hiring Tips', 'Company Culture', 'Career Advice', 'Industry News']

export default function BlogPage() {
  {usePageMeta({ title: 'Blog | HireHub Community', description: 'Insights and advice for your career journey.' })}

  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('')

  useEffect(() => {
    listBlogPosts({ take: 20 })
      .then(res => setPosts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const featured = posts.find((p) => p.featured)

  const filtered =
    activeCategory === '' || activeCategory === 'All'
      ? posts
      : posts.filter((p) => p.category === activeCategory)

  if (loading) {
    return (
      <Section>
        <Container><div className="text-center py-16"><p className="text-ink-muted">Loading...</p></div></Container>
      </Section>
    )
  }

  return (
    <Section className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05]">
        <img src="/blog-featured.png" alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>
      <Container className="relative">
        <HeroContent variant="card" className="mb-8">
          <h1 className="text-[40px] leading-[1.15] font-medium">Blog</h1>
          <p className="text-lg text-ink-muted mt-2">Insights and advice for your career journey.</p>
        </HeroContent>
        {featured && <Reveal className="mb-10"><FeaturedPost post={featured} /></Reveal>}
        <Reveal className="mb-10" delay={0.05}>
          <CategoryFilter categories={categories} active={activeCategory} onChange={setActiveCategory} />
        </Reveal>
        <Reveal delay={0.1}><BlogGrid posts={filtered} /></Reveal>
      </Container>
    </Section>
  )
}
