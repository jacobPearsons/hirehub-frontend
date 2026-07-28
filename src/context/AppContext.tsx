import { useMemo, type ReactNode } from 'react'
import { AuthProvider, useAuth, type AppUser } from './AuthContext'
import { SavedJobsProvider, useSavedJobs } from './SavedJobsContext'
import { ApplicationsProvider, useApplications } from './ApplicationsContext'


export type { AppUser }

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SavedJobsProvider>
        <ApplicationsProvider>
          {children}
        </ApplicationsProvider>
      </SavedJobsProvider>
    </AuthProvider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const { user, loading, setUser, setLoading } = useAuth()
  const { savedJobIds, isSaved, toggleSaveJob, setSavedJobIds } = useSavedJobs()
  const { applications, addApplication, updateApplicationStatus, setApplications } = useApplications()

  return useMemo(() => ({
    user,
    loading,
    savedJobIds,
    applications,
    isSaved,
    toggleSaveJob,
    addApplication,
    updateApplicationStatus,
    setLoading,
    setUser,
    setSavedJobIds,
    setApplications,
  }), [
    user,
    loading,
    savedJobIds,
    applications,
    isSaved,
    toggleSaveJob,
    addApplication,
    updateApplicationStatus,
    setLoading,
    setUser,
    setSavedJobIds,
    setApplications,
  ])
}
