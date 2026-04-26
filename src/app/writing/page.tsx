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
      <div className="space-y-6">
        <BackButton href="/" />
        <section className="sky-hero px-8 py-8">
          <div className="sky-hero-kicker">Writing Coach</div>
          <h1 className="sky-page-title mt-3 text-3xl font-semibold">
            作文练习
          </h1>
          <p className="sky-page-copy mt-3 max-w-2xl text-sm leading-7">
            选择写作任务后，AI 会从审题、结构、句式、表达和中考评分角度进行批改。
          </p>
        </section>
        <div className="sky-card p-6 text-center">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            请先前往
            <Link
              href="/settings"
              className="mx-1 font-medium text-sky-700 underline dark:text-sky-200"
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
          className="mb-4 flex items-center gap-1 text-sm text-sky-700/80 hover:text-sky-900 dark:text-sky-200/70 dark:hover:text-sky-100"
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
    <div className="space-y-6">
      <BackButton href="/" />
      <section className="sky-hero px-8 py-8">
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_18rem]">
          <div>
            <div className="sky-hero-kicker">Writing Coach</div>
            <h1 className="sky-page-title mt-3 text-3xl font-semibold">
              作文练习
            </h1>
            <p className="sky-page-copy mt-3 max-w-2xl text-sm leading-7">
              从典型中考写作任务开始练习。提交作文后，AI 会给出审题分析、逐句批改、结构评估和综合评分。
            </p>
          </div>
          <div className="rounded-xl border border-sky-100 bg-white/70 p-4 dark:border-sky-900/50 dark:bg-slate-900/45">
            <div className="text-2xl font-semibold text-sky-700 dark:text-sky-200">3</div>
            <div className="mt-1 text-xs text-slate-500 dark:text-sky-100/60">精选写作任务</div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {sampleTasks.map((task, i) => (
          <button
            key={i}
            onClick={() => setSelectedTask(task)}
            className="sky-card sky-card-hover flex min-h-52 flex-col p-5 text-left"
          >
            <div className="mb-4 h-1.5 w-14 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400" />
            <h3 className="text-base font-semibold text-sky-950 dark:text-sky-100">
              {task.title}
            </h3>
            <p className="mt-3 line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-sky-100/75">
              {task.requirement}
            </p>
            <span className="mt-auto pt-5 text-sm font-medium text-sky-700 dark:text-sky-200">
              开始写作
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
