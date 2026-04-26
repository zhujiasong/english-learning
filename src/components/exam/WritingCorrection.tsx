'use client'

import { useState, useCallback } from 'react'
import { AIPanel } from '@/components/ai/AIPanel'
import { buildWritingHintPrompt, buildWritingCorrectionPrompt } from '@/lib/prompts/writing'
import { useSettings } from '@/lib/store/settings'
import { createProvider } from '@/lib/ai'
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer'
import { SelectionToolbar } from '@/components/ai/SelectionToolbar'

interface WritingTask {
  title: string
  requirement: string
}

export function WritingCorrection({ task }: { task: WritingTask }) {
  const { settings } = useSettings()
  const [essay, setEssay] = useState('')
  const [correctionResult, setCorrectionResult] = useState('')
  const [correcting, setCorrecting] = useState(false)
  const [correctionError, setCorrectionError] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [showSelectionQuestion, setShowSelectionQuestion] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [wordCount, setWordCount] = useState(0)

  const handleEssayChange = (text: string) => {
    setEssay(text)
    setWordCount(
      text
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length
    )
  }

  const handleCorrect = useCallback(async () => {
    if (!essay.trim() || !settings.provider || !settings.apiKey) return

    setCorrecting(true)
    setCorrectionError('')
    setCorrectionResult('')

    try {
      const provider = createProvider(settings.provider)
      const stream = await provider.chatCompletion({
        model: settings.model,
        messages: [
          {
            role: 'user',
            content: buildWritingCorrectionPrompt(
              task.title,
              task.requirement,
              essay
            ),
          },
        ],
        apiKey: settings.apiKey,
        stream: false,
        temperature: 0.3,
        maxTokens: 4000,
      })

      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let rawText = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        rawText += decoder.decode(value, { stream: true })
      }

      let content = rawText
      try {
        const parsed = JSON.parse(rawText)
        content = parsed.choices?.[0]?.message?.content || rawText
      } catch {
        // use raw text if not JSON
      }

      setCorrectionResult(content)
    } catch (err) {
      setCorrectionError(err instanceof Error ? err.message : '批改失败')
    } finally {
      setCorrecting(false)
    }
  }, [essay, settings, task.title, task.requirement])

  const selectionPrompt = `学生在作文练习中选中了一段内容。请用中文解释这段内容，指出它和作文题目的关系；如果包含英语表达，请说明意思、用法和可改进点。

作文题目：${task.title}
写作要求：
${task.requirement}

选中文本：
"${selectedText}"

请控制在200字以内。`

  return (
    <div>
      <SelectionToolbar
        onQuestion={(text) => {
          setSelectedText(text)
          setShowSelectionQuestion(true)
        }}
      />
      <div className="mb-4">
        <h3 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {task.title}
        </h3>
        <p className="rounded-lg bg-zinc-50 p-3 text-sm leading-relaxed text-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-400">
          {task.requirement}
        </p>
        <button
          onClick={() => setShowHint(true)}
          className="mt-2 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
        >
          AI 写作提示
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            你的作文
          </label>
          <span className="text-xs text-zinc-400">
            {wordCount} 词
          </span>
        </div>
        <textarea
          value={essay}
          onChange={(e) => handleEssayChange(e.target.value)}
          placeholder="在这里输入你的作文..."
          rows={10}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      <button
        onClick={handleCorrect}
        disabled={!essay.trim() || correcting}
        className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {correcting ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            AI 批改中...
          </span>
        ) : (
          '提交批改'
        )}
      </button>

      {correctionError && (
        <div className="mt-3 rounded bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {correctionError}
        </div>
      )}

      {correctionResult && (
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <h4 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            批改结果
          </h4>
          <MarkdownRenderer
            content={correctionResult}
            className="correction-content text-sm leading-relaxed"
          />
        </div>
      )}

      <AIPanel
        open={showHint}
        onClose={() => setShowHint(false)}
        title="写作提示"
        initialMessage={buildWritingHintPrompt(task.title, task.requirement)}
      />
      <AIPanel
        open={showSelectionQuestion}
        onClose={() => setShowSelectionQuestion(false)}
        title="AI 解答"
        initialMessage={selectionPrompt}
      />
    </div>
  )
}
