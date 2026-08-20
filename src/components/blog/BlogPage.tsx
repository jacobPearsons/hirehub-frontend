import { useState } from 'react'
import { HeroContent } from '../ui/HeroContent'
import { Section, Container, Reveal } from '../ui'
import { BlogSkeletonGrid } from './BlogSkeleton'
import { usePageMeta } from '../../utils/usePageMeta'
import { FeaturedPost } from './FeaturedPost'
import { CategoryFilter } from './CategoryFilter'
import { BlogGrid } from './BlogGrid'
import { useBlogPosts } from '../../hooks/useBlogPosts'

const categories = ['All', 'Hiring Tips', 'Company Culture', 'Career Advice', 'Industry News']

export default function BlogPage() {
  const meta = usePageMeta({ title: 'Blog | HireHub Community', description: 'Insights and advice for your career journey.' })

  const [activeCategory, setActiveCategory] = useState('')
  const { data: posts = [], isLoading } = useBlogPosts({ take: 20 })

  const featured = posts.find((p) => p.featured)

  const filtered =
    activeCategory === '' || activeCategory === 'All'
      ? posts
      : posts.filter((p) => p.category === activeCategory)

  if (isLoading) {
    return (
      <>
        {meta}
        <Section>
          <Container><BlogSkeletonGrid /></Container>
        </Section>
      </>
    )
  }

  return (
    <>
      {meta}
      <Section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]">
          <img src="/blog-featured.png" alt="" className="w-full h-full object-cover" width="1672" height="941" loading="lazy" />
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
    </>
  )
}
