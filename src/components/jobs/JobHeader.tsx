import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { Tag } from '../ui'
import { formatDate } from '../../utils/date'
import { formatSalary } from '../../utils/format'
import type { Job } from '../../data/jobs'

interface JobHeaderProps {
  job: Job
}

export function JobHeader({ job }: JobHeaderProps) {
  const [logoError, setLogoError] = useState(false)

  return (
    <div className="flex items-start gap-4 mb-8">
      {logoError ? (
        <div className="w-14 h-14 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-xl font-semibold flex-shrink-0">
          {job.company.charAt(0)}
        </div>
      ) : (
        <img
          src={job.companyLogo}
          alt={job.company}
          className="w-14 h-14 rounded-lg bg-surface-2 object-contain flex-shrink-0"
          onError={() => setLogoError(true)}
        />
      )}
      <div>
        <p className="text-sm font-medium text-ink-muted">{job.company}</p>
        <h1 className="text-[40px] leading-[1.15] tracking-[-0.8px] font-medium">
          {job.title}
        </h1>
        <div className="flex items-center gap-1 mt-1">
          <MapPin className="w-4 h-4 text-ink-muted" aria-hidden="true" />
          <span className="text-sm text-ink-muted">{job.location}</span>
        </div>
        <p className="text-base font-medium text-ink mt-1">
          {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {job.tags.map((tag) => (
            <Tag key={tag} variant="default">
              {tag}
            </Tag>
          ))}
        </div>
        <p className="text-sm text-ink-tertiary mt-2">{formatDate(job.postedDate)}</p>
      </div>
    </div>
  )
}
