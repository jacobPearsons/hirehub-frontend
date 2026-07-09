import type { ReactNode } from 'react'

interface HeroContentProps {
  variant?: 'card' | 'accent'
  children: ReactNode
  className?: string
}

export function HeroContent({
  variant = 'card',
  children,
  className = '',
}: HeroContentProps) {
  const styles = {
    card: 'bg-surface-1/80 backdrop-blur-sm border border-hairline rounded-lg p-8 md:p-10',
    accent: 'border-l-2 border-accent pl-4',
  }

  return (
    <div className={`${styles[variant]} ${className}`}>
      {children}
    </div>
  )
}
