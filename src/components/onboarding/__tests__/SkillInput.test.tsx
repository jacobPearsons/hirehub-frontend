import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SkillInput } from '../SkillInput'

function Harness({ max }: { max?: number }) {
  const [skills, setSkills] = useState<string[]>([])
  return <SkillInput value={skills} onChange={setSkills} max={max} />
}

describe('SkillInput', () => {
  it('adds a skill on Enter and renders it as a chip', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.type(screen.getByLabelText('Skills'), 'React{enter}')

    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByLabelText('Skills')).toHaveValue('')
  })

  it('removes a chip via its remove button', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.type(screen.getByLabelText('Skills'), 'Python{enter}')
    await user.click(screen.getByRole('button', { name: /remove python/i }))

    expect(screen.queryByText('Python')).not.toBeInTheDocument()
  })

  it('clicking a suggestion adds it', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.type(screen.getByLabelText('Skills'), 'Rust')

    expect(screen.getByRole('button', { name: 'Rust' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Rust' }))

    expect(screen.getByText('Rust')).toBeInTheDocument()
  })

  it('prevents adding more than max skills', async () => {
    const user = userEvent.setup()
    render(<Harness max={2} />)

    const input = screen.getByLabelText('Skills')
    await user.type(input, 'React{enter}')
    await user.type(input, 'Go{enter}')
    await user.type(input, 'Rust{enter}')

    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Go')).toBeInTheDocument()
    expect(screen.queryByText('Rust')).not.toBeInTheDocument()
  })

  it('shows an error message when provided', () => {
    render(<SkillInput value={[]} onChange={() => {}} error="Add at least 3 skills" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Add at least 3 skills')
  })
})
