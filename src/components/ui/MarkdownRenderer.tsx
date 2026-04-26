'use client'

import { useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
  className?: string
  hideAnswerSections?: boolean
}

type MarkdownSegment =
  | { type: 'markdown'; content: string }
  | { type: 'answer'; content: string; index: number }

const answerStartPattern =
  /^\s*(?:[-*]\s*)?(?:\*\*)?(?:正确答案|参考答案|答案解析|详细解析|答案|解析)(?:\*\*)?\s*[:：]/
const answerHeadingPattern =
  /^\s*#{1,6}\s*(?:正确答案|参考答案|答案解析|详细解析|答案|解析)\s*$/
const nextQuestionPattern =
  /^(?:(?:第\s*)?[\d一二三四五六七八九十]+\s*[题.、)]|例题\s*[\d一二三四五六七八九十]+|题目\s*[\d一二三四五六七八九十]+|Question\s*\d+)/i


function normalizeMarkdownLine(line: string) {
  return line
    .replace(/^\s*#{1,6}\s*/, '')
    .replace(/^\s*[-*+]\s*/, '')
    .replace(/[\*_`]/g, '')
    .trim()
}

function isAnswerStartLine(line: string) {
  const normalizedLine = normalizeMarkdownLine(line)
  return answerStartPattern.test(line) ||
    answerHeadingPattern.test(line) ||
    /^(?:正确答案|参考答案|答案解析|详细解析|答案|解析)\s*[:：]/.test(normalizedLine) ||
    /^(?:正确答案|参考答案|答案解析|详细解析|答案|解析)$/.test(normalizedLine)
}

function isNextQuestionLine(line: string) {
  const normalizedLine = normalizeMarkdownLine(line)
  if (nextQuestionPattern.test(normalizedLine)) return true
  return /^#{1,6}\s+/.test(line) && !isAnswerStartLine(line)
}

function normalizeMarkdownContent(content: string) {
  return content
    .split('\n')
    .map((line) => {
      const hasTableCells = line.includes('|')
      const replacement = hasTableCells ? ' / ' : '  \n'
      return line
        .replace(/&lt;br\s*\/?&gt;/gi, replacement)
        .replace(/<br\s*\/?>/gi, replacement)
    })
    .join('\n')
}

function splitAnswerSections(content: string): MarkdownSegment[] {
  const lines = content.split('\n')
  const segments: MarkdownSegment[] = []
  let markdownBuffer: string[] = []
  let answerBuffer: string[] | null = null
  let answerIndex = 0

  const flushMarkdown = () => {
    const text = markdownBuffer.join('\n').trimEnd()
    if (text.trim()) segments.push({ type: 'markdown', content: text })
    markdownBuffer = []
  }

  const flushAnswer = () => {
    if (!answerBuffer) return
    const text = answerBuffer.join('\n').trimEnd()
    if (text.trim()) {
      answerIndex += 1
      segments.push({ type: 'answer', content: text, index: answerIndex })
    }
    answerBuffer = null
  }

  for (const line of lines) {
    const isAnswerStart = isAnswerStartLine(line)
    const isNextQuestion = isNextQuestionLine(line)

    if (answerBuffer && isNextQuestion) {
      flushAnswer()
      markdownBuffer.push(line)
      continue
    }

    if (isAnswerStart) {
      flushMarkdown()
      if (!answerBuffer) answerBuffer = []
      answerBuffer.push(line)
      continue
    }

    if (answerBuffer) {
      answerBuffer.push(line)
    } else {
      markdownBuffer.push(line)
    }
  }

  flushAnswer()
  flushMarkdown()
  return segments
}

function MarkdownBlock({ content }: { content: string }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
}

function HiddenAnswerBlock({ content, index }: { content: string; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="my-3 rounded-lg border border-sky-200 bg-sky-50/70 p-3 dark:border-sky-900/70 dark:bg-sky-950/30">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="sky-button-secondary rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
      >
        {open ? '收起答案' : `查看答案/解析${index > 1 ? ` ${index}` : ''}`}
      </button>
      {open && (
        <div className="mt-3 border-t border-sky-200 pt-3 dark:border-sky-900/70">
          <MarkdownBlock content={content} />
        </div>
      )}
    </div>
  )
}

export function MarkdownRenderer({
  content,
  className,
  hideAnswerSections = false,
}: MarkdownRendererProps) {
  const normalizedContent = useMemo(() => normalizeMarkdownContent(content), [content])
  const segments = useMemo(
    () => hideAnswerSections ? splitAnswerSections(normalizedContent) : null,
    [normalizedContent, hideAnswerSections]
  )

  return (
    <div className={['markdown-content', className].filter(Boolean).join(' ')}>
      {segments ? (
        segments.map((segment, index) =>
          segment.type === 'answer' ? (
            <HiddenAnswerBlock
              key={`${segment.type}-${segment.index}`}
              content={segment.content}
              index={segment.index}
            />
          ) : (
            <MarkdownBlock key={`${segment.type}-${index}`} content={segment.content} />
          )
        )
      ) : (
        <MarkdownBlock content={normalizedContent} />
      )}
    </div>
  )
}
