'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AIPanel } from '@/components/ai/AIPanel'

interface AskAIOptions {
  title?: string
  systemPrompt?: string
}

interface GlobalAIPanelContextValue {
  open: () => void
  close: () => void
  ask: (message: string, options?: AskAIOptions) => void
}

const GlobalAIPanelContext = createContext<GlobalAIPanelContextValue | null>(null)

export function GlobalAIPanelProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('AI 问答')
  const [systemPrompt, setSystemPrompt] = useState<string | undefined>()
  const [initialMessage, setInitialMessage] = useState('')
  const [initialMessageKey, setInitialMessageKey] = useState(0)


  const ask = useCallback((message: string, options?: AskAIOptions) => {
    setTitle(options?.title ?? 'AI 问答')
    setSystemPrompt(options?.systemPrompt)
    setInitialMessage(message)
    setInitialMessageKey((key) => key + 1)
    setOpen(true)
  }, [])

  const value = useMemo<GlobalAIPanelContextValue>(
    () => ({
      open: () => setOpen(true),
      close: () => setOpen(false),
      ask,
    }),
    [ask]
  )

  return (
    <GlobalAIPanelContext.Provider value={value}>
      {children}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="打开 AI 问答"
          className="fixed right-4 top-1/2 z-40 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-sky-200 bg-gradient-to-br from-sky-500 via-blue-500 to-cyan-400 text-sm font-bold text-white shadow-xl shadow-sky-500/25 ring-4 ring-white/55 transition-colors hover:from-sky-600 hover:via-blue-600 hover:to-cyan-500 dark:border-sky-800 dark:ring-sky-950/50"
        >
          AI
        </button>
      )}
      <AIPanel
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        systemPrompt={systemPrompt}
        initialMessage={initialMessage}
        initialMessageKey={initialMessageKey}
      />
    </GlobalAIPanelContext.Provider>
  )
}

export function useGlobalAIPanel() {
  const context = useContext(GlobalAIPanelContext)
  if (!context) {
    throw new Error('useGlobalAIPanel must be used within GlobalAIPanelProvider')
  }
  return context
}
