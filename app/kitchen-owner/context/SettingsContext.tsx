'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SettingsContextType {
  manualEditEnabled: boolean
  setManualEditEnabled: (enabled: boolean) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [manualEditEnabled, setManualEditEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('manualEditEnabled')
      return saved === 'true'
    }
    return false
  })

  const setManualEditEnabled = (enabled: boolean) => {
    setManualEditEnabledState(enabled)
    if (typeof window !== 'undefined') {
      localStorage.setItem('manualEditEnabled', String(enabled))
    }
  }

  return (
    <SettingsContext.Provider value={{ manualEditEnabled, setManualEditEnabled }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
