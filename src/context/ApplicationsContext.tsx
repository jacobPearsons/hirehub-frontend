import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'
import { listApplications } from '../api/applications'
import { getAccessToken } from '../api/client'
import type { Application } from '../types/application'
import type { InterviewDetails, OfferDetails, OnboardingChecklistItem, OrientationDetails } from '../types/hiring-flow'

interface ApplicationsContextValue {
  applications: Application[]
  addApplication: (app: Application) => void
  updateApplicationStatus: (id: string, status: Application['status']) => void
  updateApplicationInterview: (id: string, details: InterviewDetails) => void
  updateApplicationOffer: (id: string, details: OfferDetails) => void
  updateApplicationChecklist: (id: string, items: OnboardingChecklistItem[]) => void
  updateApplicationOrientation: (id: string, details: OrientationDetails) => void
  setApplications: (apps: Application[]) => void
}

const ApplicationsContext = createContext<ApplicationsContextValue | null>(null)

export function ApplicationsProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<Application[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hirehub-applications')
      if (saved) setApplications(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('hirehub-applications', JSON.stringify(applications))
  }, [applications])

  useEffect(() => {
    const controller = new AbortController()

    async function init() {
      if (!getAccessToken()) return
      try {
        const res = await listApplications()
        if (!controller.signal.aborted) {
          setApplications(res.data)
        }
      } catch {}
    }

    init()
    return () => controller.abort()
  }, [])

  const addApplication = useCallback((app: Application) => {
    setApplications(prev => [app, ...prev])
  }, [])

  const updateApplicationStatus = useCallback((id: string, status: Application['status']) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }, [])

  const updateApplicationInterview = useCallback((id: string, details: InterviewDetails) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, interviewDetails: details } : a))
  }, [])

  const updateApplicationOffer = useCallback((id: string, details: OfferDetails) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, offerDetails: details } : a))
  }, [])

  const updateApplicationChecklist = useCallback((id: string, items: OnboardingChecklistItem[]) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, preBoardingChecklist: items } : a))
  }, [])

  const updateApplicationOrientation = useCallback((id: string, details: OrientationDetails) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, orientationDetails: details } : a))
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

export function useApplications() {
  const ctx = useContext(ApplicationsContext)
  if (!ctx) throw new Error('useApplications must be used within ApplicationsProvider')
  return ctx
}
