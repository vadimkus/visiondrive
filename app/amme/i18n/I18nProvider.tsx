'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import {
  dictionaries,
  type Locale,
  type TranslationKey,
} from './dictionaries'

export const AMME_LOCALE_STORAGE_KEY = 'amme.locale'
export const AMME_LOCALE_COOKIE_NAME = 'amme_locale'
const AMME_LOCALE_CHANGE_EVENT = 'amme:locale-change'

export type InterpolationValues = Record<
  string,
  string | number | boolean | null | undefined
>

export type Translate = (
  key: TranslationKey,
  values?: InterpolationValues
) => string

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  t: Translate
}

const I18nContext = createContext<I18nContextValue | null>(null)

function isLocale(value: unknown): value is Locale {
  return value === 'ru' || value === 'en'
}

function readLocaleCookie(): Locale | null {
  if (typeof document === 'undefined') return null

  const prefix = `${AMME_LOCALE_COOKIE_NAME}=`
  const raw = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length)

  if (!raw) return null

  try {
    const value = decodeURIComponent(raw)
    return isLocale(value) ? value : null
  } catch {
    return null
  }
}

function persistLocale(locale: Locale) {
  try {
    window.localStorage.setItem(AMME_LOCALE_STORAGE_KEY, locale)
  } catch {
    // Language switching still works if storage is blocked.
  }

  document.cookie = `${AMME_LOCALE_COOKIE_NAME}=${encodeURIComponent(
    locale
  )}; Path=/; Max-Age=31536000; SameSite=Lax`
  window.dispatchEvent(new Event(AMME_LOCALE_CHANGE_EVENT))
}

function readPersistedLocale(fallback: Locale): Locale {
  if (typeof window === 'undefined') return fallback

  try {
    const stored = window.localStorage.getItem(AMME_LOCALE_STORAGE_KEY)
    if (isLocale(stored)) return stored
  } catch {
    // Fall back to the cookie when storage is blocked.
  }

  return readLocaleCookie() ?? fallback
}

function subscribeToLocale(onStoreChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === AMME_LOCALE_STORAGE_KEY) onStoreChange()
  }

  window.addEventListener('storage', onStorage)
  window.addEventListener(AMME_LOCALE_CHANGE_EVENT, onStoreChange)

  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(AMME_LOCALE_CHANGE_EVENT, onStoreChange)
  }
}

export function interpolate(
  template: string,
  values: InterpolationValues = {}
): string {
  return template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (match, name: string) => {
    const value = values[name]
    return value === null || value === undefined ? match : String(value)
  })
}

export function translate(
  locale: Locale,
  key: TranslationKey,
  values?: InterpolationValues
): string {
  const template = dictionaries[locale][key] ?? dictionaries.ru[key] ?? key
  return interpolate(template, values)
}

export function I18nProvider({
  children,
  initialLocale = 'ru',
}: {
  children: ReactNode
  initialLocale?: Locale
}) {
  const locale = useSyncExternalStore(
    subscribeToLocale,
    () => readPersistedLocale(initialLocale),
    () => initialLocale
  )

  const setLocale = useCallback((nextLocale: Locale) => {
    persistLocale(nextLocale)
  }, [])

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'ru' ? 'en' : 'ru')
  }, [locale, setLocale])

  const t = useCallback<Translate>(
    (key, values) => translate(locale, key, values),
    [locale]
  )

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, toggleLocale, t }),
    [locale, setLocale, t, toggleLocale]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }

  return context
}

export const useTranslation = useI18n
