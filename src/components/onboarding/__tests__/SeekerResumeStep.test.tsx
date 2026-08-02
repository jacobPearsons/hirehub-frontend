import { render, screen } from '@testing-library/react'
import { SeekerResumeStep } from '../SeekerResumeStep'

vi.mock('../../../context/AppContext', () => ({
  useApp: () => ({
    user: { resumeFileName: 'sarah-cv.pdf', resumePath: '/uploads/sarah-cv.pdf' },
    setUser: vi.fn(),
  }),
}))

vi.mock('../../../api/auth', () => ({ updateProfile: vi.fn() }))
vi.mock('../../../api/client', () => ({ apiUpload: vi.fn() }))

describe('SeekerResumeStep', () => {
  it('shows the existing resume file name', () => {
    render(<SeekerResumeStep onSaved={vi.fn()} />)
    expect(screen.getByText('sarah-cv.pdf')).toBeInTheDocument()
  })
})
