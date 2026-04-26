export function Loading({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="sky-card flex items-center justify-center gap-3 px-5 py-8 text-sm font-medium text-sky-700 dark:text-sky-200">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 ring-1 ring-sky-100 dark:bg-sky-950/50 dark:ring-sky-900/60">
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </span>
      <span>{text}</span>
    </div>
  )
}
