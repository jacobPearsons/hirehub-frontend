import { useState } from 'react'
import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import { saveJob, removeSavedJob } from '../../api/savedJobs'

interface SaveButtonProps {
  jobId: string
  className?: string
}

export function SaveButton({ jobId, className = '' }: SaveButtonProps) {
  const { isSaved, toggleSaveJob } = useApp()
  const [pending, setPending] = useState(false)
  const saved = isSaved(jobId)

  async function handleToggle() {
    if (pending) return
    setPending(true)
    toggleSaveJob(jobId)
    try {
      if (saved) {
        await removeSavedJob(jobId)
      } else {
        await saveJob(jobId)
      }
    } catch {
      toggleSaveJob(jobId)
    } finally {
      setPending(false)
    }
  }

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={handleToggle}
      disabled={pending}
      className={`inline-flex items-center justify-center p-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 ${
        saved ? 'text-error hover:text-error' : 'text-ink-tertiary hover:text-ink-muted'
      } ${className}`}
      aria-label={saved ? 'Remove from saved jobs' : 'Save job'}
      aria-pressed={saved}
    >
      <Heart
        size={20}
        className={`transition-transform ${saved ? 'fill-current scale-110' : ''} ${pending ? 'opacity-50' : ''}`}
      />
    </motion.button>
  )
}
