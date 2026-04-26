import { KnowledgeTree } from '@/components/knowledge/KnowledgeTree'

export const metadata = {
  title: '知识点学习 - 贵州中考英语AI辅导',
}

export default function KnowledgePage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        知识点学习
      </h1>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        按贵州中考考纲划分的知识体系。点击任意知识点，AI将生成详细讲解内容。
      </p>
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <KnowledgeTree />
      </div>
    </div>
  )
}
