import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  type: ToastType
  message: string
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const colorMap = {
  success: 'text-success',
  error: 'text-error',
  info: 'text-accent',
}

let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const reducedMotion = useReducedMotion()

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, type, message }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9998] flex flex-col gap-3 pointer-events-none" aria-live="polite" aria-label="Notifications">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = iconMap[toast.type]
            return (
              <motion.div
                key={toast.id}
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20, scale: 0.95 }}
                animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: reducedMotion ? 0 : 0.25, ease: 'easeOut' }}
                className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-[10px] shadow-lg border border-hairline bg-surface-1 max-w-sm"
                role="alert"
              >
                <Icon className={`w-5 h-5 shrink-0 ${colorMap[toast.type]}`} />
                <span className="text-sm text-ink flex-1">{toast.message}</span>
                <button
                  onClick={() => dismiss(toast.id)}
                  className="shrink-0 text-ink-muted hover:text-ink transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
