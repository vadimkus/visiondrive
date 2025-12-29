'use client'

import Section from '../../common/Section'
import { Map, Calendar, DollarSign, CreditCard } from 'lucide-react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { appTranslations } from '../../../translations/app'

export default function AppFeatures() {
  const { language } = useLanguage()
  const t = appTranslations[language]
  const icons = [Map, Calendar, DollarSign, CreditCard]
  
  return (
    <Section id="features" background="gray">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-3xl mx-auto">
        {t.features.items.map((feature, featureIdx) => {
          const Icon = icons[featureIdx]
          return (
            <div key={`appf-${feature.title.slice(0, 15)}`} className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>{feature.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>{feature.description}</p>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

