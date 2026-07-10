import { MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, Tag } from '../ui'
import { SaveButton } from './SaveButton'
import { formatDate } from '../../utils/date'
import { formatSalary } from '../../utils/format'
import type { Job } from '../../data/jobs'

interface JobCardProps {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
      <Card variant="default" className="p-6">
      <div className="flex items-start gap-3">
        <img
          src={job.companyLogo}
          alt={job.company}
          className="w-10 h-10 rounded-md bg-surface-2 object-contain flex-shrink-0"
        />
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

      <p className="text-sm font-medium text-ink mt-1">
        {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
      </p>

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
