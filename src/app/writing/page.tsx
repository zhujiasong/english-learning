'use client'

import { useState } from 'react'
import { WritingCorrection } from '@/components/exam/WritingCorrection'
import { useSettings } from '@/lib/store/settings'
import { BackButton } from '@/components/ui/BackButton'
import Link from 'next/link'

const sampleTasks = [
  {
    title: '书信写作：给笔友回信',
    requirement:
      '假如你是李华，你的美国笔友Tom来信询问你的暑假计划。请你用英语写一封回信，内容包括：\n1. 暑假的主要活动安排\n2. 选择这些活动的原因\n3. 期待他的回信\n\n要求：80词左右。',
  },
  {
    title: '话题作文：环境保护',
    requirement:
      '请以"What Can We Do for the Environment"为题，写一篇80词左右的英语短文。\n内容包括：\n1. 环境问题的现状\n2. 我们可以采取的行动\n3. 呼吁大家一起保护环境',
  },
  {
    title: '日记：难忘的一天',
    requirement:
      '请用英语写一篇日记，记录你最难忘的一天。\n内容包括：\n1. 这件事发生的时间、地点\n2. 事情的经过\n3. 你的感受\n\n要求：80词左右，格式正确。',
  },
]

export default function WritingPage() {
  const { settings } = useSettings()
  const [selectedTask, setSelectedTask] = useState<
    (typeof sampleTasks)[0] | null
  >(null)

  if (!settings.provider || !settings.apiKey) {
    return (
      <div>
        <BackButton href="/" />
        <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          作文练习
        </h1>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center dark:border-yellow-800 dark:bg-yellow-900/20">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            请先前往
            <Link
              href="/settings"
              className="mx-1 font-medium text-blue-600 underline dark:text-blue-400"
            >
              模型配置
            </Link>
            设置AI提供商和API Key，才能使用作文批改功能。
          </p>
        </div>
      </div>
    )
  }

  if (selectedTask) {
    return (
      <div>
        <button
          onClick={() => setSelectedTask(null)}
          className="mb-4 flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回题目列表
        </button>
        <WritingCorrection task={selectedTask} />
      </div>
    )
  }

  return (
    <div>
      <BackButton href="/" />
      <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        作文练习
      </h1>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        选择一个题目开始写作，提交后AI将进行深度批改：审题分析、逐句批改、结构评估、综合评分。
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {sampleTasks.map((task, i) => (
          <button
            key={i}
            onClick={() => setSelectedTask(task)}
            className="rounded-lg border border-zinc-200 bg-white p-4 text-left transition-colors hover:border-purple-300 hover:bg-purple-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-purple-700 dark:hover:bg-purple-900/10"
          >
            <h3 className="mb-1.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              {task.title}
            </h3>
            <p className="line-clamp-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 whitespace-pre-wrap">
              {task.requirement}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
