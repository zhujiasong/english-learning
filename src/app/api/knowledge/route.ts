import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const nodes = await prisma.knowledgeNode.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    const nodeMap = new Map<string, typeof nodes[number] & { children: typeof nodes }>()
    const roots: (typeof nodes[number] & { children: typeof nodes })[] = []

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

    return NextResponse.json(roots)
  } catch {
    return NextResponse.json(
      { error: '获取知识点失败' },
      { status: 500 }
    )
  }
}
