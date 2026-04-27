'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'en' | 'ar'
type PublicLanguage = 'en' | 'ru'

interface LanguageContextType {
  /**
   * Legacy content language used by older marketing sections.
   * Russian falls back to English unless a section provides RU copy.
   */
  language: Language
  publicLanguage: PublicLanguage
  setLanguage: (lang: PublicLanguage) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations: Record<Language, Record<string, string>> = {
  en: {},
  ar: {},
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [publicLanguage, setPublicLanguage] = useState<PublicLanguage>('en')
  const [isClient, setIsClient] = useState(false)
  const language: Language = 'en'

  useEffect(() => {
    setIsClient(true)
    // Load language from localStorage or default to 'en'
    const savedLang = localStorage.getItem('language')
    if (savedLang === 'en' || savedLang === 'ru') {
      setPublicLanguage(savedLang)
    } else if (savedLang === 'ar') {
      setPublicLanguage('ru')
      localStorage.setItem('language', 'ru')
    }
  }, [])

  const setLanguage = (lang: PublicLanguage) => {
    setPublicLanguage(lang)
    localStorage.setItem('language', lang)
    document.documentElement.dir = 'ltr'
    document.documentElement.lang = lang
  }

  useEffect(() => {
    if (isClient) {
      document.documentElement.dir = 'ltr'
      document.documentElement.lang = publicLanguage
    }
  }, [publicLanguage, isClient])

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, publicLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Helper to add translations
export function addTranslations(lang: Language, newTranslations: Record<string, string>) {
  translations[lang] = { ...translations[lang], ...newTranslations }
}








