'use client'

import Section from '../../common/Section'
import Button from '../../common/Button'
import { ArrowRight, Download } from 'lucide-react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { solutionsTranslations } from '../../../translations/solutions'

export default function SolutionsCTA() {
  const { language } = useLanguage()
  const t = solutionsTranslations[language]
  
  return (
    <Section id="cta" background="gray">
      <div className="text-center max-w-3xl mx-auto px-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t.cta.title}
        </h2>
        <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t.cta.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Button href="/contact" size="lg" className="w-full sm:w-auto">
            {t.cta.primary}
            <ArrowRight className={`${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'} h-5 w-5`} />
          </Button>
          <Button 
            href="/solutions" 
            variant="secondary" 
            size="lg" 
            className="w-full sm:w-auto bg-white text-primary-600 hover:bg-gray-100"
          >
            <Download className={`${language === 'ar' ? 'ml-2' : 'mr-2'} h-5 w-5`} />
            {t.cta.secondary}
          </Button>
        </div>
      </div>
    </Section>
  )
}

