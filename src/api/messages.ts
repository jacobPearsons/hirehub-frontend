import { apiGet, apiPost } from './client'
import type { Conversation, ChatMessage } from '../types/message'

export async function listConversations() {
  return apiGet<Conversation[]>('/conversations')
}

export async function openSupportConversation() {
  return apiPost<Conversation>('/conversations/support')
}

export async function getMessages(conversationId: string) {
  return apiGet<ChatMessage[]>(`/conversations/${conversationId}/messages`)
}

export async function sendMessage(conversationId: string, content: string) {
  return apiPost<ChatMessage>('/messages', { conversationId, content })
}

export async function openInterviewConversation(applicationId: string) {
  return apiPost<{ conversation: { id: string } }>(`/applications/${applicationId}/interview-conversation`, {})
}
