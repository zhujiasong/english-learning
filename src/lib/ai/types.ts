export interface AIModel {
  id: string
  name: string
}

export interface AIProviderConfig {
  id: string
  name: string
  models: AIModel[]
  baseURL: string
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionParams {
  model: string
  messages: ChatMessage[]
  apiKey: string
  stream?: boolean
  temperature?: number
  maxTokens?: number
}

export interface AIProvider {
  config: AIProviderConfig
  supportsTTS: boolean
  chatCompletion(params: ChatCompletionParams): Promise<ReadableStream<Uint8Array>>
  tts?(text: string, apiKey: string): Promise<ArrayBuffer>
}

