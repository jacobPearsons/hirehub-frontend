import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SKILL_NICHES } from '../../../data/skills'
import { SeekerSkillsStep } from '../SeekerSkillsStep'

vi.mock('../../../context/AppContext', () => ({
  useApp: () => ({
    user: { skills: [] },
    setUser: vi.fn(),
  }),
}))

vi.mock('../../../api/auth', () => ({ updateProfile: vi.fn() }))

vi.mock('../SkillInput', () => ({
  SkillInput: ({ value, onChange, niche }: { value: string[]; onChange: (skills: string[]) => void; niche?: string }) => (
    <div data-testid="skill-input" data-niche={niche}>
      {value.map((skill) => (
        <span key={skill}>{skill}</span>
      ))}
      <button type="button" onClick={() => onChange([...value, 'React'])}>
        add-skill
      </button>
    </div>
  ),
}))

describe('SeekerSkillsStep', () => {
  it('renders a niche picker with one button per category, General selected by default', () => {
    render(<SeekerSkillsStep onSaved={vi.fn()} />)

    for (const { label } of SKILL_NICHES) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
    expect(screen.getByRole('button', { name: 'General' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('skill-input')).toHaveAttribute('data-niche', 'general')
  })

  it('passes the chosen niche to SkillInput', async () => {
    const user = userEvent.setup()
    render(<SeekerSkillsStep onSaved={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'General Office & Administrative' }))

    expect(screen.getByRole('button', { name: 'General Office & Administrative' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'General' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByTestId('skill-input')).toHaveAttribute('data-niche', 'office')
  })
})
