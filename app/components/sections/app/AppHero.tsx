'use client'

import Section from '../../common/Section'
import Button from '../../common/Button'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { appTranslations } from '../../../translations/app'

export default function AppHero() {
  const { language } = useLanguage()
  const t = appTranslations[language]
  
  return (
    <Section className="pt-20 sm:pt-24 md:pt-32 pb-8 sm:pb-12 md:pb-16">
      <div className="text-center max-w-3xl mx-auto px-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 sm:mb-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t.hero.title}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t.hero.subtitle}
        </p>
        <p className="text-sm sm:text-base text-primary-600 font-medium mb-4 sm:mb-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t.hero.promo}
        </p>
        <Button href="/app/download" size="lg" className="group w-full sm:w-auto">
          {t.hero.cta}
          <ArrowRight className={`${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'} h-5 w-5 group-hover:translate-x-1 transition-transform`} />
        </Button>
      </div>
    </Section>
  )
}

