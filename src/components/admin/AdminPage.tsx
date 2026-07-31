import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Building2, Users } from 'lucide-react'
import { Card, TabsRoot, TabsList, TabsTrigger, TabsContent, SkeletonGrid, EmptyState, ErrorState, Avatar } from '../ui'
import { listAdminApplications, listAdminEmployers, type AdminEmployer } from '../../api/admin'
import { CandidateDetailDrawer } from '../candidate'
import type { Application, ApplicationStatus } from '../../types/application'

const statusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
  applied: { label: 'Applied', color: 'bg-accent/10 text-accent' },
  reviewing: { label: 'Under Review', color: 'bg-ink-muted/10 text-ink-muted' },
  interviewing: { label: 'Interviewing', color: 'bg-surface-2 text-ink' },
  rejected: { label: 'Rejected', color: 'bg-error/10 text-error' },
  offer: { label: 'Offer', color: 'bg-success/10 text-success' },
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function AdminApplicationsList() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewApp, setViewApp] = useState<Application | null>(null)

  function refresh(silent = false) {
    if (!silent) setLoading(true)
    setError(null)
    listAdminApplications()
      .then((res) => setApps(res.data))
      .catch(() => setError('Failed to load applications.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let cancelled = false
    listAdminApplications()
      .then((res) => { if (!cancelled) setApps(res.data) })
      .catch(() => { if (!cancelled) setError('Failed to load applications.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading) return <SkeletonGrid count={3} columns={2} />

  if (error) return <ErrorState message={error} onRetry={refresh} />

  if (apps.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="w-12 h-12" />}
        title="No applications yet"
        description="When candidates apply to jobs, their applications will appear here."
      />
    )
  }

  return (
    <>
      <div className="space-y-4">
        {apps.map((app) => {
          const status = statusConfig[app.status]
          return (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card variant="default" className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-md bg-surface-2 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-ink-muted" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-medium text-ink">{app.jobTitle || 'Untitled role'}</h3>
                        <p className="text-sm text-ink-muted">
                          <span className="font-medium text-ink">{app.applicantName}</span> · {app.applicantEmail}
                        </p>
                        {app.company && <p className="text-xs text-ink-tertiary mt-0.5">{app.company}</p>}
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-pill text-xs font-medium flex-shrink-0 ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-ink-muted mt-3 line-clamp-2">{app.coverLetter}</p>
                    <p className="text-xs text-ink-tertiary mt-2">Submitted {formatDate(app.submittedAt)}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => setViewApp(app)}
                        className="text-xs font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded"
                      >
                        View candidate →
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
      {viewApp && (
        <CandidateDetailDrawer
          application={viewApp}
          open={!!viewApp}
          onOpenChange={(open) => { if (!open) setViewApp(null) }}
          onActionComplete={() => refresh(true)}
        />
      )}
    </>
  )
}

function AdminEmployersList() {
  const [employers, setEmployers] = useState<AdminEmployer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function handleRetry() {
    setLoading(true)
    setError(null)
    listAdminEmployers()
      .then((res) => setEmployers(res.data))
      .catch(() => setError('Failed to load employers.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let cancelled = false
    listAdminEmployers()
      .then((res) => { if (!cancelled) setEmployers(res.data) })
      .catch(() => { if (!cancelled) setError('Failed to load employers.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading) return <SkeletonGrid count={3} columns={2} />

  if (error) return <ErrorState message={error} onRetry={handleRetry} />

  if (employers.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-12 h-12" />}
        title="No employers yet"
        description="When employer accounts are created, they will appear here."
      />
    )
  }

  return (
    <div className="space-y-4">
      {employers.map((emp) => (
        <motion.div
          key={emp.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card variant="default" className="p-5">
            <div className="flex items-start gap-4">
              <Avatar name={emp.name} src={emp.avatarUrl} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-medium text-ink">{emp.name}</h3>
                    <p className="text-sm text-ink-muted">{emp.companyName || 'No company'}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill text-xs font-medium bg-ink-muted/10 text-ink-muted flex-shrink-0">
                    <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
                    {emp._count.jobListings} jobs
                  </span>
                </div>
                <p className="text-sm text-ink-muted mt-2">{emp.email}</p>
                <p className="text-xs text-ink-tertiary mt-1">
                  {emp.location || 'Location not set'} · Joined {formatDate(emp.createdAt)}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

export function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'employers' ? 'employers' : 'applications'

  function handleTabChange(value: string) {
    setSearchParams(value === 'employers' ? { tab: 'employers' } : {}, { replace: true })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Admin</h1>
        <p className="text-sm text-ink-muted mt-1">Site-wide overview of applications and employer accounts.</p>
      </div>

      <TabsRoot value={tab} onValueChange={handleTabChange}>
        <TabsList aria-label="Admin sections">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="employers">Employers</TabsTrigger>
        </TabsList>
        <TabsContent value="applications">
          <AdminApplicationsList />
        </TabsContent>
        <TabsContent value="employers">
          <AdminEmployersList />
        </TabsContent>
      </TabsRoot>
    </div>
  )
}
