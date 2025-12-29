'use client'

import Section from '../../common/Section'
import { useLanguage } from '../../../contexts/LanguageContext'
import { appTranslations } from '../../../translations/app'

export default function UserTestimonials() {
  const { language } = useLanguage()
  const t = appTranslations[language]
  const testimonials = (t.testimonials ?? []) as Array<{
    quote?: string
    author?: string
    location?: string
  }>

  if (!testimonials.length) {
    return null
  }

  return (
    <Section id="testimonials" background="gray">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto px-2">
        {testimonials.map((testimonial) => (
          <div key={`test-${(testimonial.author || 'anon').slice(0, 15)}`} className="text-center">
            {testimonial.quote && (
              <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3 italic" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                "{testimonial.quote}"
              </p>
            )}
            {testimonial.author && (
              <p className="text-xs font-semibold text-gray-900">{testimonial.author}</p>
            )}
            {testimonial.location && (
              <p className="text-xs text-gray-600">{testimonial.location}</p>
            )}
          </div>
        ))}
      </div>
    </Section>
  )
}

