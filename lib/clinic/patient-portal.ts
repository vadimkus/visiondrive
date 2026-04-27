import { createHash, randomBytes } from 'crypto'
import {
  ClinicPatientPortalRequestType,
  type ClinicPatientPortalLink,
} from '@prisma/client'

export const PATIENT_PORTAL_TOKEN_BYTES = 32
export const PATIENT_PORTAL_DEFAULT_EXPIRY_DAYS = 90
export const PATIENT_PORTAL_MAX_MESSAGE_LENGTH = 1000

export function createPatientPortalToken() {
  return randomBytes(PATIENT_PORTAL_TOKEN_BYTES).toString('base64url')
}

export function hashPatientPortalToken(token: string) {
  return createHash('sha256').update(token.trim()).digest('hex')
}

export function patientPortalTokenLastFour(token: string) {
  return token.trim().slice(-4)
}

export function patientPortalExpiresAt(days = PATIENT_PORTAL_DEFAULT_EXPIRY_DAYS, from = new Date()) {
  const safeDays = Number.isFinite(days) ? Math.max(1, Math.min(Math.round(days), 365)) : PATIENT_PORTAL_DEFAULT_EXPIRY_DAYS
  return new Date(from.getTime() + safeDays * 24 * 60 * 60 * 1000)
}

export function isPatientPortalLinkActive(
  link: Pick<ClinicPatientPortalLink, 'expiresAt' | 'revokedAt'>,
  now = new Date()
) {
  return !link.revokedAt && link.expiresAt.getTime() >= now.getTime()
}

export function normalizePatientPortalRequestType(value: unknown) {
  const text = String(value ?? '').trim().toUpperCase()
  if (text === 'RESCHEDULE') return ClinicPatientPortalRequestType.RESCHEDULE
  if (text === 'CANCEL') return ClinicPatientPortalRequestType.CANCEL
  return ClinicPatientPortalRequestType.MESSAGE
}

export function normalizePatientPortalMessage(value: unknown) {
  const text = String(value ?? '').trim()
  return text.slice(0, PATIENT_PORTAL_MAX_MESSAGE_LENGTH)
}

export function patientPortalRequestLabel(type: ClinicPatientPortalRequestType) {
  if (type === ClinicPatientPortalRequestType.RESCHEDULE) return 'Reschedule request'
  if (type === ClinicPatientPortalRequestType.CANCEL) return 'Cancellation request'
  return 'Patient message'
}
