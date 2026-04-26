import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const papers = await prisma.examPaper.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(papers)
  } catch {
    return NextResponse.json({ error: '获取试卷列表失败' }, { status: 500 })
  }
}
