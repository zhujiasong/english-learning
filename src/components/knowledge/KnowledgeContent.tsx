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
      <div className="sky-card py-12 text-center text-sm text-slate-500 dark:text-sky-100/70">知识点不存在</div>
    )
  }


  return (
    <div className="relative space-y-6">
      <SelectionToolbar onQuestion={handleQuestion} />

      <section className="sky-hero px-8 py-7">
        <div className="sky-hero-kicker">
          贵州中考 · {node.category}
          {node.parent?.title && ` > ${node.parent.title}`}
        </div>
        <h1 className="sky-page-title mt-3 text-3xl font-semibold">
          {node.title}
        </h1>
        <p className="sky-page-copy mt-3 max-w-2xl text-sm leading-7">
          AI 会围绕该知识点生成讲解、例题和易错提醒。正文中的任意内容都可以划线提问、翻译或朗读。
        </p>
      </section>

      {generating && (
        <div className="sky-card p-4">
          <div className="flex items-center gap-2 text-sm text-sky-700 dark:text-sky-200">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            AI 正在生成讲解内容...
          </div>
        </div>
      )}

      {generateError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/85 p-4 dark:border-rose-900/60 dark:bg-rose-950/25">
          <p className="text-sm text-rose-600 dark:text-rose-300">
            生成失败：{generateError}
          </p>
          <button
            onClick={() => generateContent()}
            className="mt-3 rounded-full border border-rose-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/35 dark:text-rose-300 dark:hover:bg-rose-950/55"
          >
            点击重试
          </button>
        </div>
      )}

      {node.content && (
        <section className="sky-card p-6">
          <MarkdownRenderer
            content={node.content}
            className="knowledge-content max-w-none text-sm leading-relaxed"
            hideAnswerSections
          />
        </section>
      )}

      {generatedExamples && (
        <section className="sky-card p-6">
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-200">
            New Examples
          </div>
          <MarkdownRenderer
            content={generatedExamples}
            className="knowledge-content max-w-none text-sm leading-relaxed"
            hideAnswerSections
          />
        </section>
      )}

      {examplesError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/85 p-4 text-sm text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/25 dark:text-rose-300">
          {examplesError}
        </div>
      )}


      {node.content && (
        <div className="sky-card relative flex flex-wrap items-center gap-3 p-4">
  
        {promptTarget && (
          <div role="dialog"
            aria-modal="false"
            className="sky-floating absolute bottom-full left-0 z-50 mb-3 w-[min(34rem,calc(100vw-2rem))] p-4">
            <label className="sky-floating-title mb-2 block">
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
              className="w-full rounded-lg border border-sky-200 bg-white/90 px-3 py-2 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 dark:border-sky-900/70 dark:bg-slate-900/80 dark:text-sky-100"
            />
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={submitCustomPrompt}
                disabled={generating || generatingExamples}
                className="sky-button-primary rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
                className="sky-button-secondary rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                取消
              </button>
            </div>
          </div>
        )}
          {node.contentGenerated && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
              已缓存
            </span>
          )}
          <button
            onClick={() => openPromptBox('examples')}
            disabled={generatingExamples || generating}
            className="sky-button-primary rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
              className="sky-button-secondary rounded-lg px-3 py-2 text-xs font-medium shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              重新生成讲解
            </button>
          )}
        </div>
      )}


    </div>
  )
}
