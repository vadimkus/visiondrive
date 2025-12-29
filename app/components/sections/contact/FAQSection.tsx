'use client'

import Section from '../../common/Section'
import { useLanguage } from '../../../contexts/LanguageContext'
import { contactTranslations } from '../../../translations/contact'

export default function FAQSection() {
  const { language } = useLanguage()
  const t = contactTranslations[language]
  
  return (
    <Section id="faq" background="gray">
      <div className="max-w-2xl mx-auto space-y-6">
        {t.faq.items.map((faq) => (
          <div key={`faq-${faq.q.slice(0, 20)}`} className="text-center">
            <h3 className="text-sm font-semibold text-gray-900 mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>{faq.q}</h3>
            <p className="text-sm text-gray-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>{faq.a}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

