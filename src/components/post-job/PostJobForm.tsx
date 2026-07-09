import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { Button, Input } from '../ui'

const currencies = ['USD', 'EUR', 'GBP']
const categories = ['Engineering', 'Design', 'Marketing', 'Sales', 'Operations', 'Product', 'Support']
const seniorities = ['Junior', 'Mid', 'Senior', 'Lead', 'Executive']

export default function PostJobForm() {
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [location, setLocation] = useState('')
  const [remote, setRemote] = useState(false)
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [category, setCategory] = useState('Engineering')
  const [seniority, setSeniority] = useState('Mid')
  const [tags, setTags] = useState('')
  const [description, setDescription] = useState('')
  const [requirements, setRequirements] = useState('')
  const [responsibilities, setResponsibilities] = useState('')
  const [applicationUrl, setApplicationUrl] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const selectClass =
    'w-full rounded-md border border-hairline bg-surface-1 text-ink outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink px-3 py-2.5 text-sm'
  const textareaClass =
    'w-full rounded-md border border-hairline bg-surface-1 text-ink placeholder:text-ink-tertiary outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink px-3 py-2.5 text-sm'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {submitted && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/5 p-4"
        >
          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
          <div>
            <p className="font-medium text-ink">Job listing submitted!</p>
            <p className="mt-1 text-sm text-ink-muted">
              We'll review it and publish it within 24 hours.
            </p>
          </div>
        </div>
      )}

      <Input
        label="Job title"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Input
        label="Company name"
        required
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />

      <Input
        label="Location"
        required
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={remote}
            onChange={(e) => setRemote(e.target.checked)}
            className="h-4 w-4 rounded border-hairline accent-ink"
          />
          This job is remote
        </label>
      </div>

      <div>
        <label className="text-sm font-medium text-ink mb-1.5 block">Salary range</label>
        <div className="flex gap-3">
          <Input
            label="Min (USD)"
            type="number"
            placeholder="Min"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            className="[&>div]:mb-0"
          />
          <Input
            label="Max (USD)"
            type="number"
            placeholder="Max"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-ink mb-1.5 block" htmlFor="currency">
          Currency
        </label>
        <select
          id="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className={selectClass}
        >
          {currencies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-ink mb-1.5 block" htmlFor="category">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={selectClass}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-ink mb-1.5 block" htmlFor="seniority">
          Seniority
        </label>
        <select
          id="seniority"
          value={seniority}
          onChange={(e) => setSeniority(e.target.value)}
          className={selectClass}
        >
          {seniorities.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Tags"
        placeholder="Comma-separated (e.g. React, TypeScript, AWS)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      <div>
        <label className="text-sm font-medium text-ink mb-1.5 block" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          rows={6}
          placeholder="Full job description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={textareaClass}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-ink mb-1.5 block" htmlFor="requirements">
          Requirements
        </label>
        <textarea
          id="requirements"
          rows={4}
          placeholder="One per line..."
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          className={textareaClass}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-ink mb-1.5 block" htmlFor="responsibilities">
          Responsibilities
        </label>
        <textarea
          id="responsibilities"
          rows={4}
          placeholder="One per line..."
          value={responsibilities}
          onChange={(e) => setResponsibilities(e.target.value)}
          className={textareaClass}
        />
      </div>

      <Input
        label="Application URL"
        type="url"
        placeholder="https://..."
        value={applicationUrl}
        onChange={(e) => setApplicationUrl(e.target.value)}
      />

      <Button variant="primary" size="lg" className="w-full" type="submit">
        Submit job listing
      </Button>
    </form>
  )
}
