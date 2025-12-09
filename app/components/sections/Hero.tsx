'use client'

import { motion } from 'framer-motion'
import Button from '../common/Button'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { homeTranslations } from '../../translations/home'

export default function Hero() {
  const { language } = useLanguage()
  const t = homeTranslations[language]

  return (
    <section className="relative flex items-center justify-center min-h-[calc(100vh-200px)] py-4 sm:py-8 pb-2 sm:pb-3">
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 px-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {t.hero.title}{' '}
            <span className="text-primary-600">{t.hero.titleHighlight}</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto px-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {t.hero.subtitle.includes('ParkSense App') ? (
              <>
                {t.hero.subtitle.replace(' - ParkSense App.', '')}
                {' - '}
                <span className="underline">ParkSense App</span>.
              </>
            ) : (
              t.hero.subtitle
            )}
          </p>
          <div className="px-4 mb-2 sm:mb-3">
            <Button href="/app/download" size="lg" className="group w-full sm:w-auto">
              {t.hero.cta}
              <ArrowRight className={`${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'} h-5 w-5 group-hover:translate-x-1 transition-transform`} />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
