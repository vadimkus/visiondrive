'use client'

import Section from '../../common/Section'
import { Shield, Clock, Heart } from 'lucide-react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { appTranslations } from '../../../translations/app'

export default function UserBenefits() {
  const { language } = useLanguage()
  const t = appTranslations[language]
  const icons = [Shield, Clock, Heart]
  
  return (
    <Section id="benefits">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto">
        {t.benefits.items.map((benefit, benefitIdx) => {
          const Icon = icons[benefitIdx]
          return (
            <div key={`ub-${benefit.title.slice(0, 15)}`} className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>{benefit.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>{benefit.description}</p>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

