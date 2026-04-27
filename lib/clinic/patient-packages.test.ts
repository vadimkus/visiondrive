import { ClinicPatientPackageStatus } from '@prisma/client'
import { describe, expect, it } from 'vitest'
import {
  isPackagePaymentReference,
  normalizePackagePriceCents,
  normalizePackageSessions,
  packagePaymentReference,
  packageStatusFromSessions,
} from './patient-packages'

describe('clinic patient packages', () => {
  it('normalizes package session counts into a sane range', () => {
    expect(normalizePackageSessions('5')).toBe(5)
    expect(normalizePackageSessions('0')).toBe(1)
    expect(normalizePackageSessions('250')).toBe(100)
    expect(normalizePackageSessions('bad', 3)).toBe(3)
  })

  it('normalizes package price cents', () => {
    expect(normalizePackagePriceCents(125000.4)).toBe(125000)
    expect(normalizePackagePriceCents(-10)).toBe(0)
    expect(normalizePackagePriceCents('bad')).toBe(0)
  })

  it('identifies package sale payment references', () => {
    const reference = packagePaymentReference('pkg_123')
    expect(reference).toBe('PACKAGE:pkg_123')
    expect(isPackagePaymentReference(reference)).toBe(true)
    expect(isPackagePaymentReference('VISIT:abc')).toBe(false)
  })

  it('derives package status from remaining sessions and expiry', () => {
    expect(packageStatusFromSessions(0)).toBe(ClinicPatientPackageStatus.USED_UP)
    expect(packageStatusFromSessions(2, new Date(Date.now() - 1000))).toBe(
      ClinicPatientPackageStatus.EXPIRED
    )
    expect(packageStatusFromSessions(2, new Date(Date.now() + 1000 * 60))).toBe(
      ClinicPatientPackageStatus.ACTIVE
    )
  })
})
