'use client'

import Section from '../common/Section'
import { CheckCircle } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { commonTranslations } from '../../translations/common'

export default function TrustIndicators() {
  const { language } = useLanguage()
  const t = commonTranslations[language]
  
  return (
    <Section id="trust">
      <div className="max-w-2xl mx-auto px-2">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          {t.trust.items.map((cert, index) => (
            <div key={index} className={`flex items-center ${language === 'ar' ? 'flex-row-reverse space-x-reverse' : 'space-x-2'}`}>
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>{cert}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

