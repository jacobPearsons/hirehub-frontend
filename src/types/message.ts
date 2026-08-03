export interface ChatSender {
  id: string
  name: string
  avatarUrl?: string | null
  role?: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  sender: ChatSender
  content: string
  createdAt: string
}

export interface Conversation {
  id: string
  employerId: string
  candidateId: string
  job?: { id: string; title: string } | null
  employer: ChatSender
  candidate: ChatSender
  messages: ChatMessage[]
  updatedAt: string
}
