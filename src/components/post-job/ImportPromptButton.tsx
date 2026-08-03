import { useState } from 'react'
import template from '../../data/import-template.md?raw'

export function ImportPromptButton() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(template)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-md bg-transparent px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
    >
      {copied ? 'Copied!' : 'Copy import prompt'}
    </button>
  )
}
