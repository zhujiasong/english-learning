'use client'

import { useMemo } from 'react'
import { useSettings } from '@/lib/store/settings'
import { getAllProviderConfigs } from '@/lib/ai'
import { Select } from '@/components/ui/Select'

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings()
  const providerConfigs = useMemo(() => getAllProviderConfigs(), [])

  const providerOptions = useMemo(
    () => providerConfigs.map((p) => ({ value: p.id, label: p.name })),
    [providerConfigs]
  )

  const models = useMemo(
    () =>
      settings.provider
        ? (providerConfigs.find((p) => p.id === settings.provider)?.models ?? [])
        : [],
    [settings.provider, providerConfigs]
  )

  const modelOptions = useMemo(
    () => models.map((m) => ({ value: m.id, label: m.name })),
    [models]
  )

  const handleProviderChange = (provider: string) => {
    updateSettings({ provider, model: '' })
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        模型配置
      </h1>

      <div className="max-w-md space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            AI 提供商
          </label>
          <Select
            options={providerOptions}
            value={settings.provider}
            onChange={handleProviderChange}
            placeholder="选择AI提供商"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            模型
          </label>
          <Select
            options={modelOptions}
            value={settings.model}
            onChange={(model) => updateSettings({ model })}
            placeholder="选择模型"
            disabled={!settings.provider}
          />
          {settings.provider === 'deepseek' && (
            <p className="mt-1 text-xs text-zinc-400">
              DeepSeek 不提供 TTS 语音服务，朗读功能将使用浏览器内置语音。
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            API Key
          </label>
          <input
            type="password"
            value={settings.apiKey}
            onChange={(e) => updateSettings({ apiKey: e.target.value })}
            placeholder="输入 API Key"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <p className="mt-1 text-xs text-zinc-400">
            API Key 仅保存在本地浏览器，不会上传到服务器。
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            如何获取 API Key？
          </p>
          <ul className="mt-2 ml-5 list-disc space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
            <li>
              智谱 AI：前往{' '}
              <a
                href="https://open.bigmodel.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline dark:text-blue-400"
              >
                open.bigmodel.cn
              </a>
              {' '}注册并获取
            </li>
            <li>
              DeepSeek：前往{' '}
              <a
                href="https://platform.deepseek.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline dark:text-blue-400"
              >
                platform.deepseek.com
              </a>
              {' '}注册并获取
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
