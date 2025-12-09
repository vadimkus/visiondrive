'use client'

import Section from '../../common/Section'
import { useLanguage } from '../../../contexts/LanguageContext'
import { appTranslations } from '../../../translations/app'

export default function UserTestimonials() {
  const { language } = useLanguage()
  const t = appTranslations[language]
  
  return (
    <Section id="testimonials" background="gray">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto px-2">
        {t.testimonials.map((testimonial, index) => (
          <div key={index} className="text-center">
            <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3 italic" dir={language === 'ar' ? 'rtl' : 'ltr'}>"{testimonial.quote}"</p>
            <p className="text-xs font-semibold text-gray-900">{testimonial.author}</p>
            <p className="text-xs text-gray-600">{testimonial.location}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

