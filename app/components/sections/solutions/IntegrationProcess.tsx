'use client'

import Section from '../../common/Section'
import { useLanguage } from '../../../contexts/LanguageContext'
import { solutionsTranslations } from '../../../translations/solutions'

export default function IntegrationProcess() {
  const { language } = useLanguage()
  const t = solutionsTranslations[language]
  
  return (
    <Section>
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t.implementation.title}
        </h2>
        <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t.implementation.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
        {t.implementation.steps.map((step, stepIdx) => (
          <div key={`step-${stepIdx}-${step.title.slice(0, 10)}`} className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base mx-auto mb-3 sm:mb-4">
              {stepIdx + 1}
            </div>
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>{step.title}</h3>
          </div>
        ))}
      </div>
    </Section>
  )
}

