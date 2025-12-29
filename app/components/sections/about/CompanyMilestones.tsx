'use client'

import Section from '../../common/Section'
import { Rocket, Target, TrendingUp } from 'lucide-react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { aboutTranslations } from '../../../translations/about'

export default function CompanyMilestones() {
  const { language } = useLanguage()
  const t = aboutTranslations[language]
  const icons = [Rocket, Target, TrendingUp]
  
  return (
    <Section id="milestones" background="gray">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
        {t.milestones.items.map((milestone, milestoneIdx) => {
          const Icon = icons[milestoneIdx]
          return (
            <div key={`cm-${milestone.year}-${milestone.title.slice(0, 10)}`} className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="text-xs font-semibold text-primary-600 mb-1">{milestone.year}</div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>{milestone.title}</h3>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

