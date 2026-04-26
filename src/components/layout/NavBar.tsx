'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: '首页' },
  { href: '/knowledge', label: '知识点' },
  { href: '/exam', label: '真题模拟' },
  { href: '/writing', label: '作文练习' },
]

export function NavBar() {
  const pathname = usePathname()
  const settingsActive = pathname.startsWith('/settings')

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-sky-200/70 bg-sky-50/80 shadow-sm shadow-sky-500/10 backdrop-blur-xl dark:border-sky-900/50 dark:bg-zinc-950/75 dark:shadow-sky-950/20">
        <nav className="mx-auto flex max-w-4xl items-center gap-1 px-4 py-2 sm:px-6">
          <Link
            href="/"
            className="mr-4 bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 bg-clip-text text-sm font-extrabold text-transparent dark:from-sky-300 dark:via-blue-300 dark:to-cyan-300"
          >
            贵州中考英语
          </Link>
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-sm shadow-sky-500/20 dark:from-sky-500 dark:to-cyan-500 dark:text-white'
                    : 'text-slate-600 hover:bg-white/80 hover:text-sky-700 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-sky-200'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </header>
      <Link
        href="/settings"
        aria-label="模型配置"
        className={`fixed bottom-[8%] left-6 z-40 flex h-9 w-9 items-center justify-center rounded-full border shadow-lg backdrop-blur transition-colors ${
          settingsActive
            ? 'border-sky-300 bg-sky-100 text-sky-700 shadow-sky-500/20 dark:border-sky-700 dark:bg-sky-900/40 dark:text-sky-200'
            : 'border-sky-200/80 bg-white/90 text-sky-700 shadow-sky-500/10 hover:bg-sky-50 hover:text-sky-800 dark:border-sky-900/70 dark:bg-zinc-900/90 dark:text-sky-200 dark:hover:bg-sky-950/40 dark:hover:text-sky-100'
        }`}
      >
        <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
          <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.05.05a2.1 2.1 0 0 1-2.97 2.97l-.05-.05a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.09 1.65V21a2.1 2.1 0 0 1-4.2 0v-.08a1.8 1.8 0 0 0-1.09-1.65 1.8 1.8 0 0 0-1.98.36l-.05.05a2.1 2.1 0 0 1-2.97-2.97l.05-.05A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-1.65-1.09H3a2.1 2.1 0 0 1 0-4.2h.08A1.8 1.8 0 0 0 4.73 8.6a1.8 1.8 0 0 0-.36-1.98l-.05-.05A2.1 2.1 0 0 1 7.3 3.6l.05.05a1.8 1.8 0 0 0 1.98.36A1.8 1.8 0 0 0 10.42 2.4V2a2.1 2.1 0 0 1 4.2 0v.08a1.8 1.8 0 0 0 1.09 1.65 1.8 1.8 0 0 0 1.98-.36l.05-.05a2.1 2.1 0 0 1 2.97 2.97l-.05.05a1.8 1.8 0 0 0-.36 1.98 1.8 1.8 0 0 0 1.65 1.09H22a2.1 2.1 0 0 1 0 4.2h-.08A1.8 1.8 0 0 0 19.4 15Z" />
        </svg>
      </Link>
    </>
  )
}
