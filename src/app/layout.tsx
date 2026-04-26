import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { SettingsProvider } from '@/lib/store/settings'
import { NavBar } from '@/components/layout/NavBar'
import { GlobalSelectionToolbar } from '@/components/ai/SelectionToolbar'
import { GlobalAIPanelProvider } from '@/components/ai/GlobalAIPanel'

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
      <body className="flex h-full flex-col bg-[linear-gradient(135deg,#e0f2fe_0%,#f0f9ff_34%,#dbeafe_68%,#ecfeff_100%)] text-slate-900 dark:bg-[linear-gradient(135deg,#082f49_0%,#0f172a_45%,#164e63_100%)] dark:text-slate-100">
        <SettingsProvider>
          <GlobalAIPanelProvider>
            <NavBar />
            <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
              {children}
            </main>
            <GlobalSelectionToolbar />
          </GlobalAIPanelProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}
