'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSettings } from '@/lib/store/settings'
import { createProvider } from '@/lib/ai'
import { buildKnowledgeExamplesPrompt, buildKnowledgePrompt } from '@/lib/prompts/knowledge'
import { Loading } from '@/components/ui/Loading'
import { SelectionToolbar } from '@/components/ai/SelectionToolbar'
import { useGlobalAIPanel } from '@/components/ai/GlobalAIPanel'
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer'
import {
  getCachedKnowledgeContent,
  setCachedKnowledgeContent,
} from '@/lib/cache/knowledgeContent'

interface KnowledgeNode {
  id: string
  title: string
  category: string
  content: string | null
  contentGenerated: boolean
  updatedAt: string
  parent?: { title: string } | null
}

export function KnowledgeContent({ id }: { id: string }) {
  const { settings } = useSettings()
  const { ask } = useGlobalAIPanel()
  const [node, setNode] = useState<KnowledgeNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [generatedExamples, setGeneratedExamples] = useState('')
  const [generatingExamples, setGeneratingExamples] = useState(false)
  const [examplesError, setExamplesError] = useState('')
  const [promptTarget, setPromptTarget] = useState<'content' | 'examples' | null>(null)
  const [customPrompt, setCustomPrompt] = useState('')

  const fetchNode = useCallback(async () => {
    setLoading(true)
    setGeneratedExamples('')
    setExamplesError('')
    try {
      const res = await fetch(`/api/knowledge/${id}`)
      const data = await res.json()
      const cachedContent = getCachedKnowledgeContent(data.id, data.updatedAt)
      setNode({
        ...data,
        content: cachedContent,
        contentGenerated: Boolean(cachedContent),
      })
    } catch {
      setNode(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  const generateContent = useCallback(async (userPrompt = '') => {
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
              node.parent?.title,
              userPrompt
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

      setCachedKnowledgeContent(node.id, node.updatedAt, content)
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

  const generateExamples = useCallback(async (userPrompt = '') => {
    if (!node) return

    if (!settings.provider || !settings.model || !settings.apiKey) {
      setExamplesError('请先在设置中配置AI模型和 API Key')
      return
    }

    setGeneratingExamples(true)
    setExamplesError('')

    try {
      const provider = createProvider(settings.provider)
      const stream = await provider.chatCompletion({
        model: settings.model,
        messages: [
          {
            role: 'user',
            content: buildKnowledgeExamplesPrompt(
              node.title,
              node.category,
              node.parent?.title,
              node.content,
              userPrompt
            ),
          },
        ],
        apiKey: settings.apiKey,
        stream: false,
        temperature: 0.95,
        maxTokens: 2400,
      })

      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let rawText = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        rawText += decoder.decode(value, { stream: true })
      }

      try {
        const parsed = JSON.parse(rawText)
        setGeneratedExamples(parsed.choices?.[0]?.message?.content || rawText)
      } catch {
        setGeneratedExamples(rawText)
      }
    } catch (err) {
      setExamplesError(err instanceof Error ? err.message : '例题生成失败')
    } finally {
      setGeneratingExamples(false)
    }
  }, [node, settings])

  const handleQuestion = useCallback((text: string) => {
    const questionPrompt = `学生选中了以下文本，请用中文解释其含义和用法，适合贵州初中生理解。如果包含语法点，请一并讲解。

选中文本：
"${text}"

请用简洁的语言解释，控制在200字以内。`
    ask(questionPrompt, { title: 'AI 解答' })
  }, [ask])

  const openPromptBox = (target: 'content' | 'examples') => {
    setPromptTarget(target)
    setCustomPrompt('')
  }

  const submitCustomPrompt = async () => {
    const prompt = customPrompt.trim()
    if (promptTarget === 'content') {
      await generateContent(prompt)
    } else if (promptTarget === 'examples') {
      await generateExamples(prompt)
    }
    setPromptTarget(null)
    setCustomPrompt('')
  }

  if (loading) {
    return <Loading text="加载知识点..." />
  }

  if (!node) {
    return (
      <div className="py-12 text-center text-zinc-500">知识点不存在</div>
    )
  }


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
            onClick={() => generateContent()}
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
          hideAnswerSections
        />
      )}

      {generatedExamples && (
        <div className="mt-8 rounded-lg border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
          <MarkdownRenderer
            content={generatedExamples}
            className="knowledge-content max-w-none text-sm leading-relaxed"
            hideAnswerSections
          />
        </div>
      )}

      {examplesError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {examplesError}
        </div>
      )}


      {node.content && (
        <div className="relative mt-6 flex flex-wrap items-center gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-700">
  
        {promptTarget && (
          <div role="dialog"
            aria-modal="false"
            className="absolute bottom-full left-0 z-50 mb-3 w-[min(32rem,calc(100vw-2rem))] rounded-lg border border-zinc-200 bg-white p-4 shadow-2xl ring-1 ring-black/5 dark:border-zinc-700 dark:bg-zinc-900">
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {promptTarget === 'content' ? '重新生成讲解要求' : '重新生成例题要求'}
            </label>
            <textarea
              value={customPrompt}
              onChange={(event) => setCustomPrompt(event.target.value)}
              rows={4}
              autoFocus
              placeholder={
                promptTarget === 'content'
                  ? '例如：讲解更适合基础薄弱学生，多举生活化例句。留空则按默认要求生成。'
                  : '例如：题目偏贵州中考真题风格，重点考易错点，解析更详细。留空则按默认要求生成。'
              }
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={submitCustomPrompt}
                disabled={generating || generatingExamples}
                className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:from-blue-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {promptTarget === 'content'
                  ? generating ? '正在生成讲解...' : '生成讲解'
                  : generatingExamples ? '正在生成例题...' : '生成例题'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPromptTarget(null)
                  setCustomPrompt('')
                }}
                disabled={generating || generatingExamples}
                className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                取消
              </button>
            </div>
          </div>
        )}
          {node.contentGenerated && (
            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs text-green-600 dark:bg-green-900/20 dark:text-green-400">
              已缓存
            </span>
          )}
          <button
            onClick={() => openPromptBox('examples')}
            disabled={generatingExamples || generating}
            className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:from-blue-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generatingExamples ? '正在生成例题...' : '重新生成例题'}
          </button>
          {node.contentGenerated && (
            <button
              onClick={() => {
                setGenerateError('')
                openPromptBox('content')
              }}
              disabled={generating || generatingExamples}
              className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-medium text-purple-700 shadow-sm transition-colors hover:border-purple-300 hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-purple-800/70 dark:bg-purple-900/30 dark:text-purple-200 dark:hover:bg-purple-900/50"
            >
              重新生成讲解
            </button>
          )}
        </div>
      )}


    </div>
  )
}
