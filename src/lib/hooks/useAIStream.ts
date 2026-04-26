'use client'

import { useCallback } from 'react'
import { useSettings } from '@/lib/store/settings'
import { createProvider, parseSSEChunk } from '@/lib/ai'
import type { ChatMessage } from '@/lib/ai'

export function useAIStream() {
  const { settings } = useSettings()

  const streamChat = useCallback(
    async (
      messages: ChatMessage[],
      onChunk: (text: string) => void
    ): Promise<string> => {
      if (!settings.provider || !settings.model || !settings.apiKey) {
        throw new Error('请先在设置中配置AI模型')
      }

      const provider = createProvider(settings.provider)
      const stream = await provider.chatCompletion({
        model: settings.model,
        messages,
        apiKey: settings.apiKey,
        stream: true,
      })

      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const content = parseSSEChunk(chunk)
        if (content) {
          fullText += content
          onChunk(content)
        }
      }

      return fullText
    },
    [settings]
  )

  const chat = useCallback(
    async (messages: ChatMessage[]): Promise<string> => {
      if (!settings.provider || !settings.model || !settings.apiKey) {
        throw new Error('请先在设置中配置AI模型')
      }

      const provider = createProvider(settings.provider)
      const stream = await provider.chatCompletion({
        model: settings.model,
        messages,
        apiKey: settings.apiKey,
        stream: false,
        temperature: 0.3,
        maxTokens: 4096,
      })

      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })
      }

      try {
        const parsed = JSON.parse(fullText)
        return parsed.choices?.[0]?.message?.content || fullText
      } catch {
        return fullText
      }
    },
    [settings]
  )

  return { streamChat, chat }
}
