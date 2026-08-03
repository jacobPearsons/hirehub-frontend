import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ToastProvider } from '../../ui/Toast'
import { NotificationBell } from '../NotificationBell'
import type { Notification } from '../../../types/notification'

const {
  useNotificationsMock,
  useAppMock,
  markReadMock,
  markAllReadMock,
  refreshMock,
} = vi.hoisted(() => ({
  useNotificationsMock: vi.fn(),
  useAppMock: vi.fn(),
  markReadMock: vi.fn(),
  markAllReadMock: vi.fn(),
  refreshMock: vi.fn(),
}))

vi.mock('../../../context/NotificationsContext', () => ({
  useNotifications: useNotificationsMock,
}))

vi.mock('../../../context/AppContext', () => ({
  useApp: useAppMock,
}))

const notifications: Notification[] = [
  { id: 'n1', type: 'APPLICATION_STATUS', title: 'Application updated', body: 'Now reviewing your application', read: false, createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'n2', type: 'SYSTEM', title: 'Welcome', body: 'Glad to have you on board', read: true, createdAt: '2025-01-02T00:00:00.000Z' },
]

function renderBell() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <NotificationBell />
      </ToastProvider>
    </MemoryRouter>
  )
}

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAppMock.mockReturnValue({ user: { name: 'Test User' } })
    markReadMock.mockResolvedValue(undefined)
    markAllReadMock.mockResolvedValue(undefined)
    refreshMock.mockResolvedValue(undefined)
    useNotificationsMock.mockReturnValue({
      notifications,
      unreadCount: 1,
      markRead: markReadMock,
      markAllRead: markAllReadMock,
      refresh: refreshMock,
    })
  })

  it('renders the bell button with aria-label "Notifications"', () => {
    renderBell()
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument()
  })

  it('shows the unread badge count when unreadCount is greater than 0', () => {
    useNotificationsMock.mockReturnValue({
      notifications,
      unreadCount: 3,
      markRead: markReadMock,
      markAllRead: markAllReadMock,
      refresh: refreshMock,
    })
    renderBell()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('opens the panel and lists notification titles when clicked', async () => {
    const user = userEvent.setup()
    renderBell()
    await user.click(screen.getByRole('button', { name: 'Notifications' }))
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('Application updated')).toBeInTheDocument()
    expect(screen.getByText('Welcome')).toBeInTheDocument()
  })

  it('calls markRead(id) when an unread item is clicked', async () => {
    const user = userEvent.setup()
    renderBell()
    await user.click(screen.getByRole('button', { name: 'Notifications' }))
    await user.click(screen.getByText('Application updated'))
    expect(markReadMock).toHaveBeenCalledWith('n1')
  })

  it('calls markAllRead() when "Mark all read" is clicked', async () => {
    const user = userEvent.setup()
    renderBell()
    await user.click(screen.getByRole('button', { name: 'Notifications' }))
    await user.click(screen.getByRole('button', { name: 'Mark all read' }))
    expect(markAllReadMock).toHaveBeenCalled()
  })

  it('shows the empty state when there are no notifications', async () => {
    useNotificationsMock.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      markRead: markReadMock,
      markAllRead: markAllReadMock,
      refresh: refreshMock,
    })
    const user = userEvent.setup()
    renderBell()
    await user.click(screen.getByRole('button', { name: 'Notifications' }))
    expect(screen.getByText('No notifications yet')).toBeInTheDocument()
  })

  it('closes the panel when the bell is clicked again', async () => {
    const user = userEvent.setup()
    renderBell()
    const bell = screen.getByRole('button', { name: 'Notifications' })
    await user.click(bell)
    expect(screen.getByText('Application updated')).toBeInTheDocument()
    await user.click(bell)
    await waitFor(() => {
      expect(screen.queryByText('Application updated')).not.toBeInTheDocument()
    })
  })

  it('closes the panel when Escape is pressed', async () => {
    const user = userEvent.setup()
    renderBell()
    await user.click(screen.getByRole('button', { name: 'Notifications' }))
    expect(screen.getByText('Application updated')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => {
      expect(screen.queryByText('Application updated')).not.toBeInTheDocument()
    })
  })

  it('closes the panel when clicking outside', async () => {
    const user = userEvent.setup()
    renderBell()
    await user.click(screen.getByRole('button', { name: 'Notifications' }))
    expect(screen.getByText('Application updated')).toBeInTheDocument()
    await user.click(document.body)
    await waitFor(() => {
      expect(screen.queryByText('Application updated')).not.toBeInTheDocument()
    })
  })

  it('renders nothing when there is no user', () => {
    useAppMock.mockReturnValue({ user: null })
    renderBell()
    expect(screen.queryByRole('button', { name: 'Notifications' })).not.toBeInTheDocument()
  })
})
