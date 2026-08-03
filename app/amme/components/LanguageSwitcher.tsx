'use client'

import { useI18n, type Locale } from '../i18n'

export default function LanguageSwitcher({
  className,
}: {
  className?: string
}) {
  const { locale, setLocale, t } = useI18n()

  const options: Array<{ locale: Locale; shortLabel: string }> = [
    { locale: 'ru', shortLabel: 'RU' },
    { locale: 'en', shortLabel: 'EN' },
  ]

  return (
    <div
      className={`amme-language-switcher ${className || ''}`.trim()}
      role="group"
      aria-label={t('language.switchTo', {
        language: locale === 'ru' ? t('language.en') : t('language.ru'),
      })}
    >
      {options.map((option) => {
        const active = locale === option.locale
        const languageName =
          option.locale === 'ru' ? t('language.ru') : t('language.en')

        return (
          <span key={option.locale}>
            <button
              type="button"
              aria-label={t('language.switchTo', { language: languageName })}
              aria-pressed={active}
              title={languageName}
              onClick={() => setLocale(option.locale)}
              className={active ? 'on' : ''}
            >
              {option.shortLabel}
            </button>
          </span>
        )
      })}
    </div>
  )
}
