import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { Section } from '../ui/Section'
import { Container } from '../ui/Container'
import { Card } from '../ui/Card'
import { SkeletonGrid } from '../ui/SkeletonGrid'
import { listJobs } from '../../api/jobs'
import { formatSalary } from '../../utils/format'
import type { Job } from '../../data/jobs'

export function FeaturedJobs() {
  const [featured, setFeatured] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listJobs({ take: 20 }).then(res => {
      setFeatured(res.data.filter((j: Job) => j.featured).slice(0, 3))
    }).catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <Section className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.07]">
        <img src="/featured-jobs.png" alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>
      <Container className="relative">
        <h2 className="text-[40px] leading-[1.15] tracking-[-0.8px] font-medium mb-8">
          Featured openings
        </h2>
        {loading ? (
          <SkeletonGrid count={3} columns={3} />
        ) : featured.length === 0 ? (
          <p className="text-ink-muted">No featured jobs right now. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((job) => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded-lg group">
                <Card variant="default" className="p-6 transition-transform duration-200 group-hover:scale-[1.02]">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={job.companyLogo} alt={job.company} className="w-6 h-6 rounded bg-surface-2 object-contain" />
                    <p className="text-sm font-medium text-ink-muted">{job.company}</p>
                  </div>
                  <h3 className="text-[22px] leading-[1.25] font-medium mb-2">{job.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-ink-muted mb-3">
                    <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                    {job.location}
                  </div>
                  <p className="text-sm font-medium text-ink mb-3">
                    {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-surface-2 text-ink-muted">{tag}</span>
                    ))}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
        <Link to="/jobs" className="inline-block mt-8 text-accent font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded">
          View all jobs →
        </Link>
      </Container>
    </Section>
  )
}
