import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import PostJobForm from '../PostJobForm'
import { createJob } from '../../../api/jobs'

vi.mock('../../../api/jobs', () => ({
  createJob: vi.fn(),
}))

function renderPostJobForm() {
  return render(
    <MemoryRouter initialEntries={['/post-job']}>
      <PostJobForm />
    </MemoryRouter>
  )
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/job title/i), 'Senior Engineer')
  await user.type(screen.getByLabelText(/company name/i), 'Acme Corp')
  await user.type(screen.getByLabelText(/location/i), 'Lisbon')
  await user.type(screen.getByLabelText(/^description$/i), 'A great opportunity')
}

describe('PostJobForm screening questions', () => {
  beforeEach(() => {
    vi.mocked(createJob).mockClear()
  })

  it('adds a screening question row and submits it in the payload', async () => {
    const user = userEvent.setup()
    renderPostJobForm()
    await fillRequiredFields(user)

    await user.click(screen.getByRole('button', { name: /add screening question/i }))
    await user.type(screen.getByLabelText(/question prompt/i), 'Years of Python?')
    await user.type(screen.getByLabelText(/expected keywords/i), 'python, fastapi')
    await user.click(screen.getByRole('button', { name: /submit job listing/i }))

    await waitFor(() =>
      expect(createJob).toHaveBeenCalledWith(
        expect.objectContaining({
          screeningQuestions: [
            expect.objectContaining({
              prompt: 'Years of Python?',
              expectedKeywords: ['python', 'fastapi'],
              maxScore: 5,
              order: 1,
            }),
          ],
        })
      )
    )
  })

  it('removes a screening question row before submitting', async () => {
    const user = userEvent.setup()
    renderPostJobForm()
    await fillRequiredFields(user)

    await user.click(screen.getByRole('button', { name: /add screening question/i }))
    await user.type(screen.getByLabelText(/question prompt/i), 'First question')
    await user.click(screen.getByRole('button', { name: /add screening question/i }))
    await user.type(screen.getAllByLabelText(/question prompt/i)[1], 'Second question')
    await user.click(screen.getAllByRole('button', { name: /remove question/i })[0])
    await user.click(screen.getByRole('button', { name: /submit job listing/i }))

    await waitFor(() => {
      const payload = vi.mocked(createJob).mock.calls.at(-1)?.[0]
      expect(payload?.screeningQuestions).toHaveLength(1)
      expect(payload?.screeningQuestions?.[0]).toMatchObject({
        prompt: 'Second question',
        expectedKeywords: [],
        maxScore: 5,
        order: 1,
      })
    })
  })
})
