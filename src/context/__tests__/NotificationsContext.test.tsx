import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act, useCallback, useEffect, useState } from 'react'
import { NotificationsProvider, useNotifications } from '../NotificationsContext'
import type { Notification } from '../../types/notification'

const {
  useAuthMock,
  getAccessTokenMock,
  listNotificationsMock,
  markNotificationReadMock,
  markAllNotificationsReadMock,
  showToastMock,
} = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  getAccessTokenMock: vi.fn(),
  listNotificationsMock: vi.fn(),
  markNotificationReadMock: vi.fn(),
  markAllNotificationsReadMock: vi.fn(),
  showToastMock: vi.fn(),
}))

vi.mock('../../context/AuthContext', () => ({
  useAuth: useAuthMock,
}))

vi.mock('../../api/client', () => ({
  API_BASE: 'http://localhost:4000/api',
  getAccessToken: getAccessTokenMock,
}))

vi.mock('../../api/notifications', () => ({
  listNotifications: listNotificationsMock,
  markNotificationRead: markNotificationReadMock,
  markAllNotificationsRead: markAllNotificationsReadMock,
}))

vi.mock('../../components/ui/Toast', () => ({
  useToast: () => ({ showToast: showToastMock }),
}))

class MockEventSource {
  static instances: MockEventSource[] = []
  url: string
  onmessage: ((e: unknown) => void) | null = null
  onerror: ((e: unknown) => void) | null = null
  onopen: ((e: unknown) => void) | null = null
  listeners: Record<string, Array<(e: unknown) => void>> = {}
  closed = false

  constructor(url: string) {
    this.url = url
    MockEventSource.instances.push(this)
  }

  close() {
    this.closed = true
  }

  addEventListener(type: string, cb: (e: unknown) => void) {
    const list = this.listeners[type] ?? []
    list.push(cb)
    this.listeners[type] = list
  }
}

function dispatch(type: string, data: unknown) {
  const es = MockEventSource.instances[0]
  es.listeners[type]?.forEach((cb) => cb({ data: JSON.stringify(data) }))
}

const originalEventSource = globalThis.EventSource

const mockUser = {
  id: 'u1',
  name: 'Alice',
  email: 'alice@test.com',
  role: 'seeker' as const,
}

const notifications: Notification[] = [
  { id: 'n1', type: 'APPLICATION_STATUS', title: 'Application updated', body: 'Now reviewing', read: false, createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'n2', type: 'SYSTEM', title: 'Welcome', body: 'Hi', read: true, createdAt: '2025-01-01T00:00:00.000Z' },
]

function Consumer() {
  const { notifications, unreadCount, markRead, markAllRead, refresh } = useNotifications()
  return (
    <div>
      <span data-testid="count">{unreadCount}</span>
      <span data-testid="items">{JSON.stringify(notifications)}</span>
      <button onClick={() => markRead('n1')}>mark read</button>
      <button onClick={() => markAllRead()}>mark all read</button>
      <button onClick={() => refresh()}>refresh</button>
    </div>
  )
}

function renderWithUser(user: typeof mockUser | null) {
  useAuthMock.mockReturnValue({ user, loading: false })
  return render(
    <NotificationsProvider>
      <Consumer />
    </NotificationsProvider>
  )
}

function SubscribedConsumer() {
  const { subscribe } = useNotifications()
  const [count, setCount] = useState(0)

  useEffect(() => {
    subscribe('application:updated', () => setCount((c) => c + 1))
  }, [subscribe])

  return <span data-testid="stream-count">{count}</span>
}

function LateSubscribingConsumer() {
  const { subscribe } = useNotifications()
  const [count, setCount] = useState(0)

  return (
    <div>
      <span data-testid="stream-count">{count}</span>
      <button onClick={() => subscribe('application:updated', () => setCount((c) => c + 1))}>subscribe</button>
    </div>
  )
}

function ResubscribingConsumer() {
  const { subscribe, unsubscribe } = useNotifications()
  const [count, setCount] = useState(0)
  const [active, setActive] = useState(true)

  const handleEvent = useCallback(() => {
    setCount((c) => c + 1)
  }, [])

  useEffect(() => {
    if (active) subscribe('application:updated', handleEvent)
    else unsubscribe('application:updated', handleEvent)
  }, [active, subscribe, unsubscribe, handleEvent])

  return (
    <div>
      <span data-testid="stream-count">{count}</span>
      <button onClick={() => setActive(false)}>unsubscribe</button>
      <button onClick={() => setActive(true)}>resubscribe</button>
    </div>
  )
}

function renderSubscribed() {
  useAuthMock.mockReturnValue({ user: mockUser, loading: false })
  return render(
    <NotificationsProvider>
      <SubscribedConsumer />
    </NotificationsProvider>
  )
}

function renderLateSubscribing() {
  useAuthMock.mockReturnValue({ user: mockUser, loading: false })
  return render(
    <NotificationsProvider>
      <LateSubscribingConsumer />
    </NotificationsProvider>
  )
}

function renderResubscribing() {
  useAuthMock.mockReturnValue({ user: mockUser, loading: false })
  return render(
    <NotificationsProvider>
      <ResubscribingConsumer />
    </NotificationsProvider>
  )
}

describe('NotificationsContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getAccessTokenMock.mockReturnValue('test-token')
    MockEventSource.instances = []
    globalThis.EventSource = MockEventSource as unknown as typeof EventSource
  })

  afterEach(() => {
    globalThis.EventSource = originalEventSource
  })

  it('loads notifications and exposes unreadCount for a logged-in user', async () => {
    listNotificationsMock.mockResolvedValue({ data: { items: notifications, unreadCount: 1 }, success: true })
    renderWithUser(mockUser)

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('1')
    })
    expect(listNotificationsMock).toHaveBeenCalledTimes(1)
    const items = JSON.parse(screen.getByTestId('items').textContent!)
    expect(items).toHaveLength(2)
    expect(items[0].id).toBe('n1')
  })

  it('opens the SSE stream with the access token in the URL', async () => {
    listNotificationsMock.mockResolvedValue({ data: { items: [], unreadCount: 0 }, success: true })
    renderWithUser(mockUser)

    await waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1)
    })
    expect(MockEventSource.instances[0].url).toContain('/notifications/stream?token=test-token')
  })

  it('prepends live notifications and shows a toast with the title', async () => {
    listNotificationsMock.mockResolvedValue({ data: { items: notifications, unreadCount: 1 }, success: true })
    renderWithUser(mockUser)

    await waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1)
    })

    const live: Notification = { id: 'n3', type: 'NEW_MESSAGE', title: 'New message', body: 'Hi there', read: false, createdAt: '2025-01-02T00:00:00.000Z' }
    dispatch('notification', live)

    await waitFor(() => {
      const items = JSON.parse(screen.getByTestId('items').textContent!)
      expect(items).toHaveLength(3)
      expect(items[0].id).toBe('n3')
      expect(screen.getByTestId('count')).toHaveTextContent('2')
    })
    expect(showToastMock).toHaveBeenCalledWith('info', 'New message')
  })

  it('dedupes live notifications by id', async () => {
    listNotificationsMock.mockResolvedValue({ data: { items: [], unreadCount: 0 }, success: true })
    renderWithUser(mockUser)

    await waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1)
    })

    const live: Notification = { id: 'n9', type: 'SYSTEM', title: 'Dup', body: 'x', read: false, createdAt: '2025-01-02T00:00:00.000Z' }
    dispatch('notification', live)
    dispatch('notification', live)

    await waitFor(() => {
      const items = JSON.parse(screen.getByTestId('items').textContent!)
      expect(items.filter((n: Notification) => n.id === 'n9')).toHaveLength(1)
    })
  })

  it('markRead calls the api and flips the local item to read', async () => {
    listNotificationsMock.mockResolvedValue({ data: { items: notifications, unreadCount: 1 }, success: true })
    markNotificationReadMock.mockResolvedValue({ data: { ...notifications[0], read: true }, success: true })
    const user = userEvent.setup()
    renderWithUser(mockUser)

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('1')
    })

    await user.click(screen.getByRole('button', { name: 'mark read' }))

    await waitFor(() => {
      expect(markNotificationReadMock).toHaveBeenCalledWith('n1')
      expect(screen.getByTestId('count')).toHaveTextContent('0')
      const items = JSON.parse(screen.getByTestId('items').textContent!)
      expect(items.find((n: Notification) => n.id === 'n1').read).toBe(true)
    })
  })

  it('markAllRead calls the api and flips all local items to read', async () => {
    const mixed = [
      { ...notifications[0], read: false },
      { ...notifications[1], read: false },
    ]
    listNotificationsMock.mockResolvedValue({ data: { items: mixed, unreadCount: 2 }, success: true })
    markAllNotificationsReadMock.mockResolvedValue({ data: { count: 2 }, success: true })
    const user = userEvent.setup()
    renderWithUser(mockUser)

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('2')
    })

    await user.click(screen.getByRole('button', { name: 'mark all read' }))

    await waitFor(() => {
      expect(markAllNotificationsReadMock).toHaveBeenCalledTimes(1)
      expect(screen.getByTestId('count')).toHaveTextContent('0')
      const items = JSON.parse(screen.getByTestId('items').textContent!)
      expect(items.every((n: Notification) => n.read)).toBe(true)
    })
  })

  it('resets state and closes the stream when the user logs out', async () => {
    listNotificationsMock.mockResolvedValue({ data: { items: notifications, unreadCount: 1 }, success: true })
    const view = renderWithUser(mockUser)

    await waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1)
    })
    expect(MockEventSource.instances[0].closed).toBe(false)

    useAuthMock.mockReturnValue({ user: null, loading: false })
    view.rerender(
      <NotificationsProvider>
        <Consumer />
      </NotificationsProvider>
    )

    await waitFor(() => {
      expect(MockEventSource.instances[0].closed).toBe(true)
      expect(screen.getByTestId('count')).toHaveTextContent('0')
      expect(screen.getByTestId('items')).toHaveTextContent('[]')
    })
  })

  it('does not fetch or open a stream when there is no user', () => {
    renderWithUser(null)

    expect(listNotificationsMock).not.toHaveBeenCalled()
    expect(MockEventSource.instances).toHaveLength(0)
  })

  it('refresh refetches the list', async () => {
    listNotificationsMock.mockResolvedValue({ data: { items: [], unreadCount: 0 }, success: true })
    const user = userEvent.setup()
    renderWithUser(mockUser)

    await waitFor(() => {
      expect(listNotificationsMock).toHaveBeenCalledTimes(1)
    })

    listNotificationsMock.mockResolvedValue({ data: { items: notifications, unreadCount: 1 }, success: true })
    await user.click(screen.getByRole('button', { name: 'refresh' }))

    await waitFor(() => {
      expect(listNotificationsMock).toHaveBeenCalledTimes(2)
      expect(screen.getByTestId('count')).toHaveTextContent('1')
    })
  })

  it('subscribes before connect and forwards application:updated over the single SSE stream', async () => {
    listNotificationsMock.mockResolvedValue({ data: { items: [], unreadCount: 0 }, success: true })
    renderSubscribed()

    await waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1)
    })

    act(() => {
      dispatch('application:updated', { applicationId: 'a1' })
    })

    expect(screen.getByTestId('stream-count')).toHaveTextContent('1')
    expect(MockEventSource.instances).toHaveLength(1)
  })

  it('attaches a subscriber to the already-open SSE stream without opening a second connection', async () => {
    listNotificationsMock.mockResolvedValue({ data: { items: [], unreadCount: 0 }, success: true })
    const user = userEvent.setup()
    renderLateSubscribing()

    await waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1)
    })

    await user.click(screen.getByRole('button', { name: 'subscribe' }))

    act(() => {
      dispatch('application:updated', { applicationId: 'a1' })
      dispatch('application:updated', { applicationId: 'a2' })
    })

    expect(screen.getByTestId('stream-count')).toHaveTextContent('2')
    expect(MockEventSource.instances).toHaveLength(1)
  })

  it('reuses a single dispatcher across unsubscribe → resubscribe on the same live connection', async () => {
    listNotificationsMock.mockResolvedValue({ data: { items: [], unreadCount: 0 }, success: true })
    const user = userEvent.setup()
    renderResubscribing()

    await waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1)
    })
    expect(MockEventSource.instances[0].listeners['application:updated']).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'unsubscribe' }))
    await user.click(screen.getByRole('button', { name: 'resubscribe' }))

    expect(MockEventSource.instances[0].listeners['application:updated']).toHaveLength(1)

    act(() => {
      dispatch('application:updated', { applicationId: 'a1' })
    })

    expect(screen.getByTestId('stream-count')).toHaveTextContent('1')
    expect(MockEventSource.instances).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'unsubscribe' }))

    act(() => {
      dispatch('application:updated', { applicationId: 'a2' })
    })

    expect(screen.getByTestId('stream-count')).toHaveTextContent('1')
  })
})
