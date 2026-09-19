import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import { Card, Tag } from '../ui'
import { SaveButton } from './SaveButton'
import { formatDate } from '../../utils/date'
import { formatSalary } from '../../utils/format'
import { getJobById } from '../../api/jobs'
import type { Job } from '../../data/jobs'

interface JobCardProps {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  const queryClient = useQueryClient()
  const [logoError, setLogoError] = useState(false)
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency)

  const prefetchJob = () => {
    queryClient.prefetchQuery({
      queryKey: ['job', job.id],
      queryFn: () => getJobById(job.id),
      staleTime: 5 * 60 * 1000,
    })
  }

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.25, ease: 'easeOut' }} onMouseEnter={prefetchJob} onFocus={prefetchJob}>
      <Card variant="default" className="p-6">
      <div className="flex items-start gap-3">
        {logoError ? (
          <div className="w-10 h-10 rounded-md bg-accent/10 text-accent flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {job.company.charAt(0)}
          </div>
        ) : (
          <img
            src={job.companyLogo}
            alt={job.company}
            className="w-10 h-10 rounded-md bg-surface-2 object-cover flex-shrink-0"
            onError={() => setLogoError(true)}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                to={`/jobs/${job.id}`}
                className="text-[22px] leading-[1.25] font-medium text-ink hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded"
              >
                {job.title}
              </Link>
              <p className="text-sm text-ink-muted">{job.company}</p>
            </div>
            <SaveButton jobId={job.id} className="flex-shrink-0 mt-0.5" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 mt-2">
        <MapPin className="w-4 h-4 text-ink-muted" aria-hidden="true" />
        <span className="text-sm text-ink-muted">{job.location}</span>
      </div>

      {salary && (
        <p className="text-sm font-medium text-ink mt-1">{salary}</p>
      )}

      <div className="flex flex-wrap gap-2 mt-3">
        {job.tags.map((tag) => (
          <Tag key={tag} variant="default">
            {tag}
          </Tag>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-ink-tertiary">{formatDate(job.postedDate)}</p>
      </div>
    </Card></motion.div>
  )
}
