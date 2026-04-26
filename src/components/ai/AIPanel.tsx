'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAIStream } from '@/lib/hooks/useAIStream'
import type { ChatMessage } from '@/lib/ai'
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer'

const MAX_CONTEXT_MESSAGES = 8

interface AIPanelProps {
  open: boolean
  onClose: () => void
  title: string
  systemPrompt?: string
  initialMessage?: string
  initialMessageKey?: string | number
}

export function AIPanel({
  open,
  onClose,
  title,
  systemPrompt,
  initialMessage,
  initialMessageKey,
}: AIPanelProps) {
  const { streamChat } = useAIStream()
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const lastInitialKey = useRef<string | number | null>(null)

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

  const startInitial = useCallback(
    async (message: string) => {
      if (loading) return

      const nextMessages: { role: 'user' | 'assistant'; content: string }[] = [
        ...messages,
        { role: 'user', content: message },
      ]
      setMessages(nextMessages)
      setLoading(true)

      const chatMessages: ChatMessage[] = []
      if (systemPrompt) chatMessages.push({ role: 'system', content: systemPrompt })
      chatMessages.push({ role: 'user', content: message })

      try {
        let fullText = ''
        await streamChat(chatMessages, (chunk) => {
          fullText += chunk
          setMessages([...nextMessages, { role: 'assistant', content: fullText }])
        })
      } catch (err) {
        setMessages([
          ...nextMessages,
          {
            role: 'assistant',
            content: `错误: ${err instanceof Error ? err.message : '请求失败'}`,
          },
        ])
      } finally {
        setLoading(false)
      }
    },
    [loading, messages, systemPrompt, streamChat]
  )

  useEffect(() => {
    if (!open || !initialMessage) return

    const nextInitialKey = initialMessageKey ?? initialMessage
    if (lastInitialKey.current === nextInitialKey) return

    lastInitialKey.current = nextInitialKey
    startInitial(initialMessage)
  }, [open, initialMessage, initialMessageKey, startInitial])

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
    for (const msg of newMessages.slice(-MAX_CONTEXT_MESSAGES)) {
      chatMessages.push({ role: msg.role, content: msg.content })
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
        <div className="flex shrink-0 items-center justify-between border-b border-sky-200/80 bg-white/40 px-4 py-3 dark:border-sky-900/60 dark:bg-sky-950/20">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-700/70 dark:text-cyan-200/70">
              AI Tutor
            </div>
            <h3 className="mt-0.5 font-semibold text-sky-950 dark:text-sky-100">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="rounded-full p-1.5 text-sky-500 hover:bg-sky-100 hover:text-sky-700 dark:text-sky-300 dark:hover:bg-sky-900/40"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div
          ref={contentRef}
          className="flex-1 space-y-4 overflow-auto p-4 [scrollbar-color:rgba(14,165,233,0.35)_transparent]"
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
                    ? 'bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-sm shadow-sky-500/20'
                    : 'border border-sky-100 bg-white/85 text-slate-800 shadow-sm dark:border-sky-900/50 dark:bg-slate-900/70 dark:text-sky-100'
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
              <div className="rounded-lg border border-sky-100 bg-white/85 px-3 py-2 text-sm dark:border-sky-900/50 dark:bg-slate-900/70">
                <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-sky-500" />
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-sky-200/80 bg-white/45 p-3 dark:border-sky-900/60 dark:bg-sky-950/20">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入问题或者鼠标选中页面内容提问"
              disabled={loading}
              className="flex-1 rounded-lg border border-sky-200 bg-white/90 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-sky-400 focus:outline-none disabled:opacity-50 dark:border-sky-900/70 dark:bg-slate-900/80 dark:text-sky-100"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="sky-button-primary rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
