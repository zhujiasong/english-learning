import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { SettingsProvider } from '@/lib/store/settings'
import { NavBar } from '@/components/layout/NavBar'
import { GlobalSelectionToolbar } from '@/components/ai/SelectionToolbar'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '贵州中考英语AI辅导',
  description: 'AI驱动的贵州中考英语一对一辅导平台',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex h-full flex-col bg-zinc-50 dark:bg-zinc-950">
        <SettingsProvider>
          <NavBar />
          <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
            {children}
          </main>
          <GlobalSelectionToolbar />
        </SettingsProvider>
      </body>
    </html>
  )
}
