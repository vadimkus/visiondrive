'use client'

import Section from '../../common/Section'
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { analyticsTranslations } from '../../../translations/analytics'

export default function DashboardPreview() {
  const { language } = useLanguage()
  const t = analyticsTranslations[language]
  const icons = [BarChart3, TrendingUp, Users, Clock]
  const values = ['92%', '+38%', '50K+', '1.8 min']
  
  return (
    <Section id="dashboard" background="gray">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto">
        {t.dashboard.items.map((item, index) => {
          const Icon = icons[index]
          return (
            <div key={index} className="text-center">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 mx-auto mb-2" />
              <div className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{values[index]}</div>
              <div className="text-xs font-semibold text-gray-900 mb-0.5" dir={language === 'ar' ? 'rtl' : 'ltr'}>{item.label}</div>
              <div className="text-xs text-gray-500" dir={language === 'ar' ? 'rtl' : 'ltr'}>{item.description}</div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

