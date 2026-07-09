import { motion } from 'framer-motion'
import { Button } from './Button'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      {icon && <div className="mb-4 text-ink-tertiary">{icon}</div>}
      <h3 className="text-lg font-medium text-ink mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-muted max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button variant="accent" size="sm" onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </motion.div>
  )
}
