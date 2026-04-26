import type { AIProvider, AIProviderConfig } from './types'
import { createZhipuProvider } from './zhipu'
import { createDeepSeekProvider } from './deepseek'

const providerConfigs: Record<string, AIProviderConfig> = {
  zhipu: {
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
  deepseek: {
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
}

export function getProviderConfig(providerId: string): AIProviderConfig | undefined {
  return providerConfigs[providerId]
}

export function getAllProviderConfigs(): AIProviderConfig[] {
  return Object.values(providerConfigs)
}

export function createProvider(providerId: string): AIProvider {
  switch (providerId) {
    case 'zhipu':
      return createZhipuProvider()
    case 'deepseek':
      return createDeepSeekProvider()
    default:
      throw new Error(`Unknown provider: ${providerId}`)
  }
}
