'use client'

import Section from '../../common/Section'
import { useLanguage } from '../../../contexts/LanguageContext'
import { solutionsTranslations } from '../../../translations/solutions'

export default function SensorTechnologySection() {
  const { language } = useLanguage()
  const t = solutionsTranslations[language]
  
  return (
    <Section id="sensor-technology" background="white">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 text-center" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {t.sensor.title}
          </h2>
          <p className="text-sm sm:text-base text-primary-600 font-medium text-center mb-4 sm:mb-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {t.sensor.trust}
          </p>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {t.sensor.description}
              </p>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {t.sensor.featuresTitle}
                </h3>
                <ul className="space-y-2 sm:space-y-3" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {t.sensor.features.map((feature) => (
                    <li key={`sensor-feat-${feature.slice(0, 15)}`} className={`flex items-start text-sm sm:text-base text-gray-700 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-primary-600 ${language === 'ar' ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'} flex-shrink-0`}>•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

