import { useEffect, useRef, useState } from 'react'
import { DndContext, DragOverlay, useDraggable, useDroppable, type DragEndEvent } from '@dnd-kit/core'
import { useApplications } from '../../context/ApplicationsContext'
import { useToast } from '../ui/Toast'
import { usePipelineStream } from '../../hooks/usePipelineStream'
import { listEmployerApplications } from '../../api/applications'
import { ApplicationCard } from '../dashboard/ApplicationCard'
import { PIPELINE_COLUMNS, TERMINAL_STATUSES, groupByStatus, moveCard } from '../../utils/kanban'
import type { Application, ApplicationStatus } from '../../types/application'

interface PipelineTabProps {
  applications: Application[]
}

function columnId(status: string, appId?: string) {
  return appId ? `col-${status}:${appId}` : `col-${status}`
}

function statusFromColId(id: string) {
  return String(id).split(':')[0].replace('col-', '')
}

function PipelineCard({ app }: { app: Application }) {
  const { updateApplicationStatus } = useApplications()
  const { showToast } = useToast()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: columnId(app.status, app.id),
  })
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`touch-none focus-visible:outline-none ${isDragging ? 'opacity-40' : ''}`}
    >
      <ApplicationCard
        application={app}
        onStatusUpdate={(appId, status) => {
          updateApplicationStatus(appId, status).catch(() => {
            showToast('error', `Couldn't update ${app.applicantName}'s status. Please try again.`)
          })
        }}
      />
    </div>
  )
}

function PipelineColumn({ appKey, apps }: { appKey: string; apps: Application[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId(appKey) })
  const col = PIPELINE_COLUMNS.find((c) => c.key === appKey)
  const label = col?.label ?? appKey
  const color = col?.color ?? 'bg-ink-muted/10 text-ink-muted'

  return (
    <div
      ref={setNodeRef}
      aria-label={`${label} column`}
      className={`flex flex-col rounded-lg border border-hairline bg-surface-2/50 p-3 ${isOver ? 'ring-2 ring-accent/40' : ''}`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-medium text-ink">{label}</h3>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-pill text-xs font-medium ${color}`}>
          {apps.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {apps.map((app) => (
          <PipelineCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  )
}

export function PipelineTab({ applications }: PipelineTabProps) {
  const { updateApplicationStatus, setApplications } = useApplications()
  const streamVersion = usePipelineStream()
  const { showToast } = useToast()
  const [columns, setColumns] = useState(() => groupByStatus(applications))
  const [prevApplications, setPrevApplications] = useState(applications)
  const [activeId, setActiveId] = useState<string | null>(null)
  const skipFirstStreamRef = useRef(true)

  useEffect(() => {
    if (skipFirstStreamRef.current) {
      skipFirstStreamRef.current = false
      return
    }
    let cancelled = false
    listEmployerApplications()
      .then((res) => {
        if (!cancelled) setApplications(res.data)
      })
      .catch(() => {
        if (!cancelled) showToast('error', "Couldn't refresh the pipeline. Please try again.")
      })
    return () => {
      cancelled = true
    }
  }, [streamVersion, setApplications, showToast])

  if (prevApplications !== applications) {
    setPrevApplications(applications)
    setColumns(groupByStatus(applications))
  }

  const activeApps = applications.filter((a) => !(TERMINAL_STATUSES as readonly string[]).includes(a.status))
  const closedApps = applications.filter((a) => (TERMINAL_STATUSES as readonly string[]).includes(a.status))
  const activeApp = activeId
    ? activeApps.find((a) => columnId(a.status, a.id) === activeId) ?? null
    : null

  async function handleDragEnd(event: DragEndEvent) {
    if (!event.over) return
    const from = statusFromColId(String(event.active.id))
    const to = statusFromColId(String(event.over.id))
    const appId = String(event.active.id).split(':')[1]
    const result = moveCard(columns, from, to, appId)
    setActiveId(null)
    if (!result.allowed || !result.app) return

    setColumns(result.columns)
    try {
      await updateApplicationStatus(appId, to.toUpperCase() as ApplicationStatus)
    } catch {
      setColumns(groupByStatus(applications))
      showToast('error', `Couldn't move ${result.app.applicantName} to the ${to} stage. Please try again.`)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4" role="toolbar" aria-label="Pipeline status counts">
        {PIPELINE_COLUMNS.map((col) => (
          <span key={col.key} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-xs font-medium ${col.color}`}>
            {col.label}
            <span className="tabular-nums">{columns[col.key].length}</span>
          </span>
        ))}
      </div>

      <DndContext
        onDragStart={(event) => setActiveId(String(event.active.id))}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
          {PIPELINE_COLUMNS.map((col) => (
            <PipelineColumn key={col.key} appKey={col.key} apps={columns[col.key]} />
          ))}
        </div>
        <DragOverlay>{activeApp ? <ApplicationCard application={activeApp} /> : null}</DragOverlay>
      </DndContext>

      {closedApps.length > 0 && (
        <section className="mt-8" aria-label="Closed applications">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-ink">Closed</h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-pill text-xs font-medium bg-ink-muted/10 text-ink-muted">
              {closedApps.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {closedApps.map((app) => (
              <ApplicationCard key={app.id} application={app} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
