'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSettings } from '@/lib/store/settings'
import { createProvider, parseSSEChunk } from '@/lib/ai'
import { buildTranslatePrompt } from '@/lib/prompts/translate'
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer'
import { AIPanel } from '@/components/ai/AIPanel'

interface ToolbarState {
  text: string
  x: number
  y: number
  align: 'top' | 'bottom'
  onQuestion?: (text: string) => void
}

interface SelectionScope {
  element: HTMLElement
  onQuestion?: (text: string) => void
}

interface SelectionToolbarProps {
  onQuestion?: (text: string) => void
}

const selectionScopes = new Map<string, SelectionScope>()
let scopeIdCounter = 0

export function SelectionToolbar({ onQuestion }: SelectionToolbarProps) {
  const markerRef = useRef<HTMLSpanElement>(null)
  const scopeIdRef = useRef<string | null>(null)

  useEffect(() => {
    const element = markerRef.current?.parentElement
    if (!element) return

    if (!scopeIdRef.current) {
      scopeIdCounter += 1
      scopeIdRef.current = `selection-scope-${scopeIdCounter}`
    }

    const scopeId = scopeIdRef.current
    selectionScopes.set(scopeId, { element, onQuestion })

    return () => {
      selectionScopes.delete(scopeId)
    }
  }, [onQuestion])

  return <span ref={markerRef} className="hidden" aria-hidden="true" />
}

function findSelectionScope(selection: Selection): SelectionScope | null {
  if (!selection.anchorNode || !selection.focusNode) return null

  let matchedScope: SelectionScope | null = null

  for (const scope of selectionScopes.values()) {
    const containsSelection =
      scope.element.contains(selection.anchorNode) &&
      scope.element.contains(selection.focusNode)

    if (!containsSelection) continue

    if (!matchedScope || matchedScope.element.contains(scope.element)) {
      matchedScope = scope
    }
  }

  return matchedScope
}

export function GlobalSelectionToolbar() {
  const { settings } = useSettings()
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null)
  const [toolbar, setToolbar] = useState<ToolbarState | null>(null)
  const [showQuestion, setShowQuestion] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [showTranslate, setShowTranslate] = useState(false)
  const [translateResult, setTranslateResult] = useState('')
  const [translating, setTranslating] = useState(false)

  useEffect(() => {
    let checkTimer: ReturnType<typeof setTimeout> | null = null

    const clearCheckTimer = () => {
      if (!checkTimer) return
      clearTimeout(checkTimer)
      checkTimer = null
    }

    const getFormSelection = () => {
      const activeElement = document.activeElement
      if (
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLInputElement
      ) {
        const start = activeElement.selectionStart
        const end = activeElement.selectionEnd
        if (start === null || end === null || start === end) return null

        const text = activeElement.value.slice(start, end).trim()
        if (!text) return null

        const scope =
          Array.from(selectionScopes.values()).find((item) =>
            item.element.contains(activeElement)
          ) ?? null

        return { text, scope }
      }

      return null
    }

    const checkSelection = () => {
      const formSelection = getFormSelection()
      if (formSelection) {
        const point = lastPointerRef.current ?? {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        }
        const align = point.y > 72 ? 'top' : 'bottom'
        setToolbar({
          text: formSelection.text,
          x: Math.min(Math.max(point.x, 120), window.innerWidth - 120),
          y: point.y,
          align,
          onQuestion: formSelection.scope?.onQuestion,
        })
        return
      }

      const selection = window.getSelection()
      if (
        !selection ||
        selection.isCollapsed ||
        !selection.toString().trim() ||
        selection.rangeCount === 0
      ) {
        setToolbar(null)
        return
      }

      const scope = findSelectionScope(selection)
      const text = selection.toString().trim()
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      if (!text || (rect.width === 0 && rect.height === 0)) {
        setToolbar(null)
        return
      }

      const point = lastPointerRef.current ?? {
        x: rect.left + rect.width / 2,
        y: rect.bottom,
      }
      const align = point.y > 72 ? 'top' : 'bottom'
      setToolbar({
        text,
        x: Math.min(Math.max(point.x, 120), window.innerWidth - 120),
        y: point.y,
        align,
        onQuestion: scope?.onQuestion,
      })
    }

    const scheduleSelectionCheck = () => {
      clearCheckTimer()
      checkTimer = setTimeout(checkSelection, 30)
    }

    const schedulePointerSelectionCheck = (event: MouseEvent | PointerEvent) => {
      if (event) {
        lastPointerRef.current = { x: event.clientX, y: event.clientY }
      }
      scheduleSelectionCheck()
    }

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('[data-selection-toolbar]')) return
      clearCheckTimer()
      setToolbar(null)
      setShowTranslate(false)
      setTranslateResult('')
    }

    document.addEventListener('mouseup', schedulePointerSelectionCheck)
    document.addEventListener('pointerup', schedulePointerSelectionCheck)
    document.addEventListener('keyup', scheduleSelectionCheck)
    document.addEventListener('selectionchange', scheduleSelectionCheck)
    document.addEventListener('mousedown', handleMouseDown)
    return () => {
      clearCheckTimer()
      document.removeEventListener('mouseup', schedulePointerSelectionCheck)
      document.removeEventListener('pointerup', schedulePointerSelectionCheck)
      document.removeEventListener('keyup', scheduleSelectionCheck)
      document.removeEventListener('selectionchange', scheduleSelectionCheck)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges()
    const activeElement = document.activeElement
    if (
      activeElement instanceof HTMLTextAreaElement ||
      activeElement instanceof HTMLInputElement
    ) {
      activeElement.blur()
    }
    setToolbar(null)
  }, [])

  const handleTranslate = useCallback(async () => {
    if (!toolbar || !settings.provider || !settings.apiKey) return
    const text = toolbar.text
    clearSelection()

    setTranslating(true)
    setShowTranslate(true)
    setTranslateResult('')

    try {
      const provider = createProvider(settings.provider)
      const stream = await provider.chatCompletion({
        model: settings.model,
        messages: [
          {
            role: 'user',
            content: buildTranslatePrompt(text),
          },
        ],
        apiKey: settings.apiKey,
        stream: true,
        temperature: 0.3,
      })

      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const content = parseSSEChunk(chunk)
        if (content) {
          fullText += content
          setTranslateResult(fullText)
        }
      }
    } catch (err) {
      setTranslateResult(`翻译失败: ${err instanceof Error ? err.message : '未知错误'}`)
    } finally {
      setTranslating(false)
    }
  }, [toolbar, settings, clearSelection])

  const handleReadAloud = useCallback(() => {
    if (!toolbar) return
    const text = toolbar.text
    clearSelection()
    if ('speechSynthesis' in window) {
      const isChinese = /[\u4e00-\u9fff]/.test(text)
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = isChinese ? 'zh-CN' : 'en-US'
      utterance.rate = 0.9
      speechSynthesis.cancel()
      speechSynthesis.speak(utterance)
    }
  }, [toolbar, clearSelection])

  const handleQuestion = useCallback(() => {
    if (!toolbar) return
    if (toolbar.onQuestion) {
      toolbar.onQuestion(toolbar.text)
    } else {
      setSelectedText(toolbar.text)
      setShowQuestion(true)
    }
    clearSelection()
  }, [toolbar, clearSelection])

  const questionPrompt = `学生在网页中选中了以下内容，请用中文解释它的意思、用法和相关背景。如果是英文，请说明重点词汇、短语或语法点；如果是中文，请结合英语学习场景解释。

选中文本：
"${selectedText}"

请控制在200字以内。`

  return (
    <>
      {toolbar && (
        <div
          data-selection-toolbar
          className="fixed z-50 -translate-x-1/2"
          style={{
            left: toolbar.x,
            top: toolbar.align === 'top' ? toolbar.y - 44 : toolbar.y + 12,
          }}
        >
          <div className="flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <button
              onClick={handleQuestion}
              className="rounded px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-zinc-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
            >
              提问
            </button>
            <button
              onClick={handleTranslate}
              disabled={translating}
              className="rounded px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-green-50 hover:text-green-600 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-green-900/20 dark:hover:text-green-400"
            >
              {translating ? '翻译中...' : '翻译'}
            </button>
            <button
              onClick={handleReadAloud}
              className="rounded px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-purple-50 hover:text-purple-600 dark:text-zinc-400 dark:hover:bg-purple-900/20 dark:hover:text-purple-400"
            >
              朗读
            </button>
          </div>
        </div>
      )}

      <AIPanel
        open={showQuestion}
        onClose={() => setShowQuestion(false)}
        title="AI 解答"
        initialMessage={questionPrompt}
      />

      {showTranslate && (translateResult || translating) && (
        <div
          data-selection-toolbar
          className="fixed right-4 top-20 z-50 max-h-[60vh] w-80 overflow-auto rounded-lg border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-800"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">翻译结果</span>
            <button
              onClick={() => {
                setShowTranslate(false)
                setTranslateResult('')
                clearSelection()
              }}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              关闭
            </button>
          </div>
          <div className="rounded bg-zinc-50 p-3 text-sm leading-relaxed text-zinc-800 dark:bg-zinc-700/50 dark:text-zinc-200">
            {translateResult ? (
              <MarkdownRenderer content={translateResult} />
            ) : (
              translating && <span className="animate-pulse">▊</span>
            )}
          </div>
        </div>
      )}
    </>
  )
}
