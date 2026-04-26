'use client'

import { useEffect, useMemo } from 'react'
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
    const nextModels = providerConfigs.find((p) => p.id === provider)?.models ?? []
    updateSettings({ provider, model: nextModels[0]?.id ?? '' })
  }

  useEffect(() => {
    const activeProvider = providerConfigs.find((p) => p.id === settings.provider)
    const nextProvider = activeProvider ?? providerConfigs[0]

    if (!nextProvider) {
      return
    }

    if (!settings.provider || !activeProvider) {
      updateSettings({
        provider: nextProvider.id,
        model: nextProvider.models[0]?.id ?? '',
      })
      return
    }

    if (nextProvider.models.length === 0) {
      return
    }

    const modelExists = nextProvider.models.some((model) => model.id === settings.model)
    if (!modelExists) {
      updateSettings({ model: nextProvider.models[0].id })
    }
  }, [settings.provider, settings.model, providerConfigs, updateSettings])

  return (
    <div className="space-y-6">
      <section className="sky-hero px-8 py-8">
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_18rem]">
          <div>
            <div className="sky-hero-kicker">Model Settings</div>
            <h1 className="sky-page-title mt-3 text-3xl font-semibold">
              模型配置
            </h1>
            <p className="sky-page-copy mt-3 max-w-2xl text-sm leading-7">
              选择 AI 提供商、模型和 API Key。配置信息只保存在当前浏览器本地，用于知识点讲解、试题点拨和作文批改。
            </p>
          </div>
          <div className="rounded-xl border border-sky-100 bg-white/70 p-4 dark:border-sky-900/50 dark:bg-slate-900/45">
            <div className="text-sm font-semibold text-sky-800 dark:text-sky-100">
              {settings.provider ? '已选择提供商' : '等待配置'}
            </div>
            <div className="mt-2 truncate text-xs text-slate-500 dark:text-sky-100/60">
              {settings.model || '请选择模型'}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,32rem)_1fr]">
        <div className="sky-card p-6">
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-sky-900 dark:text-sky-100">
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
              <label className="mb-1.5 block text-sm font-medium text-sky-900 dark:text-sky-100">
                模型
              </label>
              <Select
                key={settings.provider || 'model-empty'}
                options={modelOptions}
                value={settings.model}
                onChange={(model) => updateSettings({ model })}
                placeholder="选择模型"
                disabled={!settings.provider || modelOptions.length === 0}
              />
              {settings.provider === 'deepseek' && (
                <p className="mt-1 text-xs text-slate-400">
                  DeepSeek 不提供 TTS 语音服务，朗读功能将使用浏览器内置语音。
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-sky-900 dark:text-sky-100">
                API Key
              </label>
              <input
                type="password"
                value={settings.apiKey}
                onChange={(e) => updateSettings({ apiKey: e.target.value })}
                placeholder="输入 API Key"
                className="w-full rounded-lg border border-sky-200 bg-white/90 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 dark:border-sky-900/70 dark:bg-slate-900/80 dark:text-sky-100"
              />
              <p className="mt-1 text-xs text-slate-400">
                API Key 仅保存在本地浏览器，不会上传到服务器。
              </p>
            </div>
          </div>
        </div>

        <div className="sky-card p-6">
          <p className="text-sm font-semibold text-sky-900 dark:text-sky-100">
            如何获取 API Key？
          </p>
          <ul className="mt-4 ml-5 list-disc space-y-2 text-sm leading-6 text-slate-600 dark:text-sky-100/75">
            <li>
              智谱 AI：前往{' '}
              <a
                href="https://open.bigmodel.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-700 underline dark:text-sky-200"
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
                className="text-sky-700 underline dark:text-sky-200"
              >
                platform.deepseek.com
              </a>
              {' '}注册并获取
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}
