import { KnowledgeContent } from '@/components/knowledge/KnowledgeContent'
import { KnowledgeTree } from '@/components/knowledge/KnowledgeTree'
import { BackButton } from '@/components/ui/BackButton'

export const metadata = {
  title: '知识点详情 - 贵州中考英语AI辅导',
}

export default async function KnowledgeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div>
      <BackButton href="/knowledge" />
      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-16 lg:max-h-[calc(100vh-5rem)] lg:overflow-auto">
          <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 px-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              知识目录
            </div>
            <KnowledgeTree activeId={id} compact />
          </div>
        </aside>
        <KnowledgeContent id={id} />
      </div>
    </div>
  )
}
