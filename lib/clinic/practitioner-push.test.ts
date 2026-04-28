import { beforeAll, describe, expect, it, vi } from 'vitest'

beforeAll(() => {
  vi.stubEnv('DATABASE_URL', 'postgresql://user:pass@localhost:5432/test')
})

describe('practitioner push helpers', () => {
  it('maps notification kinds to account preference keys', async () => {
    const { preferenceKeyForPushKind } = await import('@/lib/clinic/practitioner-push')

    expect(preferenceKeyForPushKind('NEW_BOOKING')).toBe('notifyNewBooking')
    expect(preferenceKeyForPushKind('CANCELLED')).toBe('notifyCancelled')
    expect(preferenceKeyForPushKind('PACKAGE_EXPIRING')).toBe('notifyPackageExpiry')
  })

  it('builds concise notification payloads', async () => {
    const { practitionerPushPayloadForItem } = await import('@/lib/clinic/practitioner-push')

    const payload = practitionerPushPayloadForItem({
      id: 'unpaid:1',
      kind: 'UNPAID_VISIT',
      severity: 'urgent',
      subject: 'Unpaid visit',
      patientName: 'Doe, Jane',
      serviceName: 'Facial',
      amountCents: 45000,
      currency: 'AED',
      actionHref: '/clinic/appointments/1',
    })

    expect(payload.title).toBe('Unpaid visit')
    expect(payload.body).toContain('Doe, Jane')
    expect(payload.body).toContain('450.00 AED')
    expect(payload.sourceKey).toBe('unpaid:1')
  })
})
