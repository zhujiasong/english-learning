'use client'

import { useState, useEffect } from 'react'
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
    fetch(`/api/exam/${paperId}`)
      .then((r) => r.json())
      .then((data) => setPaper(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [paperId])

  if (loading) return <Loading text="加载试卷中..." />

  if (!paper) {
    return (
      <div className="py-12 text-center text-zinc-500">试卷不存在</div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <div className="text-xs text-zinc-500">
          {paper.type === 'real' ? '真题' : '模拟'} · {paper.year} · 贵州
        </div>
        <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {paper.title}
        </h1>
      </div>

      <div className="space-y-6">
        {paper.questions
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
      </div>
    </div>
  )
}
