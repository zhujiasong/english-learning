import Link from 'next/link'

const sections = [
  {
    title: '知识点学习',
    description: '按贵州中考考纲划分的知识点体系，AI智能生成讲解内容，支持划线提问和翻译。',
    href: '/knowledge',
    color: 'blue',
  },
  {
    title: '真题模拟',
    description: '历年真题和模拟试卷，支持AI点拨，逐题引导思考，不直接给答案。',
    href: '/exam',
    color: 'green',
  },
  {
    title: '作文练习',
    description: 'AI深度批改：审题分析、逐句批改、结构评估、综合评分，全面提升写作能力。',
    href: '/writing',
    color: 'purple',
  },
  {
    title: '模型配置',
    description: '配置AI模型提供商（智谱/DeepSeek）、选择模型、填写API Key。',
    href: '/settings',
    color: 'zinc',
  },
]

const colorClasses: Record<string, { border: string; bg: string; text: string }> = {
  blue: {
    border: 'border-l-blue-500',
    bg: 'hover:bg-blue-50 dark:hover:bg-blue-900/10',
    text: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    border: 'border-l-green-500',
    bg: 'hover:bg-green-50 dark:hover:bg-green-900/10',
    text: 'text-green-600 dark:text-green-400',
  },
  purple: {
    border: 'border-l-purple-500',
    bg: 'hover:bg-purple-50 dark:hover:bg-purple-900/10',
    text: 'text-purple-600 dark:text-purple-400',
  },
  zinc: {
    border: 'border-l-zinc-400',
    bg: 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
    text: 'text-zinc-600 dark:text-zinc-400',
  },
}

export default function Home() {
  return (
    <div>
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          贵州中考英语 AI 辅导
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          像一对一老师那样辅导你，随时随地提问，AI精准讲解。
          覆盖贵州中考全部考点，不超纲、不遗漏。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => {
          const colors = colorClasses[section.color]
          return (
            <Link
              key={section.href}
              href={section.href}
              className={`group rounded-lg border border-zinc-200 bg-white p-5 transition-all ${colors.border} border-l-4 ${colors.bg} dark:border-zinc-800 dark:bg-zinc-900`}
            >
              <h2
                className={`mb-1.5 text-base font-semibold ${colors.text}`}
              >
                {section.title}
              </h2>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {section.description}
              </p>
            </Link>
          )
        })}
      </div>

      <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          快速开始
        </h2>
        <ol className="ml-5 list-decimal space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
          <li>前往「模型配置」选择AI提供商并填写API Key</li>
          <li>进入「知识点学习」选择需要复习的章节，AI将生成详细讲解</li>
          <li>在「真题模拟」中做题，遇到困难使用「AI点拨」获得引导</li>
          <li>在「作文练习」中提交作文，获取AI深度批改</li>
        </ol>
      </div>
    </div>
  )
}
