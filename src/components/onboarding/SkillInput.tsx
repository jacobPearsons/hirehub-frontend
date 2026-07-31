import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'

const SUGGESTIONS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'Go', 'Rust',
  'SQL', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'CI/CD',
  'GraphQL', 'REST APIs', 'Figma', 'Agile', 'Communication', 'UI/UX', 'Testing', 'Git',
]

interface SkillInputProps {
  value: string[]
  onChange: (skills: string[]) => void
  max?: number
  error?: string
}

export function SkillInput({ value, onChange, max = 15, error }: SkillInputProps) {
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)

  const addSkill = (raw: string) => {
    const skill = raw.trim().replace(/,$/, '')
    if (!skill || value.includes(skill) || value.length >= max) return
    onChange([...value, skill])
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill(text)
      setText('')
    } else if (e.key === 'Backspace' && !text && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  const matches = SUGGESTIONS.filter(
    (s) => s.toLowerCase().includes(text.toLowerCase()) && !value.includes(s),
  )

  return (
    <div>
      <div className={`flex flex-wrap gap-2 p-3 rounded-md border bg-surface-1 ${error ? 'border-error' : 'border-hairline'}`}>
        {value.map((skill) => (
          <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-sm font-medium bg-accent/10 text-ink">
            {skill}
            <button
              type="button"
              onClick={() => onChange(value.filter((s) => s !== skill))}
              aria-label={`Remove ${skill}`}
              className="text-ink-muted hover:text-ink"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
        <input
          className="flex-1 min-w-[140px] bg-transparent outline-none text-sm text-ink placeholder:text-ink-tertiary"
          placeholder={value.length ? 'Add another skill…' : 'Type a skill and press Enter'}
          value={text}
          onChange={(e) => { setText(e.target.value); setOpen(true) }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          aria-label="Skills"
        />
      </div>
      {text && matches.length > 0 && open && (
        <ul className="mt-2 border border-hairline rounded-md bg-surface-1 overflow-hidden shadow-sm" role="listbox">
          {matches.map((s) => (
            <li key={s}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-surface-2"
                onMouseDown={(e) => { e.preventDefault(); addSkill(s); setText(''); }}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-1 text-sm text-error" role="alert">{error}</p>}
      <p className="mt-2 text-xs text-ink-muted">{value.length} of {max} — add at least 3</p>
    </div>
  )
}
