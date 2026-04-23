'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  CLINIC_LOCALE_STORAGE,
  type ClinicLocale,
  type ClinicStrings,
  clinicStrings,
} from '@/lib/clinic/strings'

type Ctx = {
  locale: ClinicLocale
  setLocale: (l: ClinicLocale) => void
  t: ClinicStrings
}

const ClinicLocaleContext = createContext<Ctx | null>(null)

function readStoredLocale(): ClinicLocale {
  if (typeof window === 'undefined') return 'en'
  const v = window.localStorage.getItem(CLINIC_LOCALE_STORAGE)
  return v === 'ar' ? 'ar' : 'en'
}

export function ClinicLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<ClinicLocale>('en')

  useEffect(() => {
    setLocaleState(readStoredLocale())
  }, [])

  const setLocale = useCallback((l: ClinicLocale) => {
    setLocaleState(l)
    try {
      window.localStorage.setItem(CLINIC_LOCALE_STORAGE, l)
    } catch {
      /* ignore */
    }
  }, [])

  const t = useMemo(() => clinicStrings(locale), [locale])

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <ClinicLocaleContext.Provider value={value}>{children}</ClinicLocaleContext.Provider>
}

export function useClinicLocale(): Ctx {
  const ctx = useContext(ClinicLocaleContext)
  if (!ctx) {
    throw new Error('useClinicLocale must be used under ClinicLocaleProvider')
  }
  return ctx
}
