import { ClinicPatientPortalRequestType } from '@prisma/client'
import { describe, expect, it } from 'vitest'
import {
  createPatientPortalToken,
  hashPatientPortalToken,
  isPatientPortalLinkActive,
  normalizePatientPortalMessage,
  normalizePatientPortalRequestType,
  patientPortalExpiresAt,
  patientPortalTokenLastFour,
} from './patient-portal'

describe('clinic patient portal helpers', () => {
  it('creates hashable private tokens without storing plaintext', () => {
    const token = createPatientPortalToken()
    const hash = hashPatientPortalToken(token)

    expect(token.length).toBeGreaterThan(30)
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
    expect(hash).toBe(hashPatientPortalToken(token))
    expect(patientPortalTokenLastFour(token)).toBe(token.slice(-4))
  })

  it('normalizes request data safely', () => {
    expect(normalizePatientPortalRequestType('reschedule')).toBe(ClinicPatientPortalRequestType.RESCHEDULE)
    expect(normalizePatientPortalRequestType('cancel')).toBe(ClinicPatientPortalRequestType.CANCEL)
    expect(normalizePatientPortalRequestType('other')).toBe(ClinicPatientPortalRequestType.MESSAGE)
    expect(normalizePatientPortalMessage(` ${'x'.repeat(1200)} `)).toHaveLength(1000)
  })

  it('checks link expiry and revocation', () => {
    const now = new Date('2026-04-27T10:00:00Z')
    const expiresAt = patientPortalExpiresAt(10, now)

    expect(isPatientPortalLinkActive({ expiresAt, revokedAt: null }, now)).toBe(true)
    expect(isPatientPortalLinkActive({ expiresAt: new Date('2026-04-26T10:00:00Z'), revokedAt: null }, now)).toBe(false)
    expect(isPatientPortalLinkActive({ expiresAt, revokedAt: now }, now)).toBe(false)
  })
})
