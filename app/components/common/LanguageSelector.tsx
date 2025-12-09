'use client'

import { useLanguage } from '../../contexts/LanguageContext'
import { useState } from 'react'

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'en' as const, display: 'EN' },
    { code: 'ar' as const, display: 'AR' },
  ]

  const currentLang = languages.find(lang => lang.code === language) || languages[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors rounded-lg hover:bg-gray-50"
        aria-label="Select language"
      >
        <span className={language === 'en' ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}>
          {currentLang.display}
        </span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code)
                  setIsOpen(false)
                }}
                className={`w-full text-center px-4 py-2 text-sm font-medium transition-colors ${
                  language === lang.code
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {lang.display}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

