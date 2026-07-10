import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Eye, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, Tag } from '../ui'
import { SkeletonGrid } from '../ui/SkeletonGrid'
import { listJobs } from '../../api/jobs'
import { useApp } from '../../context/AppContext'
import type { Job } from '../../data/jobs'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

export function JobListingsTab() {
  const { user, applications } = useApp()
  const [allJobs, setAllJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listJobs({ take: 50 })
      .then(res => setAllJobs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const jobs = user?.companyName
    ? allJobs.filter(job => job.company.toLowerCase() === user.companyName!.toLowerCase())
    : allJobs

  if (loading) {
    return <SkeletonGrid count={4} columns={2} />
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <Briefcase className="w-12 h-12 text-ink-tertiary mx-auto mb-4" aria-hidden="true" />
        <h2 className="text-lg font-medium text-ink mb-2">No job listings yet</h2>
        <p className="text-ink-muted mb-6">Post your first job listing to start receiving applications.</p>
        <Link to="/post-job" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">Post a job</Link>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {jobs.map((job) => {
        const applicantCount = applications.filter((a) => a.jobId === job.id).length
        return (
          <motion.div key={job.id} variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
            <Card variant="default" className="p-5">
              <div className="flex items-start gap-4">
                <img src={job.companyLogo} alt={job.company} className="w-10 h-10 rounded-md bg-surface-2 object-contain flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link to={`/jobs/${job.id}`} className="text-base font-medium text-ink hover:text-accent transition-colors">{job.title}</Link>
                      <p className="text-sm text-ink-muted">{job.location} {job.remote ? '(Remote)' : ''}</p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <Link to="/employer/dashboard?tab=applicants" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors">
                        <Users className="w-4 h-4" aria-hidden="true" />
                        <span>{applicantCount} applicant{applicantCount !== 1 ? 's' : ''}</span>
                      </Link>
                      <Link to={`/jobs/${job.id}`} className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors">
                        <Eye className="w-4 h-4" aria-hidden="true" />
                        <span>View</span>
                      </Link>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Tag variant="category">{job.category}</Tag>
                    <Tag variant="seniority">{job.seniority}</Tag>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
