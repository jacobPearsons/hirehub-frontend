import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useApplicationsQuery } from '../../hooks/useApplicationsQuery'
import { listApplications } from '../../api/applications'
import { SkeletonGrid } from '../ui/SkeletonGrid'
import { EmptyState } from '../ui/EmptyState'
import { ErrorState } from '../ui/ErrorState'
import type { ApplicationStatus } from '../../types/application'
import { ApplicationCard } from './ApplicationCard'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

export function ApplicationsTab() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, isLoading, isError, refetch } = useApplicationsQuery()

  const apps = data?.data ?? []
  const error = isError ? 'Failed to load applications.' : null

  function handleRetry() {
    refetch()
  }

  function handleStatusUpdate(applicationId: string, status: ApplicationStatus) {
    queryClient.setQueryData<Awaited<ReturnType<typeof listApplications>>>(
      ['applications'],
      (old) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.map((app) => (app.id === applicationId ? { ...app, status } : app)),
        }
      }
    )
  }

  if (isLoading) {
    return (
      <SkeletonGrid count={3} columns={2} />
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={handleRetry} />
  }

  if (apps.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="w-12 h-12" />}
        title="No applications yet"
        description="Start applying to jobs to track your applications here."
        actionLabel="Browse jobs"
        onAction={() => navigate('/jobs')}
      />
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
          <ApplicationCard application={app} onStatusUpdate={handleStatusUpdate} />
        </motion.div>
      ))}
    </motion.div>
  )
}
