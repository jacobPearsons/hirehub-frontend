import type { Job } from '../../data/jobs'

interface JobBodyProps {
  job: Job
}

export function JobBody({ job }: JobBodyProps) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-[28px] leading-[1.2] font-medium mb-4">About this role</h2>
        {job.description ? job.description.split('\n\n').map((paragraph, i) => (
          <p key={i} className="text-base leading-[1.7] text-ink-muted mb-4">
            {paragraph}
          </p>
        )) : null}
      </section>

      <section>
        <h2 className="text-[28px] leading-[1.2] font-medium mb-4">Requirements</h2>
        <ul className="list-disc list-inside space-y-2 text-base text-ink-muted">
          {job.requirements.map((req, i) => (
            <li key={i}>{req}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-[28px] leading-[1.2] font-medium mb-4">Responsibilities</h2>
        <ol className="list-decimal list-inside space-y-2 text-base text-ink-muted">
          {job.responsibilities.map((resp, i) => (
            <li key={i}>{resp}</li>
          ))}
        </ol>
      </section>
    </div>
  )
}
