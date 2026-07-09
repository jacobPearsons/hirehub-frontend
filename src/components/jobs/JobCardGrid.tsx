import { motion } from 'framer-motion'
import { JobCard } from './JobCard'
import type { Job } from '../../data/jobs'

interface JobCardGridProps {
  jobs: Job[]
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

export function JobCardGrid({ jobs }: JobCardGridProps) {
  if (jobs.length === 0) {
    return (
      <div className="bg-surface-1 rounded-lg p-12 text-center">
        <p className="text-ink font-medium">No jobs match your filters.</p>
        <p className="text-ink-muted text-sm mt-1">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
    >
      {jobs.map((job) => (
        <motion.div key={job.id} variants={itemVariants}>
          <JobCard job={job} />
        </motion.div>
      ))}
    </motion.div>
  )
}
