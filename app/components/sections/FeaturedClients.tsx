'use client'

import Section from '../common/Section'
import { useLanguage } from '../../contexts/LanguageContext'
import { commonTranslations } from '../../translations/common'

export default function FeaturedClients() {
  const { language } = useLanguage()
  const t = commonTranslations[language]
  
  return (
    <Section id="clients" background="gray">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-3xl mx-auto px-2">
        {t.clients.items.map((client, index) => (
          <div key={index} className="text-center">
            <p className="text-sm sm:text-base text-gray-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>{client}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
