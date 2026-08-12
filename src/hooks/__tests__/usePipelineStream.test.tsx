import { render, screen } from '@testing-library/react'
import { act, useEffect, useRef } from 'react'
import { usePipelineStream } from '../usePipelineStream'

const { subscribeMock, unsubscribeMock, useAuthMock } = vi.hoisted(() => ({
  subscribeMock: vi.fn(),
  unsubscribeMock: vi.fn(),
  useAuthMock: vi.fn(),
}))

vi.mock('../../context/NotificationsContext', () => ({
  useNotifications: () => ({
    subscribe: subscribeMock,
    unsubscribe: unsubscribeMock,
  }),
}))

vi.mock('../../context/AuthContext', () => ({
  useAuth: useAuthMock,
}))

function Harness({ onRefetch }: { onRefetch: () => void }) {
  const streamVersion = usePipelineStream()
  const skipFirst = useRef(true)

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false
      return
    }
    onRefetch()
  }, [streamVersion, onRefetch])

  return <div data-testid="version">{streamVersion}</div>
}

const employerUser = { id: 'u1', name: 'Acme', email: 'a@test.com', role: 'employer' as const }
const seekerUser = { id: 'u2', name: 'Bob', email: 'b@test.com', role: 'seeker' as const }

describe('usePipelineStream', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('subscribes to application:updated for an employer and increments streamVersion per event', () => {
    useAuthMock.mockReturnValue({ user: employerUser, loading: false })
    const onRefetch = vi.fn()
    render(<Harness onRefetch={onRefetch} />)

    expect(subscribeMock).toHaveBeenCalledWith('application:updated', expect.any(Function))
    expect(screen.getByTestId('version')).toHaveTextContent('0')
    expect(onRefetch).not.toHaveBeenCalled()

    const handler = subscribeMock.mock.calls[0][1]
    act(() => {
      handler(new MessageEvent('application:updated'))
    })

    expect(screen.getByTestId('version')).toHaveTextContent('1')
    expect(onRefetch).toHaveBeenCalledTimes(1)
  })

  it('increments streamVersion on repeated events', () => {
    useAuthMock.mockReturnValue({ user: employerUser, loading: false })
    render(<Harness onRefetch={vi.fn()} />)

    const handler = subscribeMock.mock.calls[0][1]
    act(() => {
      handler(new MessageEvent('application:updated'))
      handler(new MessageEvent('application:updated'))
    })

    expect(screen.getByTestId('version')).toHaveTextContent('2')
  })

  it('does not subscribe when the role is not employer', () => {
    useAuthMock.mockReturnValue({ user: seekerUser, loading: false })
    render(<Harness onRefetch={vi.fn()} />)

    expect(subscribeMock).not.toHaveBeenCalled()
    expect(screen.getByTestId('version')).toHaveTextContent('0')
  })

  it('unsubscribes from application:updated on unmount', () => {
    useAuthMock.mockReturnValue({ user: employerUser, loading: false })
    const { unmount } = render(<Harness onRefetch={vi.fn()} />)

    const handler = subscribeMock.mock.calls[0][1]
    unmount()

    expect(unsubscribeMock).toHaveBeenCalledWith('application:updated', handler)
  })
})
