'use client'

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useSettings } from '@/lib/store/settings'
import { createProvider, parseSSEChunk } from '@/lib/ai'
import { buildTranslatePrompt } from '@/lib/prompts/translate'
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer'
import { useGlobalAIPanel } from '@/components/ai/GlobalAIPanel'

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
  const { ask } = useGlobalAIPanel()
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null)
  const translateBoxRef = useRef<HTMLDivElement>(null)
  const translateDragOffsetRef = useRef({ x: 0, y: 0 })
  const [toolbar, setToolbar] = useState<ToolbarState | null>(null)
  const [showTranslate, setShowTranslate] = useState(false)
  const [translateSourceText, setTranslateSourceText] = useState('')
  const [translateResult, setTranslateResult] = useState('')
  const [translatePosition, setTranslatePosition] = useState<{ x: number; y: number } | null>(null)
  const [draggingTranslate, setDraggingTranslate] = useState(false)
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
        if (activeElement.closest('[data-selection-toolbar]')) return null
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

      const anchorElement = selection.anchorNode instanceof Element
        ? selection.anchorNode
        : selection.anchorNode?.parentElement
      const focusElement = selection.focusNode instanceof Element
        ? selection.focusNode
        : selection.focusNode?.parentElement

      if (
        anchorElement?.closest('[data-selection-toolbar]') ||
        focusElement?.closest('[data-selection-toolbar]')
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
      setTranslateSourceText('')
      setTranslateResult('')
      setTranslatePosition(null)
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
    const margin = 12
    const boxWidth = Math.min(360, window.innerWidth - margin * 2)
    const boxHeightEstimate = 280
    const x = Math.min(
      Math.max(toolbar.x - boxWidth / 2, margin),
      window.innerWidth - boxWidth - margin
    )
    const maxY = Math.max(margin, window.innerHeight - boxHeightEstimate - margin)
    const y =
      toolbar.y > maxY
        ? Math.max(margin, toolbar.y - boxHeightEstimate)
        : Math.min(toolbar.y + 14, maxY)
    setTranslateSourceText(text)
    setTranslatePosition({ x, y })
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

  const speakText = useCallback((text: string) => {
    const spokenText = text
      .replace(/<[^>]+>/g, ' ')
      .replace(/[#*_>\[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (!spokenText || !('speechSynthesis' in window)) return
    const isChinese = /[\u4e00-\u9fff]/.test(spokenText)
    const utterance = new SpeechSynthesisUtterance(spokenText)
    utterance.lang = isChinese ? 'zh-CN' : 'en-US'
    utterance.rate = 0.9
    speechSynthesis.cancel()
    speechSynthesis.speak(utterance)
  }, [])

  const getPrimaryTranslationText = useCallback((text: string) => {
    const cleanLine = (line: string) => line
      .replace(/<[^>]+>/g, ' ')
      .replace(/^[\s\d.、-]+/, '')
      .replace(/\*\*/g, '')
      .replace(/[#*_>\[\]()]/g, '')
      .trim()

    const lines = text.split(/\r?\n/).map(cleanLine).filter(Boolean)
    const labelPattern = /^(?:翻译结果|译文|翻译)\s*[:：]?\s*/
    const stopPattern = /^(?:关键表达|重点表达|词汇|短语|解析|说明)\s*[:：]?/

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index]
      if (!labelPattern.test(line)) continue

      const inlineValue = line.replace(labelPattern, '').trim()
      if (inlineValue) return inlineValue

      const nextLine = lines[index + 1]
      if (nextLine && !stopPattern.test(nextLine)) return nextLine
    }

    return lines.find((line) => !stopPattern.test(line)) ?? ''
  }, [])


  const getTranslationDetailText = useCallback((text: string) => {
    const lines = text.split(/\r?\n/)
    const labelPattern = /^(?:\s*[-\d.、]*\s*)?(?:\*\*)?(?:翻译结果|译文|翻译)(?:\*\*)?\s*[:：]?\s*/
    const stopPattern = /(?:关键表达|重点表达|词汇|短语|解析|说明)/
    const output: string[] = []
    let skippingTranslation = false
    let skippedValueLine = false

    for (const line of lines) {
      const cleanLine = line.replace(/[#*_>\[\]()]/g, '').trim()
      if (labelPattern.test(cleanLine)) {
        const inlineValue = cleanLine.replace(labelPattern, '').trim()
        skippingTranslation = !inlineValue
        skippedValueLine = false
        continue
      }

      if (skippingTranslation) {
        if (!skippedValueLine && cleanLine && !stopPattern.test(cleanLine)) {
          skippedValueLine = true
          continue
        }
        skippingTranslation = false
      }

      output.push(line)
    }

    return output.join('\n').trim()
  }, [])

  const handleReadAloud = useCallback(() => {
    if (!toolbar) return
    speakText(toolbar.text)
    clearSelection()
  }, [toolbar, speakText, clearSelection])

  const handleQuestion = useCallback(() => {
    if (!toolbar) return
    if (toolbar.onQuestion) {
      toolbar.onQuestion(toolbar.text)
    } else {
      const questionPrompt = `学生在网页中选中了以下内容，请用中文解释它的意思、用法和相关背景。如果是英文，请说明重点词汇、短语或语法点；如果是中文，请结合英语学习场景解释。

选中文本：
"${toolbar.text}"

请控制在200字以内。`
      ask(questionPrompt, { title: 'AI 解答' })
    }
    clearSelection()
  }, [toolbar, ask, clearSelection])


  const clampTranslatePosition = useCallback((x: number, y: number) => {
    const margin = 12
    const width = translateBoxRef.current?.offsetWidth ?? Math.min(360, window.innerWidth - margin * 2)
    const height = translateBoxRef.current?.offsetHeight ?? 280
    return {
      x: Math.min(Math.max(x, margin), Math.max(margin, window.innerWidth - width - margin)),
      y: Math.min(Math.max(y, margin), Math.max(margin, window.innerHeight - height - margin)),
    }
  }, [])

  const handleTranslateDragStart = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) return
    const rect = translateBoxRef.current?.getBoundingClientRect()
    if (!rect) return
    translateDragOffsetRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
    setDraggingTranslate(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }, [])

  const handleTranslateDragMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingTranslate) return
    const next = clampTranslatePosition(
      event.clientX - translateDragOffsetRef.current.x,
      event.clientY - translateDragOffsetRef.current.y
    )
    setTranslatePosition(next)
  }, [draggingTranslate, clampTranslatePosition])

  const handleTranslateDragEnd = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingTranslate) return
    setDraggingTranslate(false)
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // Pointer capture may already be released by the browser.
    }
  }, [draggingTranslate])


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
          <div className="sky-floating flex items-center gap-1 p-1.5">
            <button
              onClick={handleQuestion}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-50 dark:text-sky-200 dark:hover:bg-sky-900/30"
            >
              提问
            </button>
            <button
              onClick={handleTranslate}
              disabled={translating}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-cyan-700 transition-colors hover:bg-cyan-50 disabled:opacity-50 dark:text-cyan-200 dark:hover:bg-cyan-900/30"
            >
              {translating ? '翻译中...' : '翻译'}
            </button>
            <button
              onClick={handleReadAloud}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50 dark:text-blue-200 dark:hover:bg-blue-900/30"
            >
              朗读
            </button>
          </div>
        </div>
      )}


      {showTranslate && (translateResult || translating) && (
        <div
          ref={translateBoxRef}
          data-selection-toolbar
          className="sky-floating fixed z-50 max-h-[70vh] w-[22.5rem] max-w-[calc(100vw-1.5rem)] overflow-hidden"
          style={
            translatePosition
              ? { left: translatePosition.x, top: translatePosition.y }
              : { right: 16, top: 80 }
          }
        >
          <div
            className={`flex cursor-move touch-none select-none items-center justify-between border-b border-sky-100/80 bg-white/35 px-4 py-3 dark:border-sky-900/50 dark:bg-sky-950/20 ${draggingTranslate ? 'cursor-grabbing' : ''}`}
            onPointerDown={handleTranslateDragStart}
            onPointerMove={handleTranslateDragMove}
            onPointerUp={handleTranslateDragEnd}
            onPointerCancel={handleTranslateDragEnd}
          >
            <span className="sky-floating-title">AI Translate</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowTranslate(false)
                  setTranslateSourceText('')
                  setTranslateResult('')
                  setTranslatePosition(null)
                  clearSelection()
                }}
                className="rounded-full px-2 py-1 text-xs font-medium text-sky-500 transition-colors hover:bg-sky-50 hover:text-sky-700 dark:text-sky-200 dark:hover:bg-sky-900/40"
              >
                关闭
              </button>
            </div>
          </div>
          <div className="max-h-[calc(70vh-3.5rem)] space-y-3 overflow-auto p-4 [scrollbar-color:rgba(14,165,233,0.35)_transparent]">
            <div className="rounded-xl border border-sky-100 bg-white/65 p-3 text-xs leading-relaxed text-sky-950 dark:border-sky-900/60 dark:bg-slate-900/45 dark:text-sky-100">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-200">Source</div>
              <div className="flex items-center gap-2">
                <div className="whitespace-pre-wrap text-sm">{translateSourceText}</div>
                <button
                  type="button"
                  onClick={() => speakText(translateSourceText)}
                  aria-label="朗读原文"
                  className="sky-icon-button h-7 w-7 shrink-0"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                    <path d="M18.5 5.5a9 9 0 0 1 0 13" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-cyan-100 bg-gradient-to-br from-sky-50 via-cyan-50 to-white p-3 text-sm leading-relaxed text-slate-800 dark:border-cyan-900/50 dark:from-sky-950/40 dark:via-cyan-950/30 dark:to-slate-900/70 dark:text-sky-100">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-200">Translation</div>
              {translateResult ? (
                <>
                  <div className="mb-4 flex items-center gap-2">
                    <div className="text-lg font-semibold text-sky-700 dark:text-sky-200">
                      {getPrimaryTranslationText(translateResult)}
                    </div>
                    <button
                      type="button"
                      onClick={() => speakText(getPrimaryTranslationText(translateResult))}
                      aria-label="朗读译文"
                      disabled={!getPrimaryTranslationText(translateResult)}
                      className="sky-icon-button h-7 w-7 shrink-0 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                    <path d="M18.5 5.5a9 9 0 0 1 0 13" />
                  </svg>
                    </button>
                  </div>
                  {getTranslationDetailText(translateResult) && (
                    <MarkdownRenderer content={getTranslationDetailText(translateResult)} />
                  )}
                </>
              ) : (
                translating && <span className="animate-pulse">▊</span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
