'use client'

import Section from '../../common/Section'
import { useLanguage } from '../../../contexts/LanguageContext'
import { solutionsTranslations } from '../../../translations/solutions'

export default function SolutionsHero() {
  const { language } = useLanguage()
  const t = solutionsTranslations[language]
  
  return (
    <Section className="pt-20 sm:pt-24 md:pt-32 pb-8 sm:pb-12 md:pb-16">
      <div className="text-center max-w-3xl mx-auto px-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t.hero.title}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mb-2 sm:mb-3" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t.hero.subtitle}
        </p>
        <p className="text-sm sm:text-base text-primary-600 font-medium" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t.hero.trust}
        </p>
      </div>
    </Section>
  )
}

