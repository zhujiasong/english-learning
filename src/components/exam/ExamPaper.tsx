'use client'

import { useState, useEffect, useMemo } from 'react'
import { QuestionCard } from './QuestionCard'
import { Loading } from '@/components/ui/Loading'

interface PaperQuestion {
  id: string
  type: string
  stem: string
  options: string[] | null
  answer: string | null
  explanation: string | null
  sortOrder: number
}

interface ExamPaperData {
  id: string
  title: string
  year: number
  type: string
  questions: PaperQuestion[]
}

export function ExamPaperView({ paperId }: { paperId: string }) {
  const [paper, setPaper] = useState<ExamPaperData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/exam/' + paperId)
      .then((r) => r.json())
      .then((data) => setPaper(data))
      .catch(() => setPaper(null))
      .finally(() => setLoading(false))
  }, [paperId])

  const sortedQuestions = useMemo(
    () => paper ? [...paper.questions].sort((a, b) => a.sortOrder - b.sortOrder) : [],
    [paper]
  )

  if (loading) return <Loading text="加载试卷中..." />

  if (!paper) {
    return (
      <div className="sky-card py-12 text-center text-sm text-slate-500 dark:text-sky-100/70">试卷不存在</div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="sky-hero px-8 py-8">
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_14rem]">
          <div>
            <div className="sky-hero-kicker">
              {paper.type === 'real' ? 'Real Exam' : 'Mock Exam'} · {paper.year}
            </div>
            <h1 className="sky-page-title mt-3 text-3xl font-semibold">
              {paper.title}
            </h1>
            <p className="sky-page-copy mt-3 text-sm leading-7">
              贵州中考英语练习卷。完成题目后可以查看答案，也可以对题干、选项或解析划线提问。
            </p>
          </div>
          <div className="rounded-xl border border-sky-100 bg-white/70 p-4 dark:border-sky-900/50 dark:bg-slate-900/45">
            <div className="text-2xl font-semibold text-sky-700 dark:text-sky-200">{paper.questions.length}</div>
            <div className="mt-1 text-xs text-slate-500 dark:text-sky-100/60">题目数量</div>
          </div>
        </div>
      </section>

      <div className="space-y-6">
        {sortedQuestions.map((q) => (
          <QuestionCard key={q.id} question={q} />
        ))}
      </div>
    </div>
  )
}
