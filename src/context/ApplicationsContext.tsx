import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'
import { listApplications, listEmployerApplications, updateHiringData, updateApplicationStatus as apiUpdateStatus } from '../api/applications'
import { getAccessToken } from '../api/client'
import { useAuth } from './AuthContext'
import type { Application } from '../types/application'
import type { InterviewDetails, OfferDetails, OnboardingChecklistItem, OrientationDetails } from '../types/hiring-flow'

interface ApplicationsContextValue {
  applications: Application[]
  addApplication: (app: Application) => void
  updateApplicationStatus: (id: string, status: Application['status']) => Promise<void>
  updateApplicationInterview: (id: string, details: InterviewDetails) => Promise<void>
  updateApplicationOffer: (id: string, details: OfferDetails) => Promise<void>
  updateApplicationChecklist: (id: string, items: OnboardingChecklistItem[]) => Promise<void>
  updateApplicationOrientation: (id: string, details: OrientationDetails) => Promise<void>
  setApplications: (apps: Application[]) => void
}

const ApplicationsContext = createContext<ApplicationsContextValue | null>(null)

export function ApplicationsProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])

  useEffect(() => {
    const controller = new AbortController()

    async function init() {
      if (authLoading) return
      if (!getAccessToken() || !user) return
      try {
        const res =
          user.role === 'employer'
            ? await listEmployerApplications()
            : await listApplications()
        if (!controller.signal.aborted) {
          setApplications(res.data)
        }
      } catch { /* intentionally empty */ }
    }

    init()
    return () => controller.abort()
  }, [authLoading, user])

  const addApplication = useCallback((app: Application) => {
    setApplications(prev => [app, ...prev])
  }, [])

  const updateApplicationStatus = useCallback(async (id: string, status: Application['status']) => {
    const res = await apiUpdateStatus(id, status)
    setApplications(prev => prev.map(a => a.id === id ? res.data : a))
  }, [])

  const updateApplicationInterview = useCallback(async (id: string, details: InterviewDetails) => {
    const res = await updateHiringData(id, { interviewData: details })
    setApplications(prev => prev.map(a => a.id === id ? res.data : a))
  }, [])

  const updateApplicationOffer = useCallback(async (id: string, details: OfferDetails) => {
    const res = await updateHiringData(id, { offerData: details })
    setApplications(prev => prev.map(a => a.id === id ? res.data : a))
  }, [])

  const updateApplicationChecklist = useCallback(async (id: string, items: OnboardingChecklistItem[]) => {
    const res = await updateHiringData(id, { preboardingData: items })
    setApplications(prev => prev.map(a => a.id === id ? res.data : a))
  }, [])

  const updateApplicationOrientation = useCallback(async (id: string, details: OrientationDetails) => {
    const res = await updateHiringData(id, { orientationData: details })
    setApplications(prev => prev.map(a => a.id === id ? res.data : a))
  }, [])

  const value = useMemo(
    () => ({
      applications,
      addApplication,
      updateApplicationStatus,
      updateApplicationInterview,
      updateApplicationOffer,
      updateApplicationChecklist,
      updateApplicationOrientation,
      setApplications,
    }),
    [applications, addApplication, updateApplicationStatus, updateApplicationInterview, updateApplicationOffer, updateApplicationChecklist, updateApplicationOrientation],
  )

  return <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApplications() {
  const ctx = useContext(ApplicationsContext)
  if (!ctx) throw new Error('useApplications must be used within ApplicationsProvider')
  return ctx
}
