'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAIStream } from '@/lib/hooks/useAIStream'
import type { ChatMessage } from '@/lib/ai'
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer'

interface AIPanelProps {
  open: boolean
  onClose: () => void
  title: string
  systemPrompt?: string
  initialMessage?: string
}

export function AIPanel({
  open,
  onClose,
  title,
  systemPrompt,
  initialMessage,
}: AIPanelProps) {
  const { streamChat } = useAIStream()
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const initialCalled = useRef(false)

  useEffect(() => {
    if (!open) return

    const body = document.body
    const nextCount = Number(body.dataset.aiPanelOpenCount ?? '0') + 1
    body.dataset.aiPanelOpenCount = String(nextCount)
    body.classList.add('ai-panel-open')

    return () => {
      const currentCount = Math.max(
        Number(body.dataset.aiPanelOpenCount ?? '1') - 1,
        0
      )
      if (currentCount === 0) {
        body.classList.remove('ai-panel-open')
        delete body.dataset.aiPanelOpenCount
      } else {
        body.dataset.aiPanelOpenCount = String(currentCount)
      }
    }
  }, [open])

  const startInitial = useCallback(async () => {
    if (!initialMessage || initialCalled.current) return
    initialCalled.current = true

    const msg: ChatMessage[] = []
    if (systemPrompt) msg.push({ role: 'system', content: systemPrompt })
    msg.push({ role: 'user', content: initialMessage })

    setMessages([{ role: 'user', content: initialMessage }])
    setLoading(true)

    try {
      let fullText = ''
      await streamChat(msg, (chunk) => {
        fullText += chunk
        setMessages([
          { role: 'user', content: initialMessage },
          { role: 'assistant', content: fullText },
        ])
      })
    } catch (err) {
      setMessages([
        { role: 'user', content: initialMessage },
        {
          role: 'assistant',
          content: `错误: ${err instanceof Error ? err.message : '请求失败'}`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [initialMessage, systemPrompt, streamChat])

  useEffect(() => {
    if (open && initialMessage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages(() => [])
      initialCalled.current = false
      startInitial()
    }
  }, [open, initialMessage, startInitial])

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    const newMessages: { role: 'user' | 'assistant'; content: string }[] = [
      ...messages,
      { role: 'user', content: text },
    ]
    setMessages(newMessages)
    setLoading(true)

    const chatMessages: ChatMessage[] = []
    if (systemPrompt) chatMessages.push({ role: 'system', content: systemPrompt })
    for (const msg of newMessages) {
      chatMessages.push({ role: msg.role as 'user' | 'assistant', content: msg.content })
    }

    try {
      let fullText = ''
      await streamChat(chatMessages, (chunk) => {
        fullText += chunk
        setMessages([...newMessages, { role: 'assistant', content: fullText }])
      })
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: `错误: ${err instanceof Error ? err.message : '请求失败'}`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <div className="ai-panel pointer-events-auto">
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div
          ref={contentRef}
          className="flex-1 space-y-4 overflow-auto p-4"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'
                }`}
              >
                <MarkdownRenderer
                  content={msg.content}
                  className={msg.role === 'user' ? 'markdown-inverted' : ''}
                />
              </div>
            </div>
          ))}
          {loading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800">
                <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-blue-500" />
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-zinc-200 p-3 dark:border-zinc-700">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入追问..."
              disabled={loading}
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
