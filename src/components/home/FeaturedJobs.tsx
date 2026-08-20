import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { motion, useReducedMotionConfig } from 'framer-motion'
import { Section } from '../ui/Section'
import { Container } from '../ui/Container'
import { Card } from '../ui/Card'
import { SkeletonGrid } from '../ui/SkeletonGrid'
import { useJobs } from '../../hooks/useJobs'
import { formatSalary } from '../../utils/format'
import type { Job } from '../../data/jobs'

function CompanyLogo({ job, className }: { job: Job; className?: string }) {
  const [error, setError] = useState(false)
  if (error) {
    return (
      <div className={`${className} bg-accent/10 text-accent flex items-center justify-center text-xs font-semibold`}>
        {job.company.charAt(0)}
      </div>
    )
  }
  return (
    <img
      src={job.companyLogo}
      alt={job.company}
      className={className}
      onError={() => setError(true)}
    />
  )
}

export function FeaturedJobs() {
  const { data: jobs = [], isLoading } = useJobs({ take: 20 })
  const reducedMotion = useReducedMotionConfig()
  const featured = jobs.filter((job: Job) => job.featured).slice(0, 3)
  const salary = (job: Job) => formatSalary(job.salaryMin, job.salaryMax, job.currency)

  return (
    <Section className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.07]">
        <img src="/featured-jobs.png" alt="" className="w-full h-full object-cover" width="1672" height="941" loading="lazy" />
      </div>
      <Container className="relative">
        <h2 className="text-[40px] leading-[1.15] tracking-[-0.8px] font-medium mb-8">
          Featured openings
        </h2>
        {isLoading ? (
          <SkeletonGrid count={3} columns={3} />
        ) : featured.length === 0 ? (
          <p className="text-ink-muted">No featured jobs right now. Check back soon.</p>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={reducedMotion ? 'show' : 'hidden'}
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {featured.map((job) => (
              <motion.div
                key={job.id}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
                }}
                className="h-full"
              >
                <Link to={`/jobs/${job.id}`} className="hover:text-accent block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded-lg group h-full">
                  <Card variant="default" className="p-6 transition-transform duration-200 group-hover:scale-[1.02] h-full">
                    <div className="flex items-center gap-2 mb-2">
                      <CompanyLogo job={job} className="w-6 h-6 rounded" />
                      <p className="text-sm font-medium text-ink-muted">{job.company}</p>
                    </div>
                    <h3 className="text-[22px] leading-[1.25] font-medium mb-2">{job.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-ink-muted mb-3">
                      <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                      {job.location}
                    </div>
                    {salary(job) && (
                      <p className="text-sm font-medium text-ink mb-3">
                        {salary(job)}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-surface-2 text-ink-muted">{tag}</span>
                      ))}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
        <Link to="/jobs" className="inline-block mt-8 text-accent font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded">
          View all jobs →
        </Link>
      </Container>
    </Section>
  )
}
