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

      {details.notes && (
        <div className="text-sm">
          <p className="text-ink-tertiary text-xs">Notes</p>
          <p className="text-ink">{details.notes}</p>
        </div>
      )}
    </div>
  )
}
