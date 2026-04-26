import type { AIProvider, ChatCompletionParams } from './types'

async function chatCompletion(
  params: ChatCompletionParams
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch(
    'https://api.deepseek.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.apiKey}`,
      },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        stream: params.stream !== false,
        temperature: params.temperature ?? 0.7,
        ...(params.maxTokens ? { max_tokens: params.maxTokens } : {}),
      }),
    }
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`DeepSeek API 错误: ${response.status} ${text}`)
  }

  if (!response.body) throw new Error('Response body is empty')
  return response.body
}

export function createDeepSeekProvider(): AIProvider {
  return {
    config: {
      id: 'deepseek',
      name: 'DeepSeek',
      models: [
        { id: 'deepseek-v4-flash', name: 'DeepSeek-V4-Flash' },
        { id: 'deepseek-v4-pro', name: 'DeepSeek-V4-Pro' },
        { id: 'deepseek-chat', name: 'DeepSeek-Chat（即将弃用）' },
        { id: 'deepseek-reasoner', name: 'DeepSeek-Reasoner（即将弃用）' },
      ],
      baseURL: 'https://api.deepseek.com',
    },
    supportsTTS: false,
    chatCompletion,
  }
}
