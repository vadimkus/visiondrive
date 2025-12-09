'use client'

import Section from '../common/Section'
import Button from '../common/Button'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { commonTranslations } from '../../translations/common'

export default function CTASection() {
  const { language } = useLanguage()
  const t = commonTranslations[language]
  
  return (
    <Section id="cta">
      <div className="text-center px-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t.cta.title}
        </h2>
        <Button href="/contact" size="lg" className="group w-full sm:w-auto">
          {t.cta.button}
          <ArrowRight className={`${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'} h-5 w-5 group-hover:translate-x-1 transition-transform`} />
        </Button>
      </div>
    </Section>
  )
}
