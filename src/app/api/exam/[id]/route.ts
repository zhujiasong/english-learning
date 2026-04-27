import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const paper = await prisma.examPaper.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!paper) {
      return NextResponse.json({ error: '试卷不存在' }, { status: 404 })
    }

    // Parse options string to array
    const paperWithParsedOptions = {
      ...paper,
      questions: paper.questions.map((q: { options: string | null }) => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : null,
      })),
    }

    return NextResponse.json(paperWithParsedOptions, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
      },
    })
  } catch {
    return NextResponse.json({ error: '获取试卷失败' }, { status: 500 })
  }
}
