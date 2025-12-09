'use client'

import Section from '../../common/Section'
import { useLanguage } from '../../../contexts/LanguageContext'
import { contactTranslations } from '../../../translations/contact'

export default function ContactHero() {
  const { language } = useLanguage()
  const t = contactTranslations[language]
  
  return (
    <Section className="pt-20 sm:pt-24 md:pt-32 pb-8 sm:pb-12">
      <div className="text-center max-w-3xl mx-auto px-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t.hero.title}
        </h1>
        <p className="text-base sm:text-lg text-gray-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t.hero.subtitle}
        </p>
      </div>
    </Section>
  )
}

