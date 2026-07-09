import { MapPin } from 'lucide-react'
import { Tag } from '../ui'
import type { Job } from '../../data/jobs'

function formatSalary(min: number, max: number, currency: string) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return `${formatter.format(min)} - ${formatter.format(max)}`
}

interface JobHeaderProps {
  job: Job
}

export function JobHeader({ job }: JobHeaderProps) {
  return (
    <div className="flex items-start gap-4 mb-8">
      <img
        src={job.companyLogo}
        alt={job.company}
        className="w-14 h-14 rounded-lg bg-surface-2 object-contain flex-shrink-0"
      />
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
        <p className="text-sm text-ink-tertiary mt-2">{job.postedDate}</p>
      </div>
    </div>
  )
}
