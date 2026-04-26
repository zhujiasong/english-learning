import type { AIProvider, ChatCompletionParams } from './types'

function parseSSEChunk(text: string): string {
  let result = ''
  const lines = text.split('\n')
  for (const line of lines) {
    if (!line.startsWith('data: ')) continue
    const data = line.slice(6).trim()
    if (!data || data === '[DONE]') continue
    try {
      const parsed = JSON.parse(data)
      const content = parsed.choices?.[0]?.delta?.content
      if (content) result += content
    } catch {
      // ignore parse errors for incomplete chunks
    }
  }
  return result
}

async function chatCompletion(
  params: ChatCompletionParams
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch(
    'https://open.bigmodel.cn/api/paas/v4/chat/completions',
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
    throw new Error(`智谱 API 错误: ${response.status} ${text}`)
  }

  if (!response.body) throw new Error('Response body is empty')
  return response.body
}

async function tts(text: string, apiKey: string): Promise<ArrayBuffer> {
  const response = await fetch(
    'https://open.bigmodel.cn/api/paas/v4/audio/speech',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'cogview-3-flash',
        input: text,
        voice: 'zh-CN-XiaoxiaoNeural',
        response_format: 'mp3',
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`智谱 TTS 错误: ${response.status} ${errorText}`)
  }

  return response.arrayBuffer()
}

export function createZhipuProvider(): AIProvider {
  return {
    config: {
      id: 'zhipu',
      name: '智谱 AI',
      models: [
        { id: 'glm-4-flash', name: 'GLM-4-Flash' },
        { id: 'glm-4', name: 'GLM-4' },
        { id: 'glm-4-plus', name: 'GLM-4-Plus' },
        { id: 'glm-4-air', name: 'GLM-4-Air' },
        { id: 'glm-4-long', name: 'GLM-4-Long' },
      ],
      baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    },
    supportsTTS: true,
    chatCompletion,
    tts,
  }
}

export { parseSSEChunk }
