'use client'

import Section from '../../common/Section'
import { CheckCircle } from 'lucide-react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { analyticsTranslations } from '../../../translations/analytics'

export default function DataSecurity() {
  const { language } = useLanguage()
  const t = analyticsTranslations[language]
  
  return (
    <Section id="security">
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-3xl mx-auto px-2">
        {t.security.features.map((feature, index) => (
          <div key={index} className={`flex items-center ${language === 'ar' ? 'flex-row-reverse space-x-reverse' : 'space-x-2'}`}>
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>{feature}</span>
          </div>
        ))}
      </div>
    </Section>
  )
}

