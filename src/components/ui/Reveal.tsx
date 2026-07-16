import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}

export function Reveal({ children, className, delay = 0, y = 24 }: RevealProps) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      whileInView={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: reducedMotion ? 0 : 0.45, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
