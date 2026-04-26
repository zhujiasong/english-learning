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
    <div className="space-y-4">
      <BackButton href="/knowledge" />
      <div className="grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-auto">
          <div className="sky-card overflow-hidden">
            <div className="border-b border-sky-100/80 bg-white/40 px-4 py-3 dark:border-sky-900/50 dark:bg-sky-950/20">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-700/70 dark:text-cyan-200/70">
                Catalog
              </div>
              <div className="mt-1 text-sm font-semibold text-sky-950 dark:text-sky-100">
                知识目录
              </div>
            </div>
            <div className="p-3">
              <KnowledgeTree activeId={id} compact />
            </div>
          </div>
        </aside>
        <KnowledgeContent id={id} />
      </div>
    </div>
  )
}
