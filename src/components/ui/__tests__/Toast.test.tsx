import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { ToastProvider, useToast } from '../Toast'

function ToastTrigger() {
  const { showToast } = useToast()
  return (
    <div>
      <button onClick={() => showToast('success', 'It worked!')}>Show success</button>
      <button onClick={() => showToast('error', 'Something broke')}>Show error</button>
      <button onClick={() => showToast('info', 'FYI')}>Show info</button>
    </div>
  )
}

describe('Toast', () => {
  it('ToastProvider renders without crashing', () => {
    render(
      <ToastProvider>
        <div>Child content</div>
      </ToastProvider>
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('shows a toast when showToast is called', async () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Show success' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('It worked!')
  })

  it('toast auto-dismisses after timeout', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Show success' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('It worked!')

    vi.advanceTimersByTime(4500)

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    }, { timeout: 5000 })
    vi.useRealTimers()
  }, 15000)

  it('toast can be manually dismissed via close button', async () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Show error' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Something broke')

    fireEvent.click(screen.getByLabelText('Dismiss'))

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    }, { timeout: 5000 })
  })
})
