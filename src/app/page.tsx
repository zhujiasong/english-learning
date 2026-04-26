import Link from 'next/link'

const featureCards = [
  {
    title: '知识点学习',
    description: '按贵州中考考纲组织知识体系，AI 生成讲解、例题和易错点。',
    href: '/knowledge',
    accent: 'from-sky-500 to-cyan-400',
    meta: '考点讲解',
  },
  {
    title: '真题模拟',
    description: '历年真题和模拟试卷逐题练习，遇到卡点时使用 AI 点拨。',
    href: '/exam',
    accent: 'from-blue-500 to-sky-400',
    meta: '题目训练',
  },
  {
    title: '作文练习',
    description: '围绕中考写作任务进行审题、结构、句式和表达批改。',
    href: '/writing',
    accent: 'from-cyan-500 to-teal-400',
    meta: '写作提升',
  },
  {
    title: '每日巩固',
    description: '日常回顾所学习的内容，温故知新，加深记忆和理解。',
    href: '#',
    accent: 'from-indigo-400 to-cyan-400',
    meta: '复习任务',
  },
]

const workflow = [
  '选择贵州中考英语知识点',
  'AI 生成适合初中生的讲解',
  '划线提问、翻译、朗读',
  '用例题和真题巩固掌握',
]

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-sky-200/80 bg-white/70 px-8 py-10 shadow-[0_30px_80px_-45px_rgba(2,132,199,0.65)] backdrop-blur-xl dark:border-sky-900/50 dark:bg-slate-950/55">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500" />
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_22rem]">
          <div>
            <div className="mb-5 inline-flex items-center rounded-full border border-sky-200 bg-sky-50/80 px-3 py-1 text-xs font-medium text-sky-700 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200">
              贵州中考英语 · AI 一对一学习工具
            </div>
            <h1 className="sky-page-title max-w-2xl text-4xl font-semibold leading-tight">
              面向贵州中考考情的英语 AI 辅导
            </h1>
            <p className="sky-page-copy mt-4 max-w-2xl text-base leading-8">
              围绕初中生能理解的表达方式生成讲解、例题和解析。遇到不懂的地方，直接划线提问、翻译或朗读，把复习过程变成持续互动。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/knowledge"
                className="sky-button-primary rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
              >
                开始学习知识点
              </Link>
              <Link
                href="/settings"
                className="sky-button-secondary rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
              >
                配置 AI 模型
              </Link>
            </div>
          </div>

          <div className="sky-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-700 dark:text-sky-200">
                AI 学习引擎
              </span>
              <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-medium text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-200">
                实时辅助
              </span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border border-sky-100 bg-white/75 p-3 dark:border-sky-900/50 dark:bg-slate-900/60">
                <div className="text-xs text-slate-500 dark:text-sky-100/60">输入</div>
                <div className="mt-1 font-medium text-slate-800 dark:text-sky-100">
                  现在完成时怎么考？
                </div>
              </div>
              <div className="rounded-lg border border-cyan-100 bg-cyan-50/70 p-3 dark:border-cyan-900/50 dark:bg-cyan-950/30">
                <div className="text-xs text-cyan-700 dark:text-cyan-200">输出</div>
                <div className="mt-1 leading-6 text-slate-700 dark:text-sky-100/85">
                  规则讲解 · 易错点 · 贵州中考难度例题 · 答案解析
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="sky-page-title text-xl font-semibold">学习入口</h2>
            <p className="sky-page-copy mt-1 text-sm">选择当前要完成的学习任务。</p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          {featureCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group sky-card sky-card-hover flex min-h-48 flex-col p-5"
            >
              <div className={`mb-5 h-1.5 w-16 rounded-full bg-gradient-to-r ${card.accent}`} />
              <div className="text-xs font-medium text-sky-700/80 dark:text-sky-200/70">
                {card.meta}
              </div>
              <h3 className="mt-2 text-lg font-semibold text-slate-900 group-hover:text-sky-700 dark:text-sky-100 dark:group-hover:text-sky-200">
                {card.title}
              </h3>
              <p className="sky-page-copy mt-3 flex-1 text-sm leading-6">
                {card.description}
              </p>
              <span className="mt-5 text-sm font-medium text-sky-700 dark:text-sky-200">
                进入
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="sky-card p-6">
        <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
          <div>
            <h2 className="sky-page-title text-xl font-semibold">推荐学习路径</h2>
            <p className="sky-page-copy mt-2 text-sm leading-6">
              先理解知识点，再通过交互和题目巩固，适合日常复习和考前查漏补缺。
            </p>
          </div>
          <ol className="grid gap-3 lg:grid-cols-4">
            {workflow.map((item, index) => (
              <li key={item} className="rounded-xl border border-sky-100 bg-white/65 p-4 dark:border-sky-900/50 dark:bg-slate-900/45">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-200">
                  {index + 1}
                </div>
                <div className="text-sm font-medium leading-6 text-slate-700 dark:text-sky-100/85">
                  {item}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  )
}
