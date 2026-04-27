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

const categoryLabels: Record<string, string> = {
  grammar: '语法',
  vocabulary: '词汇',
  reading: '阅读',
  writing: '写作',
  listening: '听力',
  cloze: '完形',
}

const categoryTokens: Record<string, string> = {
  grammar: 'G',
  vocabulary: 'V',
  reading: 'R',
  writing: 'W',
  listening: 'L',
  cloze: 'C',
}

const KNOWLEDGE_TREE_CACHE_TTL_MS = 60_000

let knowledgeTreeCache: { data: TreeNode[]; expiresAt: number } | null = null
let knowledgeTreeRequest: Promise<TreeNode[]> | null = null

function getCategoryLabel(category: string) {
  return categoryLabels[category] ?? category
}

function getCategoryToken(category: string) {
  return categoryTokens[category] ?? 'K'
}

function countNodes(nodes: TreeNode[]): { total: number; generated: number } {
  return nodes.reduce(
    (acc, node) => {
      const childCount = countNodes(node.children ?? [])
      return {
        total: acc.total + 1 + childCount.total,
        generated: acc.generated + (node.contentGenerated ? 1 : 0) + childCount.generated,
      }
    },
    { total: 0, generated: 0 }
  )
}

function TreeNodeItem({
  node,
  expanded,
  onToggle,
  activeId,
  compact = false,
  depth = 0,
}: {
  node: TreeNode
  expanded: Set<string>
  onToggle: (id: string) => void
  activeId?: string
  compact?: boolean
  depth?: number
}) {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expanded.has(node.id)
  const isActive = node.id === activeId

  return (
    <li className="relative">
      <div className="group flex items-center gap-2 py-0.5">
        {hasChildren ? (
          <button
            onClick={() => onToggle(node.id)}
            aria-label={isExpanded ? '收起目录' : '展开目录'}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sky-100 bg-white/70 text-xs font-semibold text-sky-500 shadow-sm transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 dark:border-sky-900/60 dark:bg-slate-900/45 dark:text-sky-200 dark:hover:bg-sky-900/30"
          >
            {isExpanded ? '−' : '+'}
          </button>
        ) : (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-200 dark:bg-sky-800" />
          </span>
        )}
        <Link
          href={'/knowledge/' + node.id}
          className={
            'flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-2.5 py-2 text-sm transition-colors ' +
            (isActive
              ? 'border-sky-300 bg-gradient-to-r from-sky-100 via-cyan-50 to-white font-semibold text-sky-800 shadow-sm shadow-sky-500/10 dark:border-sky-700 dark:from-sky-900/45 dark:via-cyan-950/25 dark:to-slate-900/40 dark:text-sky-100'
              : 'border-transparent text-slate-700 hover:border-sky-100 hover:bg-white/70 hover:text-sky-700 dark:text-sky-100/78 dark:hover:border-sky-900/50 dark:hover:bg-sky-950/25 dark:hover:text-sky-100')
          }
          style={{ paddingLeft: compact ? undefined : Math.min(depth, 2) * 4 + 10 }}
        >
          <span
            className={
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ' +
              (isActive
                ? 'bg-sky-600 text-white dark:bg-sky-400 dark:text-slate-950'
                : 'bg-sky-50 text-sky-600 ring-1 ring-sky-100 dark:bg-sky-950/70 dark:text-sky-200 dark:ring-sky-900/60')
            }
          >
            {getCategoryToken(node.category)}
          </span>
          <span className="min-w-0 flex-1 truncate">{node.title}</span>
          {!compact && (
            <span className="hidden shrink-0 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-600 ring-1 ring-sky-100 dark:bg-sky-950/50 dark:text-sky-200 dark:ring-sky-900/60 lg:inline-flex">
              {getCategoryLabel(node.category)}
            </span>
          )}
          {node.contentGenerated && !compact && (
            <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/50">
              已生成
            </span>
          )}
        </Link>
      </div>
      {hasChildren && isExpanded && (
        <ul className="ml-3 border-l border-sky-200/80 pl-4 dark:border-sky-900/60">
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              expanded={expanded}
              onToggle={onToggle}
              activeId={activeId}
              compact={compact}
              depth={depth + 1}
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

async function getKnowledgeTree() {
  const now = Date.now()
  if (knowledgeTreeCache && knowledgeTreeCache.expiresAt > now) {
    return knowledgeTreeCache.data
  }

  if (!knowledgeTreeRequest) {
    knowledgeTreeRequest = fetch('/api/knowledge')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch knowledge tree')
        return r.json() as Promise<TreeNode[]>
      })
      .then((data) => {
        knowledgeTreeCache = {
          data,
          expiresAt: Date.now() + KNOWLEDGE_TREE_CACHE_TTL_MS,
        }
        return data
      })
      .finally(() => {
        knowledgeTreeRequest = null
      })
  }

  return knowledgeTreeRequest
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
    let cancelled = false

    getKnowledgeTree()
      .then((data: TreeNode[]) => {
        if (cancelled) return
        const localTree = applyLocalContentState(data)
        setTree(localTree)
        setExpanded(new Set())
      })
      .catch(() => {
        if (!cancelled) setTree([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
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
        <svg className="h-5 w-5 animate-spin text-sky-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  const stats = countNodes(tree)

  return (
    <nav className="space-y-4">
      {!compact && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-sky-100 bg-white/65 p-3 dark:border-sky-900/50 dark:bg-slate-900/40">
            <div className="text-lg font-semibold text-sky-700 dark:text-sky-200">{stats.total}</div>
            <div className="mt-0.5 text-xs text-slate-500 dark:text-sky-100/60">知识点</div>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white/65 p-3 dark:border-emerald-900/50 dark:bg-slate-900/40">
            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-300">{stats.generated}</div>
            <div className="mt-0.5 text-xs text-slate-500 dark:text-sky-100/60">已缓存</div>
          </div>
        </div>
      )}
      <ul className="space-y-1">
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
      {tree.length === 0 && (
        <div className="rounded-xl border border-sky-100 bg-white/65 py-8 text-center text-sm text-slate-500 dark:border-sky-900/50 dark:bg-slate-900/40 dark:text-sky-100/70">
          暂无知识目录
        </div>
      )}
    </nav>
  )
}
