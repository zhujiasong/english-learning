import { KnowledgeContent } from '@/components/knowledge/KnowledgeContent'
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
    <>
      <BackButton href="/knowledge" />
      <KnowledgeContent id={id} />
    </>
  )
}
