import { render, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImportPromptButton } from '../ImportPromptButton'

function stubClipboard(writeText: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  })
}

describe('ImportPromptButton', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('copies the import prompt to the clipboard', async () => {
    const writeText = vi.fn(() => Promise.resolve())
    const user = userEvent.setup()
    stubClipboard(writeText)

    render(<ImportPromptButton />)

    await user.click(screen.getByRole('button', { name: /import prompt/i }))
    expect(writeText).toHaveBeenCalled()
    expect(writeText.mock.calls[0][0]).toContain('HireHub Job Import Prompt')
  })

  it('shows Copied! feedback for 2 seconds', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn(() => Promise.resolve())
    stubClipboard(writeText)

    render(<ImportPromptButton />)

    fireEvent.click(screen.getByRole('button', { name: /import prompt/i }))
    await act(async () => {})
    expect(screen.getByRole('button', { name: 'Copied!' })).toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })
    expect(screen.getByRole('button', { name: /import prompt/i })).toBeInTheDocument()
  })
})
