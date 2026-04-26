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

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        真题模拟
      </h1>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        历年真题和模拟试卷，逐题练习，AI点拨。做题时先自己思考，遇到困难再求助AI。
      </p>

      {loading ? (
        <Loading text="加载试卷列表..." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {papers.map((paper) => (
            <Link
              key={paper.id}
              href={`/exam/${paper.id}`}
              className="group rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-blue-300 hover:bg-blue-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700 dark:hover:bg-blue-900/10"
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    paper.type === 'real'
                      ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}
                >
                  {paper.type === 'real' ? '真题' : '模拟'}
                </span>
                <span className="text-xs text-zinc-400">{paper.year}</span>
              </div>
              <h2 className="text-sm font-medium text-zinc-800 group-hover:text-blue-600 dark:text-zinc-200 dark:group-hover:text-blue-400">
                {paper.title}
              </h2>
            </Link>
          ))}
        </div>
      )}

      {!loading && papers.length === 0 && (
        <div className="py-12 text-center text-zinc-500">
          暂无试卷，请先运行数据库初始化。
        </div>
      )}
    </div>
  )
}
