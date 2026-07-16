import { createContext, useContext, useState, useEffect, useMemo, useCallback, useOptimistic, type ReactNode } from 'react'
import { listSavedJobs, saveJob, removeSavedJob } from '../api/savedJobs'
import { getAccessToken } from '../api/client'

interface SavedJobsContextValue {
  savedJobIds: string[]
  optimisticSavedIds: string[]
  isSaved: (jobId: string) => boolean
  toggleSaveJob: (jobId: string) => void
  setSavedJobIds: (ids: string[]) => void
}

const SavedJobsContext = createContext<SavedJobsContextValue | null>(null)

export function SavedJobsProvider({ children }: { children: ReactNode }) {
  const [savedJobIds, setSavedJobIds] = useState<string[]>([])
  const [optimisticSavedIds, setOptimisticSavedIds] = useOptimistic(
    savedJobIds,
    (current, { jobId, action }: { jobId: string; action: 'add' | 'remove' }) =>
      action === 'add' ? [...current, jobId] : current.filter(id => id !== jobId),
  )

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hirehub-saved-jobs')
      if (saved) setSavedJobIds(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('hirehub-saved-jobs', JSON.stringify(savedJobIds))
  }, [savedJobIds])

  useEffect(() => {
    const controller = new AbortController()

    async function init() {
      if (!getAccessToken()) return
      try {
        const res = await listSavedJobs()
        if (!controller.signal.aborted) {
          setSavedJobIds(res.data.map((j: any) => j.id))
        }
      } catch {}
    }

    init()
    return () => controller.abort()
  }, [])

  const toggleSaveJob = useCallback(async (jobId: string) => {
    const isCurrentlySaved = optimisticSavedIds.includes(jobId)
    setOptimisticSavedIds({ jobId, action: isCurrentlySaved ? 'remove' : 'add' })

    try {
      if (isCurrentlySaved) {
        await removeSavedJob(jobId)
        setSavedJobIds(prev => prev.filter(id => id !== jobId))
      } else {
        await saveJob(jobId)
        setSavedJobIds(prev => [...prev, jobId])
      }
    } catch {
      setSavedJobIds(prev => {
        if (isCurrentlySaved) return [...prev, jobId]
        return prev.filter(id => id !== jobId)
      })
    }
  }, [optimisticSavedIds, setOptimisticSavedIds])

  const isSaved = useCallback(
    (jobId: string) => optimisticSavedIds.includes(jobId),
    [optimisticSavedIds],
  )

  const value = useMemo(
    () => ({ savedJobIds, optimisticSavedIds, isSaved, toggleSaveJob, setSavedJobIds }),
    [savedJobIds, optimisticSavedIds, isSaved, toggleSaveJob],
  )

  return <SavedJobsContext.Provider value={value}>{children}</SavedJobsContext.Provider>
}

export function useSavedJobs() {
  const ctx = useContext(SavedJobsContext)
  if (!ctx) throw new Error('useSavedJobs must be used within SavedJobsProvider')
  return ctx
}
