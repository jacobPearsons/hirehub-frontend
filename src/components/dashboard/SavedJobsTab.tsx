import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bookmark } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useApp } from '../../context/AppContext'
import { useSavedJobsQuery } from '../../hooks/useSavedJobsQuery'
import { JobCard } from '../jobs/JobCard'
import { SkeletonGrid } from '../ui/SkeletonGrid'
import { EmptyState } from '../ui/EmptyState'
import { ErrorState } from '../ui/ErrorState'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

export function SavedJobsTab() {
  const { savedJobIds } = useApp()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const skipFirstInvalidate = useRef(true)
  const { data, isLoading, isError, refetch } = useSavedJobsQuery()

  useEffect(() => {
    if (skipFirstInvalidate.current) {
      skipFirstInvalidate.current = false
      return
    }
    queryClient.invalidateQueries({ queryKey: ['savedJobs'] })
  }, [savedJobIds, queryClient])

  const savedJobs = data?.data ?? []
  const error = isError ? 'Failed to load saved jobs.' : null

  function handleRetry() {
    refetch()
  }

  if (isLoading) {
    return <SkeletonGrid count={6} columns={3} />
  }

  if (error) {
    return <ErrorState message={error} onRetry={handleRetry} />
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
