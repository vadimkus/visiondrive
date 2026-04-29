import { ClinicSavedPaymentMethodStatus } from '@prisma/client'

export type SavedPaymentMethodInput = {
  provider?: unknown
  brand?: unknown
  last4?: unknown
  expiryMonth?: unknown
  expiryYear?: unknown
  consentText?: unknown
  providerRef?: unknown
  note?: unknown
}

export function normalizeSavedPaymentMethodProvider(value: unknown) {
  const provider = String(value ?? 'manual')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
  return provider.slice(0, 40) || 'manual'
}

export function normalizeCardBrand(value: unknown) {
  const brand = String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
  return brand ? brand.slice(0, 40) : null
}

export function normalizeCardLast4(value: unknown) {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits.length === 4 ? digits : null
}

export function normalizeExpiryMonth(value: unknown) {
  if (value == null || value === '') return null
  const month = Number(value)
  if (!Number.isInteger(month) || month < 1 || month > 12) return null
  return month
}

export function normalizeExpiryYear(value: unknown) {
  if (value == null || value === '') return null
  const year = Number(value)
  if (!Number.isInteger(year) || year < 2020 || year > 2100) return null
  return year
}

export function normalizeSavedPaymentMethodStatus(value: unknown) {
  const status = String(value ?? ClinicSavedPaymentMethodStatus.ACTIVE)
    .trim()
    .toUpperCase()
  return Object.values(ClinicSavedPaymentMethodStatus).includes(
    status as ClinicSavedPaymentMethodStatus
  )
    ? (status as ClinicSavedPaymentMethodStatus)
    : ClinicSavedPaymentMethodStatus.ACTIVE
}

export function normalizeSavedPaymentMethodText(value: unknown, max = 1_000) {
  const text = String(value ?? '').trim()
  return text ? text.slice(0, max) : null
}

export function savedPaymentMethodDisplayName(method: {
  brand?: string | null
  last4: string
  expiryMonth?: number | null
  expiryYear?: number | null
}) {
  const brand = method.brand?.trim() || 'Card'
  const expiry =
    method.expiryMonth && method.expiryYear
      ? ` exp ${String(method.expiryMonth).padStart(2, '0')}/${String(method.expiryYear).slice(-2)}`
      : ''
  return `${brand} ending ${method.last4}${expiry}`
}

export function parseSavedPaymentMethodInput(input: SavedPaymentMethodInput) {
  const last4 = normalizeCardLast4(input.last4)
  if (!last4) {
    return { error: 'last4 must contain exactly 4 digits' as const }
  }

  return {
    value: {
      provider: normalizeSavedPaymentMethodProvider(input.provider),
      brand: normalizeCardBrand(input.brand),
      last4,
      expiryMonth: normalizeExpiryMonth(input.expiryMonth),
      expiryYear: normalizeExpiryYear(input.expiryYear),
      consentText: normalizeSavedPaymentMethodText(input.consentText),
      providerRef: normalizeSavedPaymentMethodText(input.providerRef, 120),
      note: normalizeSavedPaymentMethodText(input.note),
    },
  }
}
