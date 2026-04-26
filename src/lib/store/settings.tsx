'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

export interface AISettings {
  provider: string
  model: string
  apiKey: string
}

interface SettingsContextType {
  settings: AISettings
  updateSettings: (partial: Partial<AISettings>) => void
}

const defaultSettings: AISettings = {
  provider: '',
  model: '',
  apiKey: '',
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
})

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AISettings>(defaultSettings)

  useEffect(() => {
    const stored = localStorage.getItem('ai-settings')
    if (stored) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }))
      } catch {
        // ignore
      }
    }
  }, [])

  const updateSettings = useCallback((partial: Partial<AISettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial }
      localStorage.setItem('ai-settings', JSON.stringify(next))
      return next
    })
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
