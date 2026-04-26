import { KnowledgeTree } from '@/components/knowledge/KnowledgeTree'

export const metadata = {
  title: '知识点学习 - 贵州中考英语AI辅导',
}

export default function KnowledgePage() {
  return (
    <div className="space-y-6">
      <section className="sky-hero px-8 py-8">
        <div className="max-w-3xl">
          <div className="sky-hero-kicker">Knowledge Map</div>
          <h1 className="sky-page-title mt-3 text-3xl font-semibold">
            知识点学习
          </h1>
          <p className="sky-page-copy mt-3 max-w-2xl text-sm leading-7">
            按贵州中考考纲组织语法、词汇和题型知识。选择任意节点后，AI 会生成适合初中生理解的讲解、例题和易错提醒。
          </p>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[18rem_1fr]">
        <div className="sky-card p-5">
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700/70 dark:text-sky-200/70">
            Catalog
          </div>
          <div className="space-y-3 text-sm text-slate-600 dark:text-sky-100/75">
            <p>从右侧目录进入具体考点。</p>
            <p>讲解内容会缓存在浏览器本地，减少重复生成等待。</p>
          </div>
        </div>
        <div className="sky-card p-5">
          <KnowledgeTree />
        </div>
      </section>
    </div>
  )
}
