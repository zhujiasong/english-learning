'use client'

import { useCallback, useState } from 'react'
import { useGlobalAIPanel } from '@/components/ai/GlobalAIPanel'
import { buildHintSystemPrompt, buildHintUserPrompt } from '@/lib/prompts/hint'
import { SelectionToolbar } from '@/components/ai/SelectionToolbar'

interface Question {
  id: string
  type: string
  stem: string
  options: string[] | null
  answer: string | null
  explanation: string | null
  sortOrder: number
}

const typeLabels: Record<string, string> = {
  choice: '单项选择',
  cloze: '完形填空',
  reading: '阅读理解',
  writing: '写作',
  listening: '听力',
  fill: '短文填空',
  task: '任务型阅读',
}

export function QuestionCard({ question }: { question: Question }) {
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const { ask } = useGlobalAIPanel()

  const hintPrompt = buildHintUserPrompt(
    question.stem,
    typeLabels[question.type] || question.type,
    question.options ?? undefined,
    selectedOption ?? undefined
  )

  const hintSystem = buildHintSystemPrompt()

  const handleHint = useCallback(() => {
    ask(hintPrompt.content, {
      title: 'AI 点拨',
      systemPrompt: hintSystem.content,
    })
  }, [ask, hintPrompt.content, hintSystem.content])

  const handleSelectionQuestion = useCallback((text: string) => {
    const optionText = question.options?.length
      ? '\n选项：\n' + question.options.join('\n')
      : ''
    const selectionPrompt = [
      '学生在做下面这道' + (typeLabels[question.type] || question.type) + '题时，选中了其中一段内容。请用中文解释这段内容的含义、相关语法或解题线索，适合贵州初中生理解。不要直接给出整题答案。',
      '',
      '题目：',
      question.stem + optionText,
      '',
      '选中文本：',
      '"' + text + '"',
      '',
      '请控制在200字以内。',
    ].join('\n')
    ask(selectionPrompt, { title: 'AI 解答' })
  }, [ask, question.options, question.stem, question.type])

  return (
    <article className="sky-card overflow-hidden">
      <SelectionToolbar onQuestion={handleSelectionQuestion} />

      <div className="border-b border-sky-100/80 bg-white/45 px-5 py-4 dark:border-sky-900/50 dark:bg-slate-950/20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="sky-pill rounded-full px-2.5 py-1 text-xs font-semibold">
              {typeLabels[question.type] || question.type}
            </span>
            {question.sortOrder > 0 && (
              <span className="text-xs font-medium text-slate-400">第{question.sortOrder}题</span>
            )}
          </div>
          {selectedOption && !showAnswer && (
            <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 dark:bg-sky-950/50 dark:text-sky-200">
              已选 {selectedOption}
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="mb-5 whitespace-pre-wrap text-[0.95rem] leading-8 text-slate-800 dark:text-sky-100">
          {question.stem}
        </div>

        {question.options && question.options.length > 0 && (
          <div className="mb-5 grid gap-2">
            {question.options.map((opt, i) => {
              const label = String.fromCharCode(65 + i)
              const isSelected = selectedOption === label
              const isCorrect = showAnswer && question.answer === label

              return (
                <button
                  key={i}
                  onClick={() => {
                    if (!showAnswer) setSelectedOption(label)
                  }}
                  disabled={showAnswer}
                  className={
                    'group flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left text-sm leading-6 transition-colors ' +
                    (isCorrect
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-100'
                      : isSelected && showAnswer
                        ? 'border-rose-300 bg-rose-50 text-rose-950 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-100'
                        : isSelected
                          ? 'border-sky-300 bg-sky-50 text-sky-950 dark:border-sky-700 dark:bg-sky-900/20 dark:text-sky-100'
                          : 'border-sky-100 bg-white/70 text-slate-700 hover:border-sky-300 hover:bg-sky-50 dark:border-sky-900/50 dark:bg-slate-900/40 dark:text-sky-100/85 dark:hover:border-sky-700 dark:hover:bg-sky-900/20')
                  }
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700 group-hover:bg-sky-200 dark:bg-sky-950 dark:text-sky-200">
                    {label}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {isCorrect && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-300">正确</span>}
                  {isSelected && showAnswer && !isCorrect && (
                    <span className="text-xs font-medium text-rose-600 dark:text-rose-300">应选 {question.answer}</span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {showAnswer && (
          <div className="mb-5 rounded-xl border border-cyan-100 bg-cyan-50/70 p-4 dark:border-cyan-900/50 dark:bg-cyan-950/25">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-200">
              Answer
            </div>
            <div className="mt-2 text-sm leading-7 text-slate-700 dark:text-sky-100/85">
              <span className="font-semibold text-cyan-800 dark:text-cyan-100">答案：{question.answer || '暂无'}</span>
              {question.explanation && (
                <p className="mt-2 text-slate-600 dark:text-sky-100/75">{question.explanation}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-sky-100 pt-4 dark:border-sky-900/50">
          <button
            onClick={handleHint}
            className="sky-button-secondary rounded-full px-3.5 py-2 text-xs font-medium transition-colors"
          >
            AI 点拨
          </button>
          <button
            onClick={() => setShowAnswer(true)}
            className="rounded-full border border-sky-100 bg-white/70 px-3.5 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-sky-300 hover:bg-sky-50 dark:border-sky-900/50 dark:bg-slate-900/40 dark:text-sky-100/80 dark:hover:bg-sky-900/20"
          >
            查看答案
          </button>
        </div>
      </div>
    </article>
  )
}
