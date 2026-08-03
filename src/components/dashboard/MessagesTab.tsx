import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, MessageSquare } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { listConversations, getMessages, sendMessage } from '../../api/messages'
import { SkeletonGrid } from '../ui/SkeletonGrid'
import { ErrorState } from '../ui/ErrorState'
import type { Conversation, ChatMessage } from '../../types/message'

const isEmployerSide = (c: Conversation, userId?: string) => c.employerId === userId

function senderLabel(sender: ChatMessage['sender']) {
  return sender.role === 'ADMIN' ? 'HireHub Team' : sender.name
}

function displayName(c: Conversation, userId?: string) {
  const other = isEmployerSide(c, userId) ? c.candidate : c.employer
  return senderLabel(other)
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function MessagesTab() {
  const { user } = useApp()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [threadLoading, setThreadLoading] = useState(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const tempIdRef = useRef(0)

  function loadConversations() {
    setLoading(true)
    setError(null)
    listConversations()
      .then((res) => setConversations(res.data))
      .catch(() => setError('Failed to load conversations.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let cancelled = false
    listConversations()
      .then((res) => { if (!cancelled) setConversations(res.data) })
      .catch(() => { if (!cancelled) setError('Failed to load conversations.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!activeId) return
    let cancelled = false
    getMessages(activeId)
      .then((res) => { if (!cancelled) { setMessages(res.data); setThreadLoading(false) } })
      .catch(() => { if (!cancelled) setThreadLoading(false) })
    return () => { cancelled = true }
  }, [activeId])

  const active = conversations.find((c) => c.id === activeId) ?? null

  function openConversation(id: string) {
    setActiveId(id)
    setMessages([])
    setThreadLoading(true)
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const content = draft.trim()
    if (!content || !active || !user || sending) return

    const temp: ChatMessage = {
      id: `temp-${tempIdRef.current++}`,
      conversationId: active.id,
      senderId: user.id,
      sender: { id: user.id, name: user.name },
      content,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, temp])
    setDraft('')
    setSending(true)
    sendMessage(active.id, content)
      .then((res) => {
        setMessages((prev) => prev.map((m) => (m.id === temp.id ? res.data : m)))
        setConversations((prev) =>
          prev.map((c) => (c.id === active.id ? { ...c, updatedAt: res.data.createdAt } : c)),
        )
      })
      .catch(() => {
        setMessages((prev) => prev.filter((m) => m.id !== temp.id))
      })
      .finally(() => setSending(false))
  }

  if (loading) {
    return <SkeletonGrid count={3} columns={2} />
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadConversations} />
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 border border-hairline rounded-lg bg-surface-1 overflow-hidden">
        <div className="px-4 py-3 border-b border-hairline">
          <h2 className="text-sm font-semibold text-ink">Conversations</h2>
        </div>
        <div className="max-h-[70vh] lg:max-h-[60vh] overflow-y-auto">
          {conversations.length === 0 && (
            <p className="text-sm text-ink-muted px-4 py-8 text-center">No conversations yet.</p>
          )}
          {conversations.map((c) => {
            const name = displayName(c, user?.id)
            const last = c.messages[c.messages.length - 1]
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => openConversation(c.id)}
                className={`w-full text-left px-4 py-3 border-b border-hairline last:border-b-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
                  activeId === c.id ? 'bg-accent/10' : 'hover:bg-surface-2'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink truncate">{name}</span>
                  <span className="text-xs text-ink-tertiary shrink-0">{formatTime(c.updatedAt)}</span>
                </div>
                {c.job && <p className="text-xs text-ink-muted mt-0.5 truncate">{c.job.title}</p>}
                <p className="text-sm text-ink-muted mt-0.5 truncate">{last?.content ?? 'No messages yet'}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="lg:col-span-2 border border-hairline rounded-lg bg-surface-1 flex flex-col overflow-hidden">
        {active ? (
          <>
            <div className="px-4 py-3 border-b border-hairline">
              <h2 className="text-sm font-semibold text-ink">{displayName(active, user?.id)}</h2>
              {active.job && <p className="text-xs text-ink-muted mt-0.5">{active.job.title}</p>}
            </div>
            <div data-testid="thread-messages" className="flex-1 px-4 py-4 space-y-3 max-h-[50vh] lg:max-h-[44vh] overflow-y-auto">
              {threadLoading && <p className="text-sm text-ink-muted">Loading messages…</p>}
              {!threadLoading && messages.length === 0 && (
                <p className="text-sm text-ink-muted text-center py-8">No messages yet. Say hello!</p>
              )}
              {messages.map((m) => {
                const mine = m.senderId === user?.id
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${mine ? 'ml-auto bg-ink text-surface-1' : 'bg-surface-2 text-ink'}`}
                  >
                    <p className="text-xs opacity-70 mb-0.5">{mine ? 'You' : senderLabel(m.sender)}</p>
                    <p>{m.content}</p>
                  </motion.div>
                )
              })}
            </div>
            <form onSubmit={handleSend} className="px-4 py-3 border-t border-hairline flex gap-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a message…"
                className="flex-1 px-3 py-2 rounded-md border border-hairline bg-surface-1 text-sm text-ink placeholder:text-ink-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
              />
              <button
                type="submit"
                disabled={!draft.trim() || sending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-ink text-surface-1 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <MessageSquare className="w-12 h-12 mb-4 text-ink-tertiary" />
            <h3 className="text-lg font-medium text-ink mb-1">Select a conversation</h3>
            <p className="text-sm text-ink-muted max-w-sm">Pick a conversation from the list to view the thread.</p>
          </div>
        )}
      </div>
    </div>
  )
}
