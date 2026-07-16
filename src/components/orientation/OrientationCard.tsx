import type { OrientationDetails } from '../../types/hiring-flow'

interface OrientationCardProps {
  details: OrientationDetails
  preBoardingComplete?: boolean
}

function formatOrientationDate(dateStr: string, timeStr: string): string {
  const date = new Date(`${dateStr}T${timeStr}`)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) + ' at ' + date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

const dotColors = [
  'bg-accent',
  'bg-success',
  'bg-ink-muted',
  'bg-accent/60',
  'bg-success/60',
  'bg-ink-muted/60',
]

export function OrientationCard({ details, preBoardingComplete }: OrientationCardProps) {
  const formattedDate = formatOrientationDate(details.date, details.time)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-pill text-xs font-medium bg-success/10 text-success">
          Orientation
        </span>
        <h4 className="text-sm font-medium text-ink">Your Orientation Schedule</h4>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-ink-tertiary text-xs">Date & Time</p>
          <p className="text-ink">{formattedDate}</p>
        </div>
        <div>
          <p className="text-ink-tertiary text-xs">Location</p>
          <p className="text-ink">{details.location}</p>
        </div>
      </div>

      {details.agenda.length > 0 && (
        <div className="text-sm">
          <p className="text-ink-tertiary text-xs mb-2">Agenda</p>
          <div className="relative ml-2 space-y-3">
            {details.agenda.map((item, i) => (
              <div key={i} className="flex items-start gap-3 relative">
                <div className="relative flex-shrink-0 mt-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${dotColors[i % dotColors.length]}`} />
                  {i < details.agenda.length - 1 && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-px h-full bg-hairline" />
                  )}
                </div>
                <p className="text-ink leading-snug">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {details.notes && (
        <div className="text-sm">
          <p className="text-ink-tertiary text-xs">Important Notes</p>
          <p className="text-ink">{details.notes}</p>
        </div>
      )}

      {details.dressCode && (
        <div className="text-sm">
          <p className="text-ink-tertiary text-xs">Dress Code</p>
          <p className="text-ink">{details.dressCode}</p>
        </div>
      )}

      {details.parkingInfo && (
        <div className="text-sm">
          <p className="text-ink-tertiary text-xs">Parking & Transit</p>
          <p className="text-ink">{details.parkingInfo}</p>
        </div>
      )}

      {preBoardingComplete === false && (
        <div className="pt-2">
          <a
            href="#pre-boarding"
            className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            View Pre-Boarding Checklist
          </a>
        </div>
      )}
    </div>
  )
}
