'use client'

import Section from '../../common/Section'
import { Target, Lightbulb, Heart, Zap } from 'lucide-react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { aboutTranslations } from '../../../translations/about'

export default function VisionMission() {
  const { language } = useLanguage()
  const t = aboutTranslations[language]
  const icons = [Lightbulb, Target, Heart, Zap]
  
  return (
    <Section id="vision-mission" background="gray">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-3xl mx-auto">
        {t.values.items.map((value, vmIdx) => {
          const Icon = icons[vmIdx]
          return (
            <div key={`vm-${value.title.slice(0, 15)}`} className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>{value.title}</h3>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

