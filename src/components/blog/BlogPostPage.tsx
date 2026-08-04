import { useParams, Link } from 'react-router-dom'
import { Section, Container, Reveal } from '../ui'
import { HeroContent } from '../ui/HeroContent'
import { BlogPostSkeleton } from './BlogSkeleton'
import { usePageMeta } from '../../utils/usePageMeta'
import { Tag } from '../ui/Tag'
import { formatDate } from '../../utils/date'
import { useBlogPost } from '../../hooks/useBlogPost'

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: post, isLoading, isError } = useBlogPost(slug ?? '')

  const meta = usePageMeta({
    title: post ? `${post.title} | HireHub Community` : 'Post | HireHub Community',
    description: post?.excerpt,
    image: post?.image,
    url: post ? `/blog/${post.slug}` : undefined,
  })

  if (isLoading) {
    return (
      <>
        {meta}
        <Section>
          <Container><BlogPostSkeleton /></Container>
        </Section>
      </>
    )
  }

  if (!post || isError) {
    return (
      <>
        {meta}
        <Section>
          <Container>
            <div className="text-center py-16">
              <p className="text-ink-muted text-lg mb-4">Post not found</p>
              <Link to="/blog" className="text-accent hover:underline text-sm font-medium">Back to blog</Link>
            </div>
          </Container>
        </Section>
      </>
    )
  }

  const blocks = post.content ? post.content.split('\n\n') : []

  return (
    <>
      {meta}
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
              {blocks.map((block, i) => {
                const match = block.trim().match(/^!\[(.*?)\]\((.*?)\)$/)
                if (match) {
                  return (
                    <img
                      key={i}
                      src={match[2]}
                      alt={match[1]}
                      loading="lazy"
                      className="w-full rounded-xl my-2"
                    />
                  )
                }
                return (
                  <p key={i} className="text-base leading-[1.8] text-ink-muted mb-4">{block}</p>
                )
              })}
            </div>
          </article></Reveal>
          <div className="mt-12 text-center">
            <Link to="/blog" className="text-accent hover:underline text-sm font-medium">← Back to blog</Link>
          </div>
        </Container>
      </Section>
    </>
  )
}
