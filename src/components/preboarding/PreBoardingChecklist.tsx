import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, Button } from '../ui'
import { sendPreBoardingChecklist } from '../../api/emails'
import type { Application } from '../../types/application'
import type { OnboardingChecklistItem, ChecklistCategory } from '../../types/hiring-flow'

const categoryColors: Record<ChecklistCategory, string> = {
  Documents: 'bg-blue-100 text-blue-700',
  'IT Setup': 'bg-green-100 text-green-700',
  Benefits: 'bg-purple-100 text-purple-700',
  Training: 'bg-amber-100 text-amber-700',
}

const defaultChecklistItems: OnboardingChecklistItem[] = [
  { id: '1', title: 'Complete employment application', label: 'Complete employment application', description: 'Fill out all required employment forms', category: 'Documents', completed: false },
  { id: '2', title: 'Provide identification documents', label: 'Provide identification documents', description: 'Submit government-issued ID and proof of work authorization', category: 'Documents', completed: false },
  { id: '3', title: 'Submit tax forms (W-4, I-9)', label: 'Submit tax forms (W-4, I-9)', description: 'Complete federal and state tax withholding forms', category: 'Documents', completed: false },
  { id: '4', title: 'Sign non-disclosure agreement', label: 'Sign non-disclosure agreement', description: 'Review and sign the company NDA', category: 'Documents', completed: false },
  { id: '5', title: 'Request IT equipment', label: 'Request IT equipment', description: 'Laptop, monitor, keyboard, mouse', category: 'IT Setup', completed: false },
  { id: '6', title: 'Create company email account', label: 'Create company email account', description: 'Set up your @company.com email address', category: 'IT Setup', completed: false },
  { id: '7', title: 'Complete benefits enrollment', label: 'Complete benefits enrollment', description: 'Select health, dental, vision, and 401k options', category: 'Benefits', completed: false },
]

interface PreBoardingChecklistProps {
  application: Application
  onCheckUpdate?: (items: OnboardingChecklistItem[]) => void
}

export function PreBoardingChecklist({ application, onCheckUpdate }: PreBoardingChecklistProps) {
  const [items, setItems] = useState<OnboardingChecklistItem[]>(() => {
    if (application.preBoardingChecklist && application.preBoardingChecklist.length > 0) {
      return application.preBoardingChecklist
    }
    return defaultChecklistItems
  })
  const [sending, setSending] = useState(false)

  const completedCount = items.filter((i) => i.completed).length
  const totalCount = items.length
  const allComplete = completedCount === totalCount && totalCount > 0
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  function toggleItem(id: string) {
    setItems((prev) => {
      const next = prev.map((item) =>
        item.id === id
          ? { ...item, completed: !item.completed, completedAt: !item.completed ? new Date().toISOString() : undefined }
          : item,
      )
      onCheckUpdate?.(next)
      return next
    })
  }

  async function handleSendEmail() {
    setSending(true)
    try {
      const startDate = application.offerDetails?.startDate ?? 'TBD'
      await sendPreBoardingChecklist({
        to: application.applicantEmail,
        candidateName: application.applicantName,
        deadline: startDate,
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <Card variant="default" className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-ink">Pre-Boarding Checklist</h3>
        <span className="text-sm text-ink-muted">
          {completedCount} of {totalCount} completed
        </span>
      </div>

      <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden mb-5">
        <motion.div
          className="h-full bg-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <ul className="space-y-3">
        {items.map((item) => {
          const title = item.title ?? item.label
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="w-full flex items-start gap-3 text-left group"
              >
                <span
                  className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    item.completed
                      ? 'bg-accent border-accent'
                      : 'border-ink/20 group-hover:border-accent'
                  }`}
                >
                  {item.completed && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-medium transition-colors ${
                        item.completed ? 'line-through text-ink-muted' : 'text-ink'
                      }`}
                    >
                      {title}
                    </span>
                    {item.category && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[item.category]}`}>
                        {item.category}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className={`text-xs mt-0.5 ${item.completed ? 'text-ink-tertiary line-through' : 'text-ink-muted'}`}>
                      {item.description}
                    </p>
                  )}
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      {allComplete && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 p-4 rounded-lg bg-success/10 border border-success/20"
        >
          <p className="text-sm font-medium text-success">
            All pre-boarding tasks complete! You&apos;re all set for your start date.
          </p>
        </motion.div>
      )}

      <div className="mt-5">
        <Button variant="secondary" size="sm" onClick={handleSendEmail} disabled={sending}>
          {sending ? 'Sending...' : 'Send Pre-Boarding Email'}
        </Button>
      </div>
    </Card>
  )
}
