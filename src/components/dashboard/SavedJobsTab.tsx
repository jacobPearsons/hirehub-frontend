import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bookmark } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { listSavedJobs } from '../../api/savedJobs'
import { JobCard } from '../jobs/JobCard'
import { SkeletonGrid } from '../ui/SkeletonGrid'
import { EmptyState } from '../ui/EmptyState'
import { ErrorState } from '../ui/ErrorState'
import type { Job } from '../../data/jobs'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

export function SavedJobsTab() {
  const { savedJobIds } = useApp()
  const navigate = useNavigate()
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function fetchJobs() {
    setLoading(true)
    setError(null)
    listSavedJobs()
      .then(res => setSavedJobs(res.data))
      .catch(() => setError('Failed to load saved jobs.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchJobs()
  }, [savedJobIds])

  if (loading) {
    return <SkeletonGrid count={6} columns={3} />
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchJobs} />
  }

  if (savedJobs.length === 0) {
    return (
      <EmptyState
        icon={<Bookmark className="w-12 h-12" />}
        title="No saved jobs yet"
        description="Save jobs you're interested in to come back to them later."
        actionLabel="Browse jobs"
        onAction={() => navigate('/jobs')}
      />
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {savedJobs.map((job) => (
        <motion.div key={job.id} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
          <JobCard job={job} />
        </motion.div>
      ))}
    </motion.div>
  )
}
