import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const nodes = await prisma.knowledgeNode.findMany({
      select: {
        id: true,
        title: true,
        parentId: true,
        level: true,
        sortOrder: true,
        category: true,
        contentGenerated: true,
        updatedAt: true,
      },
      orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
    })

    type KnowledgeTreeNode = (typeof nodes)[number] & { children: KnowledgeTreeNode[] }
    const nodeMap = new Map<string, KnowledgeTreeNode>()
    const roots: KnowledgeTreeNode[] = []

    for (const node of nodes) {
      nodeMap.set(node.id, { ...node, children: [] })
    }

    for (const node of nodes) {
      const treeNode = nodeMap.get(node.id)!
      if (node.parentId && nodeMap.has(node.parentId)) {
        nodeMap.get(node.parentId)!.children.push(treeNode)
      } else {
        roots.push(treeNode)
      }
    }

    return NextResponse.json(roots, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
      },
    })
  } catch {
    return NextResponse.json(
      { error: '获取知识点失败' },
      { status: 500 }
    )
  }
}
