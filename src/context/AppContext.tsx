import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import { setAccessToken as setApiToken, getAccessToken } from '../api/client'
import { getMe } from '../api/auth'
import { listSavedJobs } from '../api/savedJobs'
import { listApplications } from '../api/applications'
import type { Application } from '../types/application'

export interface AppUser {
  id: string
  name: string
  email: string
  role: 'seeker' | 'employer'
  companyName?: string
}

interface AppState {
  user: AppUser | null
  savedJobIds: string[]
  applications: Application[]
  loading: boolean
}

type AppAction =
  | { type: 'SET_USER'; payload: AppUser | null }
  | { type: 'TOGGLE_SAVE_JOB'; payload: string }
  | { type: 'ADD_APPLICATION'; payload: Application }
  | { type: 'UPDATE_APPLICATION_STATUS'; payload: { id: string; status: Application['status'] } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'HYDRATE'; payload: Partial<Pick<AppState, 'savedJobIds' | 'applications'>> }
  | { type: 'SET_SAVED_JOB_IDS'; payload: string[] }
  | { type: 'SET_APPLICATIONS'; payload: Application[] }

const initialState: AppState = {
  user: null,
  savedJobIds: [],
  applications: [],
  loading: true,
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'TOGGLE_SAVE_JOB':
      return {
        ...state,
        savedJobIds: state.savedJobIds.includes(action.payload)
          ? state.savedJobIds.filter((id) => id !== action.payload)
          : [...state.savedJobIds, action.payload],
      }
    case 'ADD_APPLICATION':
      return { ...state, applications: [action.payload, ...state.applications] }
    case 'UPDATE_APPLICATION_STATUS':
      return {
        ...state,
        applications: state.applications.map((a) =>
          a.id === action.payload.id ? { ...a, status: action.payload.status } : a
        ),
      }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'HYDRATE':
      return { ...state, ...action.payload }
    case 'SET_SAVED_JOB_IDS':
      return { ...state, savedJobIds: action.payload }
    case 'SET_APPLICATIONS':
      return { ...state, applications: action.payload }
    default:
      return state
  }
}

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<AppAction> } | null>(null)

function mapApiUser(user: { id: string; name: string; email: string; role: string; companyName?: string }): AppUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role === 'EMPLOYER' ? 'employer' : 'seeker',
    companyName: user.companyName,
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    async function init() {
      const token = getAccessToken()
      if (token) {
        try {
          const res = await getMe()
          dispatch({ type: 'SET_USER', payload: mapApiUser(res.data) })

          const [savedRes, appsRes] = await Promise.all([
            listSavedJobs(),
            listApplications(),
          ])
          dispatch({ type: 'SET_SAVED_JOB_IDS', payload: savedRes.data.map((j: any) => j.id) })
          dispatch({ type: 'SET_APPLICATIONS', payload: appsRes.data })
        } catch {
          setApiToken(null)
        }
      }

      try {
        const saved = localStorage.getItem('hirehub-state')
        if (saved) {
          const parsed = JSON.parse(saved)
          dispatch({ type: 'HYDRATE', payload: parsed })
        }
      } catch {}

      dispatch({ type: 'SET_LOADING', payload: false })
    }
    init()
  }, [])

  useEffect(() => {
    localStorage.setItem('hirehub-state', JSON.stringify({ savedJobIds: state.savedJobIds, applications: state.applications }))
  }, [state.savedJobIds, state.applications])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')

  const { state, dispatch } = ctx

  return {
    user: state.user,
    loading: state.loading,
    savedJobIds: state.savedJobIds,
    applications: state.applications,
    isSaved: (jobId: string) => state.savedJobIds.includes(jobId),
    toggleSaveJob: (jobId: string) => dispatch({ type: 'TOGGLE_SAVE_JOB', payload: jobId }),
    addApplication: (app: Application) => dispatch({ type: 'ADD_APPLICATION', payload: app }),
    updateApplicationStatus: (id: string, status: Application['status']) =>
      dispatch({ type: 'UPDATE_APPLICATION_STATUS', payload: { id, status } }),
    setLoading: (val: boolean) => dispatch({ type: 'SET_LOADING', payload: val }),
    setUser: (user: AppUser | null) => dispatch({ type: 'SET_USER', payload: user }),
    setSavedJobIds: (ids: string[]) => dispatch({ type: 'SET_SAVED_JOB_IDS', payload: ids }),
    setApplications: (apps: Application[]) => dispatch({ type: 'SET_APPLICATIONS', payload: apps }),
  }
}
