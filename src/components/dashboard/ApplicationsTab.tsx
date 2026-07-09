import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { listApplications } from '../../api/applications'
import type { Application } from '../../types/application'
import { ApplicationCard } from './ApplicationCard'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

export function ApplicationsTab() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listApplications()
      .then((res) => {
        setApps(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-ink-muted">Loading...</p>
      </div>
    )
  }

  if (apps.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="w-12 h-12 text-ink-tertiary mx-auto mb-4" aria-hidden="true" />
        <h2 className="text-lg font-medium text-ink mb-2">No applications yet</h2>
        <p className="text-ink-muted mb-6">Start applying to jobs to track your applications here.</p>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded"
        >
          Browse jobs
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {apps.map((app) => (
        <motion.div key={app.id} variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
          <ApplicationCard application={app} />
        </motion.div>
      ))}
    </motion.div>
  )
}
