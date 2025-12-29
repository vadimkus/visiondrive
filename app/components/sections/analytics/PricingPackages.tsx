'use client'

import Section from '../../common/Section'
import Button from '../../common/Button'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { analyticsTranslations } from '../../../translations/analytics'

export default function PricingPackages() {
  const { language } = useLanguage()
  const t = analyticsTranslations[language]
  
  return (
    <Section id="pricing">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
        {t.pricing.packages.map((pkg) => (
          <div key={`pkg-${pkg.name.slice(0, 15)}`} className="text-center">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>{pkg.name}</h3>
            <div className="text-sm sm:text-base text-primary-600 font-semibold mb-2">{pkg.price}</div>
            <div className="text-xs sm:text-sm text-gray-600 space-y-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {pkg.features.map((feature, featureIndex) => (
                <div key={featureIndex}>{feature}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="text-center px-2">
        <Button href="/contact" size="lg" className="w-full sm:w-auto">
          {t.pricing.cta}
          <ArrowRight className={`${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'} h-5 w-5`} />
        </Button>
      </div>
    </Section>
  )
}

