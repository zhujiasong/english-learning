'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface TreeNode {
  id: string
  title: string
  level: number
  category: string
  contentGenerated: boolean
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
}: {
  node: TreeNode
  expanded: Set<string>
  onToggle: (id: string) => void
}) {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expanded.has(node.id)

  return (
    <li>
      <div className="flex items-center gap-1.5 py-1">
        {hasChildren ? (
          <button
            onClick={() => onToggle(node.id)}
            className="flex h-5 w-5 items-center justify-center rounded text-xs text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
          >
            {isExpanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <Link
          href={`/knowledge/${node.id}`}
          className="group flex flex-1 items-center gap-2 rounded px-2 py-0.5 text-sm text-zinc-700 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-zinc-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
        >
          <span className="text-xs">{categoryIcons[node.category] || '📄'}</span>
          <span>{node.title}</span>
          {node.contentGenerated && (
            <span className="ml-auto text-[10px] text-green-500">已生成</span>
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
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export function KnowledgeTree() {
  const [tree, setTree] = useState<TreeNode[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/knowledge')
      .then((r) => r.json())
      .then((data: TreeNode[]) => {
        setTree(data)
        const firstLevelIds = new Set(data.map((n) => n.id))
        setExpanded(firstLevelIds)
      })
      .catch(() => setTree([]))
      .finally(() => setLoading(false))
  }, [])

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
          />
        ))}
      </ul>
    </nav>
  )
}
