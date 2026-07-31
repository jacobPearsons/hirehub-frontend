import { useState } from 'react'

interface AvatarProps {
  name: string
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  const [error, setError] = useState(false)
  const initials = getInitials(name)

  if (src && !error) {
    return (
      <img
        src={src}
        alt=""
        className={`rounded-full object-cover shrink-0 ${sizeClasses[size]} ${className}`}
        onError={() => setError(true)}
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      className={`rounded-full bg-accent/10 text-accent font-semibold flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`}
    >
      {initials}
    </div>
  )
}
