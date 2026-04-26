import { ExamPaperView } from '@/components/exam/ExamPaper'
import { BackButton } from '@/components/ui/BackButton'

export const metadata = {
  title: '真题试卷 - 贵州中考英语AI辅导',
}

export default async function ExamPaperPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <>
      <BackButton href="/exam" />
      <ExamPaperView paperId={id} />
    </>
  )
}
