'use client'

import { useState, useCallback } from 'react'
import { useGlobalAIPanel } from '@/components/ai/GlobalAIPanel'
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
  const { ask } = useGlobalAIPanel()
  const [essay, setEssay] = useState('')
  const [correctionResult, setCorrectionResult] = useState('')
  const [correcting, setCorrecting] = useState(false)
  const [correctionError, setCorrectionError] = useState('')
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

  const handleHint = useCallback(() => {
    ask(buildWritingHintPrompt(task.title, task.requirement), { title: '写作提示' })
  }, [ask, task.title, task.requirement])

  const handleSelectionQuestion = useCallback((text: string) => {
    const selectionPrompt = [
      '学生在作文练习中选中了一段内容。请用中文解释这段内容，指出它和作文题目的关系；如果包含英语表达，请说明意思、用法和可改进点。',
      '',
      '作文题目：' + task.title,
      '写作要求：',
      task.requirement,
      '',
      '选中文本：',
      '"' + text + '"',
      '',
      '请控制在200字以内。',
    ].join('\n')
    ask(selectionPrompt, { title: 'AI 解答' })
  }, [ask, task.title, task.requirement])

  const targetWords = 80
  const wordProgress = Math.min(Math.round((wordCount / targetWords) * 100), 100)

  return (
    <div className="space-y-6">
      <SelectionToolbar onQuestion={handleSelectionQuestion} />

      <section className="sky-hero px-8 py-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_17rem]">
          <div>
            <div className="sky-hero-kicker">Writing Task</div>
            <h1 className="sky-page-title mt-3 text-3xl font-semibold">
              {task.title}
            </h1>
            <p className="sky-page-copy mt-3 max-w-2xl whitespace-pre-wrap text-sm leading-7">
              {task.requirement}
            </p>
            <button
              onClick={handleHint}
              className="sky-button-secondary mt-5 rounded-full px-4 py-2 text-sm font-medium transition-colors"
            >
              AI 写作提示
            </button>
          </div>

          <div className="rounded-xl border border-sky-100 bg-white/70 p-4 dark:border-sky-900/50 dark:bg-slate-900/45">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-700/70 dark:text-cyan-200/70">
              Writing Status
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <div className="text-3xl font-semibold text-sky-700 dark:text-sky-200">
                  {wordCount}
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-sky-100/60">
                  当前词数
                </div>
              </div>
              <div className="text-right text-xs text-slate-500 dark:text-sky-100/60">
                目标约 {targetWords} 词
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-sky-100 dark:bg-sky-950/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all"
                style={{ width: wordProgress + '%' }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="sky-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-sky-100/80 bg-white/40 px-5 py-4 dark:border-sky-900/50 dark:bg-sky-950/20">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-700/70 dark:text-cyan-200/70">
                Essay Draft
              </div>
              <label className="mt-1 block text-sm font-semibold text-sky-950 dark:text-sky-100">
                你的作文
              </label>
            </div>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-100 dark:bg-sky-950/50 dark:text-sky-200 dark:ring-sky-900/60">
              {wordCount} 词
            </span>
          </div>

          <textarea
            value={essay}
            onChange={(e) => handleEssayChange(e.target.value)}
            placeholder="在这里输入你的作文..."
            rows={15}
            className="block w-full resize-y border-0 bg-white/62 px-5 py-4 text-sm leading-8 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0 dark:bg-slate-950/20 dark:text-sky-100"
          />

          <div className="flex items-center justify-between gap-3 border-t border-sky-100/80 bg-white/35 px-5 py-4 dark:border-sky-900/50 dark:bg-sky-950/20">
            <p className="text-xs text-slate-500 dark:text-sky-100/60">
              提交前可以先划线向 AI 追问表达、语法或句式问题。
            </p>
            <button
              onClick={handleCorrect}
              disabled={!essay.trim() || correcting}
              className="sky-button-primary shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
          </div>
        </div>

        <aside className="space-y-4">
          <div className="sky-card p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-700/70 dark:text-cyan-200/70">
              Focus
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {['审题', '结构', '句式', '词汇', '语法', '得分点'].map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-100 dark:bg-sky-950/50 dark:text-sky-200 dark:ring-sky-900/60"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="sky-card p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-700/70 dark:text-cyan-200/70">
              Tip
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-sky-100/75">
              中考作文优先保证信息完整、结构清晰、句子正确，再尝试使用更丰富的连接词和高级表达。
            </p>
          </div>
        </aside>
      </section>

      {correctionError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300">
          {correctionError}
        </div>
      )}

      {correctionResult && (
        <section className="sky-card overflow-hidden">
          <div className="border-b border-sky-100/80 bg-white/40 px-5 py-4 dark:border-sky-900/50 dark:bg-sky-950/20">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-700/70 dark:text-cyan-200/70">
              Correction Report
            </div>
            <h2 className="mt-1 text-sm font-semibold text-sky-950 dark:text-sky-100">
              批改结果
            </h2>
          </div>
          <div className="p-5">
            <MarkdownRenderer
              content={correctionResult}
              className="correction-content text-sm leading-relaxed"
            />
          </div>
        </section>
      )}
    </div>
  )
}
