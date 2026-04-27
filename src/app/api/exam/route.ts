import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const papers = await prisma.examPaper.findMany({
      select: {
        id: true,
        title: true,
        year: true,
        type: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(papers, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
      },
    })
  } catch {
    return NextResponse.json({ error: '获取试卷列表失败' }, { status: 500 })
  }
}
