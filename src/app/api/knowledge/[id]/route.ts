import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const node = await prisma.knowledgeNode.findUnique({
      where: { id },
      include: {
        parent: {
          select: { id: true, title: true },
        },
      },
    })

    if (!node) {
      return NextResponse.json({ error: '知识点不存在' }, { status: 404 })
    }

    return NextResponse.json(node)
  } catch {
    return NextResponse.json({ error: '获取知识点失败' }, { status: 500 })
  }
}

