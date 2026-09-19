import { useEffect, useState } from 'react'
import { useReducedMotionConfig } from 'framer-motion'

interface TypewriterProps {
  text: string
  speed?: number
  deleteSpeed?: number
  holdMs?: number
  className?: string
}

export function Typewriter({
  text,
  speed = 45,
  deleteSpeed = 25,
  holdMs = 2500,
  className,
}: TypewriterProps) {
  const reducedMotion = useReducedMotionConfig()
  const [count, setCount] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (reducedMotion) return

    let timer: number | undefined

    if (deleting) {
      if (count > 0) {
        timer = window.setTimeout(() => setCount((c) => c - 1), deleteSpeed)
      } else {
        timer = window.setTimeout(() => {
          setDeleting(false)
          setCount(1)
        }, 0)
      }
    } else {
      timer = window.setTimeout(
        () => (count < text.length ? setCount((c) => c + 1) : setDeleting(true)),
        count < text.length ? speed : holdMs,
      )
    }

    return () => {
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [deleting, count, text, speed, deleteSpeed, holdMs, reducedMotion])

  const visible = reducedMotion ? text : text.slice(0, count)
  const holding = !deleting && count === text.length
  const showCaret = !reducedMotion && !holding

  return (
    <span aria-label={text} className={`relative inline-block ${className ?? ''}`}>
      {reducedMotion ? (
        <span aria-hidden="true">{text}</span>
      ) : (
        <>
          <span aria-hidden="true" className="invisible">
            {text}
          </span>
          <span aria-hidden="true" className="absolute inset-0">
            {visible}
            <span
              className={`inline-block w-[1ch] ${showCaret ? 'animate-pulse' : 'opacity-0'}`}
            >
              |
            </span>
          </span>
        </>
      )}
    </span>
  )
}
