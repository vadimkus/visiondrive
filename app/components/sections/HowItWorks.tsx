'use client'

import Section from '../common/Section'
import { Wifi, MapPin, Smartphone } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { commonTranslations } from '../../translations/common'

export default function HowItWorks() {
  const { language } = useLanguage()
  const t = commonTranslations[language]
  const icons = [Wifi, MapPin, Smartphone]
  
  return (
    <Section id="how-it-works">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t.howItWorks.title}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 max-w-3xl mx-auto">
        {t.howItWorks.steps.map((step, stepIdx) => {
          const Icon = icons[stepIdx]
          return (
            <div key={`howit-${step.title.slice(0, 15)}`} className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-600 rounded-full flex items-center justify-center text-white mx-auto mb-3 sm:mb-4">
                <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {step.title}
              </h3>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
