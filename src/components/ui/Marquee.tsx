import { motion, useReducedMotionConfig } from 'framer-motion'
import type { ReactNode } from 'react'

interface MarqueeProps {
  items: ReactNode[]
  direction?: 'left' | 'right'
  duration?: number
  className?: string
}

export function Marquee({ items, direction = 'right', duration = 30, className }: MarqueeProps) {
  const reducedMotion = useReducedMotionConfig()

  if (reducedMotion) {
    return (
      <div className={`flex flex-wrap justify-center gap-8 md:gap-12 ${className ?? ''}`}>
        {items}
      </div>
    )
  }

  return (
    <div
      className={`overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] ${className ?? ''}`}
    >
      <motion.div
        className="flex w-max items-center gap-8 md:gap-12"
        animate={{ x: direction === 'right' ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ ease: 'linear', duration, repeat: Infinity }}
      >
        {[...items, ...items].map((item, i) => (
          <div key={i} aria-hidden={i >= items.length}>
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
