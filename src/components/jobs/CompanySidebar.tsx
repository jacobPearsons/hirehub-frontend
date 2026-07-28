import { useState } from 'react'
import { Building2, Users, Clock, MapPin } from 'lucide-react'
import { Card, Button } from '../ui'
import { ApplyJobModal } from '../apply/ApplyJobModal'
import { getCompanyBrief } from '../../data/companyBriefs'
import type { Job } from '../../data/jobs'

interface CompanySidebarProps {
  job: Job
}

export function CompanySidebar({ job }: CompanySidebarProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const brief = getCompanyBrief(job.company)

  return (
    <>
      <Card variant="default" className="p-6 sticky top-20">
        <div className="flex items-center gap-3 mb-4">
          {logoError ? (
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {job.company.charAt(0)}
            </div>
          ) : (
            <img
              src={job.companyLogo}
              alt={job.company}
              className="w-10 h-10 rounded-lg bg-surface-2 object-contain flex-shrink-0"
              onError={() => setLogoError(true)}
            />
          )}
          <p className="text-base font-medium text-ink">{job.company}</p>
        </div>

        <h2 className="text-lg font-medium mb-2">About the company</h2>
        {brief ? (
          <p className="text-sm text-ink-muted mb-6">
            {brief.description}
          </p>
        ) : (
          <p className="text-sm text-ink-muted mb-6">
            A leading company building innovative solutions.
          </p>
        )}

        <div className="space-y-3 mb-6">
          {brief?.industry && (
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <Building2 className="w-4 h-4" aria-hidden="true" />
              <span>{brief.industry}</span>
            </div>
          )}
          {brief?.size && (
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <Users className="w-4 h-4" aria-hidden="true" />
              <span>{brief.size}</span>
            </div>
          )}
          {brief?.founded && brief.founded !== 'N/A' && (
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span>Founded: {brief.founded}</span>
            </div>
          )}
          {brief?.headquarters && brief.headquarters !== 'N/A' && (
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <MapPin className="w-4 h-4" aria-hidden="true" />
              <span>{brief.headquarters}</span>
            </div>
          )}
        </div>

        <Button variant="accent" size="lg" className="w-full" onClick={() => setModalOpen(true)}>
          Apply Now
        </Button>
      </Card>

      <ApplyJobModal
        job={job}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  )
}
