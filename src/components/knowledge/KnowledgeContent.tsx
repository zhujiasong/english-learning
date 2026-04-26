'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSettings } from '@/lib/store/settings'
import { createProvider } from '@/lib/ai'
import { buildKnowledgePrompt } from '@/lib/prompts/knowledge'
import { Loading } from '@/components/ui/Loading'
import { SelectionToolbar } from '@/components/ai/SelectionToolbar'
import { AIPanel } from '@/components/ai/AIPanel'
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer'

interface KnowledgeNode {
  id: string
  title: string
  category: string
  content: string | null
  contentGenerated: boolean
  parent?: { title: string } | null
}

export function KnowledgeContent({ id }: { id: string }) {
  const { settings } = useSettings()
  const [node, setNode] = useState<KnowledgeNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [showQuestion, setShowQuestion] = useState(false)
  const [selectedText, setSelectedText] = useState('')

  const fetchNode = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/knowledge/${id}`)
      const data = await res.json()
      setNode(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  const generateContent = useCallback(async () => {
    if (!node || !settings.provider || !settings.apiKey) return

    setGenerating(true)
    setGenerateError('')

    try {
      const provider = createProvider(settings.provider)
      const stream = await provider.chatCompletion({
        model: settings.model,
        messages: [
          {
            role: 'user',
            content: buildKnowledgePrompt(
              node.title,
              node.category,
              node.parent?.title
            ),
          },
        ],
        apiKey: settings.apiKey,
        stream: false,
        temperature: 0.7,
        maxTokens: 4000,
      })

      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let rawText = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        rawText += decoder.decode(value, { stream: true })
      }

      let content = rawText
      try {
        const parsed = JSON.parse(rawText)
        content = parsed.choices?.[0]?.message?.content || rawText
      } catch {
        // Non-JSON response, use raw text
      }

      await fetch(`/api/knowledge/${node.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      setNode((prev) =>
        prev ? { ...prev, content, contentGenerated: true } : prev
      )
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : '生成失败')
    } finally {
      setGenerating(false)
    }
  }, [node, settings])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNode()
  }, [fetchNode])

  useEffect(() => {
    if (node && !node.contentGenerated && !generating && !generateError) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      generateContent()
    }
  }, [node, generating, generateError, generateContent])

  const handleQuestion = useCallback((text: string) => {
    setSelectedText(text)
    setShowQuestion(true)
  }, [])

  if (loading) {
    return <Loading text="加载知识点..." />
  }

  if (!node) {
    return (
      <div className="py-12 text-center text-zinc-500">知识点不存在</div>
    )
  }

  const questionPrompt = `学生选中了以下文本，请用中文解释其含义和用法，适合贵州初中生理解。如果包含语法点，请一并讲解。

选中文本：
"${selectedText}"

请用简洁的语言解释，控制在200字以内。`

  return (
    <div className="relative">
      <SelectionToolbar onQuestion={handleQuestion} />

      <div className="mb-6">
        <div className="text-xs text-zinc-500">
          贵州中考 · {node.category}
          {node.parent?.title && ` > ${node.parent.title}`}
        </div>
        <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {node.title}
        </h1>
      </div>

      {generating && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            AI 正在生成讲解内容...
          </div>
        </div>
      )}

      {generateError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            生成失败：{generateError}
          </p>
          <button
            onClick={generateContent}
            className="mt-2 text-sm text-red-600 underline hover:text-red-700 dark:text-red-400"
          >
            点击重试
          </button>
        </div>
      )}

      {node.content && (
        <MarkdownRenderer
          content={node.content}
          className="knowledge-content max-w-none text-sm leading-relaxed"
        />
      )}

      {node.contentGenerated && node.content && (
        <div className="mt-6 flex items-center gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-700">
          <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs text-green-600 dark:bg-green-900/20 dark:text-green-400">
            已缓存
          </span>
          <button
            onClick={() => {
              setGenerateError('')
              setNode((prev) => prev ? { ...prev, contentGenerated: false } : prev)
            }}
            className="text-xs text-zinc-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
          >
            重新生成
          </button>
        </div>
      )}

      <AIPanel
        open={showQuestion}
        onClose={() => setShowQuestion(false)}
        title="AI 解答"
        initialMessage={questionPrompt}
      />
    </div>
  )
}
