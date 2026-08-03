import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessagesTab } from '../MessagesTab'
import { listConversations, getMessages } from '../../../api/messages'

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

vi.mock('../../../api/messages', () => ({
  listConversations: vi.fn(),
  getMessages: vi.fn(),
  sendMessage: vi.fn(),
}))

beforeEach(() => {
  vi.mocked(listConversations).mockResolvedValue({ success: true, data: [adminConversation] })
  vi.mocked(getMessages).mockResolvedValue({ success: true, data: adminConversation.messages })
})

describe('MessagesTab', () => {
  it('renders conversations and opens a thread on click', async () => {
    render(<MessagesTab />)
    expect(await screen.findByText('HireHub Team')).toBeInTheDocument()
    await userEvent.setup().click(screen.getByText('HireHub Team'))
    const thread = await screen.findByTestId('thread-messages')
    expect(within(thread).getByText(/welcome to hirehub/i)).toBeInTheDocument()
  })
})
