interface OnboardingProgressProps {
  current: number
  total: number
  labels: string[]
}

export function OnboardingProgress({ current, total, labels }: OnboardingProgressProps) {
  const pct = Math.round((current / Math.max(total - 1, 1)) * 100)
  return (
    <div className="sticky top-0 z-10 bg-canvas/95 backdrop-blur border-b border-hairline">
      <div className="mx-auto max-w-3xl px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-ink">Step {current + 1} of {total} — {labels[current]}</span>
          <span className="text-sm text-ink-muted">{pct}% complete</span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden" aria-hidden="true">
          <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  )
}
