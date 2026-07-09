import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Section, Container, Reveal } from '../ui'
import { HeroContent } from '../ui/HeroContent'
import { usePageMeta } from '../../utils/usePageMeta'
import { Tag } from '../ui/Tag'
import { formatDate } from '../../utils/date'
import { getBlogPostBySlug } from '../../api/blog'
import type { BlogPost } from '../../data/blog'

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    getBlogPostBySlug(slug)
      .then(res => setPost(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  {usePageMeta({
    title: post ? `${post.title} | HireHub Community` : 'Post | HireHub Community',
    description: post?.excerpt,
    image: post?.image,
    url: post ? `/blog/${post.slug}` : undefined,
  })}

  if (loading) {
    return (
      <Section>
        <Container><div className="text-center py-16"><p className="text-ink-muted">Loading...</p></div></Container>
      </Section>
    )
  }

  if (!post) {
    return (
      <Section>
        <Container>
          <div className="text-center py-16">
            <p className="text-ink-muted text-lg mb-4">Post not found</p>
            <Link to="/blog" className="text-accent hover:underline text-sm font-medium">Back to blog</Link>
          </div>
        </Container>
      </Section>
    )
  }

  const paragraphs = post.content ? post.content.split('\n\n') : []

  return (
    <Section>
      <Container>
        <HeroContent variant="accent" className="mb-8">
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <Link to="/blog" className="hover:text-ink transition-colors">Blog</Link>
            <span aria-hidden="true">→</span>
            <span className="text-ink truncate" aria-current="page">{post.title}</span>
          </div>
        </HeroContent>
        <Reveal><article className="max-w-3xl mx-auto">
          <img src={post.image} alt={post.title} className="w-full h-72 md:h-96 object-cover rounded-xl mb-8" />
          <Tag variant="category">{post.category}</Tag>
          <h1 className="text-[40px] leading-[1.15] font-medium mt-4 mb-4">{post.title}</h1>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-sm font-medium" aria-hidden="true">
              {post.author.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-ink">
                {post.author.name}
                <span className="text-ink-muted font-normal"> · {post.author.role}</span>
              </p>
              <p className="text-sm text-ink-muted">{formatDate(post.date)} · {post.readTime} min read</p>
            </div>
          </div>
          <div>
            {paragraphs.map((para, i) => (
              <p key={i} className="text-base leading-[1.8] text-ink-muted mb-4">{para}</p>
            ))}
          </div>
        </article></Reveal>
        <div className="mt-12 text-center">
          <Link to="/blog" className="text-accent hover:underline text-sm font-medium">← Back to blog</Link>
        </div>
      </Container>
    </Section>
  )
}
