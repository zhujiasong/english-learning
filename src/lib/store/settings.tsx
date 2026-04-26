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
    try {
      const stored = localStorage.getItem('ai-settings')
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }))
      }
    } catch {
      // Some mobile browsers or embedded webviews can block localStorage.
    }
  }, [])

  const updateSettings = useCallback((partial: Partial<AISettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial }
      try {
        localStorage.setItem('ai-settings', JSON.stringify(next))
      } catch {
        // Keep the in-memory settings usable even if persistence is blocked.
      }
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
