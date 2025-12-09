'use client'

import Section from '../../common/Section'
import { Building2, DollarSign, TrendingUp } from 'lucide-react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { analyticsTranslations } from '../../../translations/analytics'

export default function BusinessIntelligence() {
  const { language } = useLanguage()
  const t = analyticsTranslations[language]
  const icons = [Building2, DollarSign, TrendingUp]
  
  return (
    <Section id="business-intelligence">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto">
        {t.intelligence.items.map((item, index) => {
          const Icon = icons[index]
          return (
            <div key={index} className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>{item.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>{item.description}</p>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

