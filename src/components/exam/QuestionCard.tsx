'use client'

import { useState } from 'react'
import { AIPanel } from '@/components/ai/AIPanel'
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
  const [showHint, setShowHint] = useState(false)
  const [showSelectionQuestion, setShowSelectionQuestion] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const hintPrompt = buildHintUserPrompt(
    question.stem,
    typeLabels[question.type] || question.type,
    question.options ?? undefined,
    selectedOption ?? undefined
  )

  const hintSystem = buildHintSystemPrompt()
  const selectionPrompt = `学生在做下面这道${typeLabels[question.type] || question.type}题时，选中了其中一段内容。请用中文解释这段内容的含义、相关语法或解题线索，适合贵州初中生理解。不要直接给出整题答案。

题目：
${question.stem}
${question.options?.length ? `\n选项：\n${question.options.join('\n')}` : ''}

选中文本：
"${selectedText}"

请控制在200字以内。`

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <SelectionToolbar
        onQuestion={(text) => {
          setSelectedText(text)
          setShowSelectionQuestion(true)
        }}
      />

      <div className="mb-3 flex items-center gap-2">
        <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
          {typeLabels[question.type] || question.type}
        </span>
        {question.sortOrder > 0 && (
          <span className="text-xs text-zinc-400">第{question.sortOrder}题</span>
        )}
      </div>

      <div className="mb-4 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
        {question.stem}
      </div>

      {question.options && question.options.length > 0 && (
        <div className="mb-4 space-y-2">
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
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  isCorrect
                    ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                    : isSelected && showAnswer
                      ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                      : isSelected
                        ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                        : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-600 dark:hover:border-zinc-500 dark:hover:bg-zinc-700/50'
                }`}
              >
                <span className="font-medium">{label}.</span> {opt}
                {isCorrect && <span className="ml-2 text-green-600 dark:text-green-400">✓ 正确</span>}
                {isSelected && showAnswer && !isCorrect && (
                  <span className="ml-2 text-red-600 dark:text-red-400">✗ 正确答案是 {question.answer}</span>
                )}
              </button>
            )
          })}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowHint(true)}
          className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
        >
          AI 点拨
        </button>
        <button
          onClick={() => setShowAnswer(true)}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700"
        >
          查看答案
        </button>
        {question.explanation && showAnswer && (
          <span className="text-xs text-zinc-500">{question.explanation}</span>
        )}
      </div>

      <AIPanel
        open={showHint}
        onClose={() => setShowHint(false)}
        title="AI 点拨"
        systemPrompt={hintSystem.content}
        initialMessage={hintPrompt.content}
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
