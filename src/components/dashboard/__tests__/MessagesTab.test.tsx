import { render, screen, waitFor, act, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { MessagesTab } from '../MessagesTab'
import { listConversations, getMessages } from '../../../api/messages'

const { subscribeMock, unsubscribeMock } = vi.hoisted(() => ({
  subscribeMock: vi.fn(),
  unsubscribeMock: vi.fn(),
}))

const adminConversation = {
  id: 'c1',
  employerId: 'u-admin',
  candidateId: 'u-seeker',
  job: { id: 'j1', title: 'Frontend Engineer' },
  employer: { id: 'u-admin', name: 'HireHub Admin', role: 'ADMIN' },
  candidate: { id: 'u-seeker', name: 'Alex Seeker' },
  messages: [
    {
      id: 'm1',
      conversationId: 'c1',
      senderId: 'u-admin',
      sender: { id: 'u-admin', name: 'HireHub Admin', role: 'ADMIN' },
      content: 'Welcome to HireHub! Let us know if you need anything.',
      createdAt: '2026-07-01T10:00:00.000Z',
    },
  ],
  updatedAt: '2026-07-01T10:00:00.000Z',
}

vi.mock('../../../context/AppContext', () => ({
  useApp: () => ({ user: { id: 'u-seeker', name: 'Alex Seeker', role: 'seeker' } }),
}))

vi.mock('../../../context/NotificationsContext', () => ({
  useNotifications: () => ({ subscribe: subscribeMock, unsubscribe: unsubscribeMock }),
}))

vi.mock('../../../api/messages', () => ({
  listConversations: vi.fn(),
  getMessages: vi.fn(),
  sendMessage: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(listConversations).mockResolvedValue({ success: true, data: [adminConversation] })
  vi.mocked(getMessages).mockResolvedValue({ success: true, data: adminConversation.messages })
})

describe('MessagesTab', () => {
  it('renders conversations and opens a thread on click', async () => {
    render(
      <MemoryRouter>
        <MessagesTab />
      </MemoryRouter>
    )
    expect(await screen.findByText('HireHub Team')).toBeInTheDocument()
    await userEvent.setup().click(screen.getByText('HireHub Team'))
    const thread = await screen.findByTestId('thread-messages')
    expect(within(thread).getByText(/welcome to hirehub/i)).toBeInTheDocument()
  })

  it('auto-opens the conversation selected via ?conv= param', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard?tab=messages&conv=c1']}>
        <MessagesTab />
      </MemoryRouter>
    )
    const thread = await screen.findByTestId('thread-messages')
    expect(await within(thread).findByText(/welcome to hirehub/i)).toBeInTheDocument()
  })

  it('refreshes the active thread when a new-message SSE event arrives for it', async () => {
    let handler: ((e: MessageEvent) => void) | null = null
    subscribeMock.mockImplementation((_name: string, cb: (e: MessageEvent) => void) => {
      handler = cb
    })

    const newMessage = {
      id: 'm2',
      conversationId: 'c1',
      senderId: 'u-seeker',
      sender: { id: 'u-seeker', name: 'Alex Seeker' },
      content: 'Thanks for the welcome!',
      createdAt: '2026-07-01T11:00:00.000Z',
    }
    let getMessagesCalls = 0
    vi.mocked(getMessages).mockImplementation(() => {
      getMessagesCalls += 1
      return Promise.resolve({
        success: true,
        data: getMessagesCalls === 1 ? adminConversation.messages : [...adminConversation.messages, newMessage],
      })
    })

    render(
      <MemoryRouter initialEntries={['/dashboard?tab=messages&conv=c1']}>
        <MessagesTab />
      </MemoryRouter>
    )
    const thread = await screen.findByTestId('thread-messages')
    expect(await within(thread).findByText(/welcome to hirehub/i)).toBeInTheDocument()

    act(() => {
      handler?.({ data: JSON.stringify(newMessage) } as MessageEvent)
    })

    await waitFor(() => {
      expect(within(screen.getByTestId('thread-messages')).getByText('Thanks for the welcome!')).toBeInTheDocument()
    })
    expect(getMessagesCalls).toBeGreaterThan(1)
  })

  it('ignores new-message events for other conversations and unsubscribes on unmount', async () => {
    let handler: ((e: MessageEvent) => void) | null = null
    subscribeMock.mockImplementation((_name: string, cb: (e: MessageEvent) => void) => {
      handler = cb
    })

    render(
      <MemoryRouter initialEntries={['/dashboard?tab=messages&conv=c1']}>
        <MessagesTab />
      </MemoryRouter>
    )
    const thread = await screen.findByTestId('thread-messages')
    expect(await within(thread).findByText(/welcome to hirehub/i)).toBeInTheDocument()

    act(() => {
      handler?.({
        data: JSON.stringify({
          id: 'm-other',
          conversationId: 'c2',
          senderId: 'u-seeker',
          sender: { id: 'u-seeker', name: 'Alex Seeker' },
          content: 'Message for another chat',
          createdAt: '2026-07-01T11:00:00.000Z',
        }),
      } as MessageEvent)
    })

    expect(within(thread).queryByText('Message for another chat')).not.toBeInTheDocument()

    const { unmount } = render(
      <MemoryRouter>
        <MessagesTab />
      </MemoryRouter>
    )
    unmount()
    expect(unsubscribeMock).toHaveBeenCalledWith('new-message', expect.any(Function))
  })
})
