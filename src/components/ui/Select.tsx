'use client'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function Select({
  options,
  value,
  onChange,
  placeholder = '请选择',
  disabled = false,
  className = '',
}: SelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={[
          'min-h-11 w-full appearance-none rounded-xl border border-sky-200 bg-white/90 px-3.5 py-2.5 pr-10 text-base text-slate-900 shadow-sm transition-colors focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 disabled:cursor-not-allowed disabled:bg-sky-50/60 disabled:text-slate-400 disabled:opacity-70 sm:text-sm dark:border-sky-900/70 dark:bg-slate-900/80 dark:text-sky-100 dark:disabled:bg-slate-900/45 dark:disabled:text-sky-100/40',
          className,
        ].filter(Boolean).join(' ')}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500 dark:text-sky-300"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  )
}
