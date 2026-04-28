export const CLINIC_ACCOUNT_NOTIFICATION_KEYS = [
  'notifyNewBooking',
  'notifyRescheduled',
  'notifyReminderDue',
  'notifyReviewRequest',
  'notifyUnpaidVisit',
  'notifyLowStock',
  'notifyPackageExpiry',
] as const

export type ClinicAccountNotificationKey = (typeof CLINIC_ACCOUNT_NOTIFICATION_KEYS)[number]

export type ClinicAccountPreferences = {
  locale: 'en' | 'ru'
  notifyPush: boolean
  notifyEmail: boolean
} & Record<ClinicAccountNotificationKey, boolean>

export const DEFAULT_CLINIC_ACCOUNT_PREFERENCES: ClinicAccountPreferences = {
  locale: 'en',
  notifyPush: true,
  notifyEmail: true,
  notifyNewBooking: true,
  notifyRescheduled: true,
  notifyReminderDue: true,
  notifyReviewRequest: true,
  notifyUnpaidVisit: true,
  notifyLowStock: true,
  notifyPackageExpiry: true,
}

export function normalizeClinicLocale(value: unknown): 'en' | 'ru' {
  return value === 'ru' ? 'ru' : 'en'
}

export function booleanPreference(value: unknown, fallback = true): boolean {
  return typeof value === 'boolean' ? value : fallback
}

export function normalizeClinicAccountPreferences(
  value: unknown,
  fallback: ClinicAccountPreferences = DEFAULT_CLINIC_ACCOUNT_PREFERENCES
): ClinicAccountPreferences {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const next: ClinicAccountPreferences = {
    locale: normalizeClinicLocale(raw.locale ?? fallback.locale),
    notifyPush: booleanPreference(raw.notifyPush, fallback.notifyPush),
    notifyEmail: booleanPreference(raw.notifyEmail, fallback.notifyEmail),
    notifyNewBooking: booleanPreference(raw.notifyNewBooking, fallback.notifyNewBooking),
    notifyRescheduled: booleanPreference(raw.notifyRescheduled, fallback.notifyRescheduled),
    notifyReminderDue: booleanPreference(raw.notifyReminderDue, fallback.notifyReminderDue),
    notifyReviewRequest: booleanPreference(raw.notifyReviewRequest, fallback.notifyReviewRequest),
    notifyUnpaidVisit: booleanPreference(raw.notifyUnpaidVisit, fallback.notifyUnpaidVisit),
    notifyLowStock: booleanPreference(raw.notifyLowStock, fallback.notifyLowStock),
    notifyPackageExpiry: booleanPreference(raw.notifyPackageExpiry, fallback.notifyPackageExpiry),
  }
  return next
}
