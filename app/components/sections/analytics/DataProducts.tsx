'use client'

import Section from '../../common/Section'
import { BarChart3, TrendingUp, AlertTriangle, Map } from 'lucide-react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { analyticsTranslations } from '../../../translations/analytics'

export default function DataProducts() {
  const { language } = useLanguage()
  const t = analyticsTranslations[language]
  const icons = [BarChart3, TrendingUp, AlertTriangle, Map]
  
  return (
    <Section id="data-products" background="gray">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-3xl mx-auto">
        {t.products.items.map((product, index) => {
          const Icon = icons[index]
          return (
            <div key={index} className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>{product.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>{product.description}</p>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

