'use client'

import Section from '../../common/Section'
import { Radio, Wifi } from 'lucide-react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { solutionsTranslations } from '../../../translations/solutions'

export default function TechnologyDeepDive() {
  const { language } = useLanguage()
  const t = solutionsTranslations[language]
  
  return (
    <Section id="technology" background="gray">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t.technology.title}
        </h2>
        <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t.technology.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 max-w-3xl mx-auto">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Radio className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>{t.technology.sensors}</h3>
          <p className="text-sm text-gray-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>{t.technology.sensorsDesc}</p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Wifi className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>{t.technology.gateway}</h3>
          <p className="text-sm text-gray-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>{t.technology.gatewayDesc}</p>
        </div>
      </div>
    </Section>
  )
}

