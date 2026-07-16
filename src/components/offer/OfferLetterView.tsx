import { useState } from 'react'
import { Card, Button } from '../ui'
import { useToast } from '../ui/Toast'
import type { Application, ApplicationStatus } from '../../types/application'

interface OfferLetterViewProps {
  application: Application
  onStatusUpdate: (applicationId: string, status: ApplicationStatus) => void
}

export function OfferLetterView({ application, onStatusUpdate }: OfferLetterViewProps) {
  const { showToast } = useToast()
  const [accepted, setAccepted] = useState(application.offerDetails?.accepted ?? false)
  const [declined, setDeclined] = useState(false)
  const [confirming, setConfirming] = useState<'accept' | 'decline' | null>(null)

  const offer = application.offerDetails
  if (!offer) return null

  const formattedRate = `${offer.currency === 'USD' ? '$' : offer.currency + ' '}${offer.hourlyRate.toLocaleString()}/hr`

  function handleAccept() {
    setAccepted(true)
    setConfirming(null)
    showToast('success', 'Offer accepted! We\'ll be in touch with next steps.')
  }

  function handleDecline() {
    setDeclined(true)
    setConfirming(null)
    onStatusUpdate(application.id, 'rejected')
    showToast('info', 'Offer declined. We understand.')
  }

  if (declined) {
    return (
      <Card variant="default" className="p-6">
        <p className="text-ink-muted text-sm">We understand. This offer has been declined.</p>
      </Card>
    )
  }

  if (accepted) {
    return (
      <Card variant="default" className="p-6">
        <p className="text-success text-sm font-medium">
          Thank you for accepting! We'll be in touch with next steps.
        </p>
      </Card>
    )
  }

  return (
    <Card variant="default" className="overflow-hidden">
      <div className="bg-accent text-white px-6 py-4">
        <h3 className="text-lg font-semibold">HireHub Community</h3>
        <p className="text-sm opacity-90">Official Offer of Employment</p>
      </div>

      <div className="p-6 space-y-5">
        <div>
          <p className="text-sm text-ink-muted">Dear {application.applicantName},</p>
          <p className="text-sm text-ink mt-2">
            We are pleased to extend this offer of employment for the following position:
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-ink-tertiary text-xs">Job Title</p>
            <p className="text-ink font-medium">{offer.jobTitle}</p>
          </div>
          <div>
            <p className="text-ink-tertiary text-xs">Employment Type</p>
            <p className="text-ink font-medium capitalize">{offer.employmentType.replace('-', ' ')}</p>
          </div>
          <div>
            <p className="text-ink-tertiary text-xs">Start Date</p>
            <p className="text-ink font-medium">
              {new Date(offer.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-ink-tertiary text-xs">Hourly Rate</p>
            <p className="text-ink font-medium">{formattedRate}</p>
          </div>
          <div>
            <p className="text-ink-tertiary text-xs">Schedule</p>
            <p className="text-ink font-medium">{offer.schedule}</p>
          </div>
          <div>
            <p className="text-ink-tertiary text-xs">Reporting To</p>
            <p className="text-ink font-medium">{offer.managerName}</p>
            <p className="text-ink-muted text-xs">{offer.managerTitle}</p>
          </div>
        </div>

        {offer.responsibilities.length > 0 && (
          <div>
            <p className="text-sm font-medium text-ink mb-2">Key Responsibilities</p>
            <ul className="list-disc list-inside text-sm text-ink-muted space-y-1">
              {offer.responsibilities.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {offer.contingencies.length > 0 && (
          <div>
            <p className="text-sm font-medium text-ink mb-2">Contingencies</p>
            <ul className="list-disc list-inside text-sm text-ink-muted space-y-1">
              {offer.contingencies.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-ink-tertiary">
          This offer expires on{' '}
          {new Date(offer.expirationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
        </p>

        <div className="flex gap-3 pt-2">
          {confirming === 'accept' ? (
            <>
              <Button variant="accent" size="md" onClick={handleAccept}>
                Confirm Accept
              </Button>
              <Button variant="ghost" size="md" onClick={() => setConfirming(null)}>
                Cancel
              </Button>
            </>
          ) : confirming === 'decline' ? (
            <>
              <Button variant="primary" size="md" onClick={handleDecline}>
                Confirm Decline
              </Button>
              <Button variant="ghost" size="md" onClick={() => setConfirming(null)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="accent" size="md" onClick={() => setConfirming('accept')}>
                Accept Offer
              </Button>
              <Button variant="ghost" size="md" onClick={() => setConfirming('decline')}>
                Decline
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
