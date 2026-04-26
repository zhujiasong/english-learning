'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { hasCachedKnowledgeContent } from '@/lib/cache/knowledgeContent'

interface TreeNode {
  id: string
  title: string
  level: number
  category: string
  contentGenerated: boolean
  updatedAt: string
  children?: TreeNode[]
}

const categoryIcons: Record<string, string> = {
  grammar: '📖',
  vocabulary: '📝',
  reading: '📚',
  writing: '✍️',
  listening: '👂',
  cloze: '📋',
}

function TreeNodeItem({
  node,
  expanded,
  onToggle,
  activeId,
  compact = false,
}: {
  node: TreeNode
  expanded: Set<string>
  onToggle: (id: string) => void
  activeId?: string
  compact?: boolean
}) {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expanded.has(node.id)
  const isActive = node.id === activeId

  return (
    <li>
      <div className="flex items-center gap-1.5 py-1">
        {hasChildren ? (
          <button
            onClick={() => onToggle(node.id)}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
          >
            {isExpanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}
        <Link
          href={`/knowledge/${node.id}`}
          className={`group flex min-w-0 flex-1 items-center gap-2 rounded px-2 py-0.5 text-sm transition-colors ${
            isActive
              ? 'bg-blue-50 font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
              : 'text-zinc-700 hover:bg-blue-50 hover:text-blue-600 dark:text-zinc-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-400'
          }`}
        >
          <span className="shrink-0 text-xs">{categoryIcons[node.category] || '📄'}</span>
          <span className="min-w-0 flex-1 truncate">{node.title}</span>
          {node.contentGenerated && !compact && (
            <span className="ml-auto shrink-0 text-[10px] text-green-500">已生成</span>
          )}
        </Link>
      </div>
      {hasChildren && isExpanded && (
        <ul className="ml-5 border-l border-zinc-200 pl-2 dark:border-zinc-700">
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              expanded={expanded}
              onToggle={onToggle}
              activeId={activeId}
              compact={compact}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function applyLocalContentState(nodes: TreeNode[]): TreeNode[] {
  return nodes.map((node) => ({
    ...node,
    contentGenerated: hasCachedKnowledgeContent(node.id, node.updatedAt),
    children: node.children ? applyLocalContentState(node.children) : undefined,
  }))
}

function findPathToNode(nodes: TreeNode[], targetId: string): string[] {
  for (const node of nodes) {
    if (node.id === targetId) return [node.id]
    const childPath = findPathToNode(node.children ?? [], targetId)
    if (childPath.length > 0) return [node.id, ...childPath]
  }
  return []
}

export function KnowledgeTree({
  activeId,
  compact = false,
}: {
  activeId?: string
  compact?: boolean
}) {
  const [tree, setTree] = useState<TreeNode[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/knowledge')
      .then((r) => r.json())
      .then((data: TreeNode[]) => {
        const localTree = applyLocalContentState(data)
        setTree(localTree)
        setExpanded(new Set())
      })
      .catch(() => setTree([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!activeId || tree.length === 0) return

    const activePath = findPathToNode(tree, activeId)
    if (activePath.length === 0) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExpanded((prev) => {
      const next = new Set(prev)
      activePath.forEach((id) => next.add(id))
      return next
    })
  }, [activeId, tree])

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="h-5 w-5 animate-spin text-zinc-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  return (
    <nav>
      <ul className="space-y-0.5">
        {tree.map((node) => (
          <TreeNodeItem
            key={node.id}
            node={node}
            expanded={expanded}
            onToggle={toggle}
            activeId={activeId}
            compact={compact}
          />
        ))}
      </ul>
    </nav>
  )
}
