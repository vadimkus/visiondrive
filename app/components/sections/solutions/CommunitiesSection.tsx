'use client'

import Section from '../../common/Section'
import { TrendingUp, Users, DollarSign } from 'lucide-react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { solutionsTranslations } from '../../../translations/solutions'

export default function CommunitiesSection() {
  const { language } = useLanguage()
  const t = solutionsTranslations[language]
  const icons = [TrendingUp, Users, DollarSign]
  
  return (
    <Section id="communities" background="gray">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t.commercial.title}
        </h2>
        <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t.commercial.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto">
        {t.commercial.items.map((feature, featureIdx) => {
          const Icon = icons[featureIdx]
          return (
            <div key={`comm-${feature.title.slice(0, 15)}`} className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>{feature.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>{feature.description}</p>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

