'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Loading } from '@/components/ui/Loading'

interface ExamPaperItem {
  id: string
  title: string
  year: number
  type: string
}

export default function ExamListPage() {
  const [papers, setPapers] = useState<ExamPaperItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/exam')
      .then((r) => r.json())
      .then((data) => setPapers(data))
      .catch(() => setPapers([]))
      .finally(() => setLoading(false))
  }, [])

  const realCount = papers.filter((paper) => paper.type === 'real').length
  const mockCount = papers.length - realCount

  return (
    <div className="space-y-6">
      <section className="sky-hero px-8 py-8">
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_18rem]">
          <div>
            <div className="sky-hero-kicker">Exam Practice</div>
            <h1 className="sky-page-title mt-3 text-3xl font-semibold">
              真题模拟
            </h1>
            <p className="sky-page-copy mt-3 max-w-2xl text-sm leading-7">
              历年真题和模拟试卷集中练习。先自己完成判断，再通过 AI 点拨理解题干、选项和考点。
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-sky-100 bg-white/70 p-4 dark:border-sky-900/50 dark:bg-slate-900/45">
              <div className="text-2xl font-semibold text-sky-700 dark:text-sky-200">{realCount}</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-sky-100/60">真题</div>
            </div>
            <div className="rounded-xl border border-cyan-100 bg-white/70 p-4 dark:border-cyan-900/50 dark:bg-slate-900/45">
              <div className="text-2xl font-semibold text-cyan-700 dark:text-cyan-200">{mockCount}</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-sky-100/60">模拟</div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <Loading text="加载试卷列表..." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {papers.map((paper) => (
            <Link
              key={paper.id}
              href={'/exam/' + paper.id}
              className="group sky-card sky-card-hover flex min-h-36 flex-col p-5"
            >
              <div className="mb-4 flex items-center gap-2">
                <span
                  className={
                    'rounded-full px-2.5 py-1 text-xs font-medium ' +
                    (paper.type === 'real'
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-300'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300')
                  }
                >
                  {paper.type === 'real' ? '真题' : '模拟'}
                </span>
                <span className="text-xs text-slate-400">{paper.year}</span>
              </div>
              <h2 className="text-base font-semibold leading-6 text-slate-900 group-hover:text-sky-700 dark:text-sky-100 dark:group-hover:text-sky-200">
                {paper.title}
              </h2>
              <span className="mt-auto pt-5 text-sm font-medium text-sky-700 dark:text-sky-200">
                开始练习
              </span>
            </Link>
          ))}
        </div>
      )}

      {!loading && papers.length === 0 && (
        <div className="sky-card py-12 text-center text-sm text-slate-500 dark:text-sky-100/70">
          暂无试卷，请先运行数据库初始化。
        </div>
      )}
    </div>
  )
}
