'use client'

import Section from '../../common/Section'
import { Apple, Smartphone } from 'lucide-react'
import Button from '../../common/Button'
import { useLanguage } from '../../../contexts/LanguageContext'
import { appTranslations } from '../../../translations/app'

export default function DownloadSection() {
  const { language } = useLanguage()
  const t = appTranslations[language]
  
  return (
    <Section id="download" className="pt-20 sm:pt-24 md:pt-32">
      <div className="text-center px-2">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t.download.title}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t.download.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto">
          <Button
            href="#"
            variant="secondary"
            size="lg"
            className="bg-white text-primary-600 hover:bg-gray-100 w-full sm:w-auto"
          >
            <Apple className={`${language === 'ar' ? 'ml-2' : 'mr-2'} h-5 w-5`} />
            App Store
          </Button>
          <Button
            href="#"
            variant="secondary"
            size="lg"
            className="bg-white text-primary-600 hover:bg-gray-100 w-full sm:w-auto"
          >
            <Smartphone className={`${language === 'ar' ? 'ml-2' : 'mr-2'} h-5 w-5`} />
            Google Play
          </Button>
        </div>
      </div>
    </Section>
  )
}

