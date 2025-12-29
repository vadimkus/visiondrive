'use client'

import Section from '../common/Section'
import { Clock, MapPin, Shield, Zap } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { commonTranslations } from '../../translations/common'

export default function CoreValue() {
  const { language } = useLanguage()
  const t = commonTranslations[language]
  const icons = [Clock, MapPin, Shield, Zap]
  
  return (
    <Section id="value" background="gray">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
        {t.coreValue.items.map((benefit, benefitIdx) => {
          const Icon = icons[benefitIdx]
          return (
            <div key={`benefit-${benefit.title.slice(0, 15)}`} className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {benefit.title}
              </h3>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
