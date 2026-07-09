import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bookmark } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { listSavedJobs } from '../../api/savedJobs'
import { JobCard } from '../jobs/JobCard'
import type { Job } from '../../data/jobs'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

export function SavedJobsTab() {
  const { savedJobIds } = useApp()
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listSavedJobs()
      .then(res => setSavedJobs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [savedJobIds])

  if (loading) {
    return <div className="text-center py-16"><p className="text-ink-muted">Loading...</p></div>
  }

  if (savedJobs.length === 0) {
    return (
      <div className="text-center py-16">
        <Bookmark className="w-12 h-12 text-ink-tertiary mx-auto mb-4" aria-hidden="true" />
        <h2 className="text-lg font-medium text-ink mb-2">No saved jobs yet</h2>
        <p className="text-ink-muted mb-6">Save jobs you're interested in to come back to them later.</p>
        <Link to="/jobs" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">Browse jobs</Link>
      </div>
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
