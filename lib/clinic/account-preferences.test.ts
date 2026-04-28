import { describe, expect, it } from 'vitest'
import {
  DEFAULT_CLINIC_ACCOUNT_PREFERENCES,
  normalizeClinicAccountPreferences,
  normalizeClinicLocale,
} from '@/lib/clinic/account-preferences'

describe('account preferences', () => {
  it('normalizes unsupported locales to English', () => {
    expect(normalizeClinicLocale('ru')).toBe('ru')
    expect(normalizeClinicLocale('ar')).toBe('en')
    expect(normalizeClinicLocale(null)).toBe('en')
  })

  it('keeps boolean preferences explicit and defaults missing fields', () => {
    const prefs = normalizeClinicAccountPreferences({
      locale: 'ru',
      notifyPush: false,
      notifyEmail: false,
      notifyLowStock: false,
    })

    expect(prefs.locale).toBe('ru')
    expect(prefs.notifyPush).toBe(false)
    expect(prefs.notifyEmail).toBe(false)
    expect(prefs.notifyLowStock).toBe(false)
    expect(prefs.notifyNewBooking).toBe(DEFAULT_CLINIC_ACCOUNT_PREFERENCES.notifyNewBooking)
  })
})
