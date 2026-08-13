import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import type { InterviewDetails as InterviewDetailsType, InterviewType } from '../../types/hiring-flow'

const typeBadgeConfig: Record<InterviewType, { label: string; color: string }> = {
  phone: { label: 'Phone', color: 'bg-accent/10 text-accent' },
  video: { label: 'Video', color: 'bg-ink-muted/10 text-ink-muted' },
  'website-chat': { label: 'Website Chat', color: 'bg-success/10 text-success' },
}

interface InterviewDetailsProps {
  details: InterviewDetailsType
}

export function InterviewDetails({ details }: InterviewDetailsProps) {
  const badge = typeBadgeConfig[details.interviewType]
  const { user } = useApp()
  const base = user?.role === 'employer' ? '/employer/dashboard' : '/dashboard'

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-pill text-xs font-medium ${badge.color}`}
        >
          {badge.label}
        </span>
        <h4 className="text-sm font-medium text-ink">Interview Details</h4>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-ink-tertiary text-xs">Date</p>
          <p className="text-ink">{details.interviewDate}</p>
        </div>
        <div>
          <p className="text-ink-tertiary text-xs">Time</p>
          <p className="text-ink">{details.interviewTime}</p>
        </div>
      </div>

      <div className="text-sm">
        <p className="text-ink-tertiary text-xs">Interviewer</p>
        <p className="text-ink">
          {details.interviewerName}
          <span className="text-ink-muted"> — {details.interviewerTitle}</span>
        </p>
      </div>

      {details.interviewType === 'video' && details.meetingLink && (
        <div className="text-sm">
          <p className="text-ink-tertiary text-xs">Meeting Link</p>
          <a
            href={details.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline break-all"
          >
            {details.meetingLink}
          </a>
        </div>
      )}

      {details.interviewType === 'website-chat' && (
        <div className="text-sm space-y-2">
          {details.conversationId && (
            <Link
              to={`${base}?tab=messages&conv=${details.conversationId}`}
              className="inline-flex items-center gap-1.5 rounded-pill bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-dark focus-visible:ring-2 focus-visible:ring-ink/30"
            >
              Open interview chat
            </Link>
          )}
          {details.questions && details.questions.length > 0 && (
            <div>
              <p className="text-ink-tertiary text-xs">Questions</p>
              <ul className="mt-1 space-y-1 text-ink">
                {details.questions.map((question, index) => (
                  <li key={question.id}>
                    {index + 1}. {question.prompt}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {details.notes && (
        <div className="text-sm">
          <p className="text-ink-tertiary text-xs">Notes</p>
          <p className="text-ink">{details.notes}</p>
        </div>
      )}
    </div>
  )
}
