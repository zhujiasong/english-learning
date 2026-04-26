'use client'

import { useRouter } from 'next/navigation'

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
}

export function BackButton({ href, label = '返回', className = '' }: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <button
      onClick={handleClick}
      className={[
        'mb-4 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/65 px-3.5 py-2 text-sm font-medium text-sky-700 shadow-sm shadow-sky-500/5 transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-900 dark:border-sky-900/60 dark:bg-slate-900/45 dark:text-sky-200 dark:hover:bg-sky-950/35 dark:hover:text-sky-100',
        className,
      ].filter(Boolean).join(' ')}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  )
}
