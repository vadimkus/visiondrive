import { describe, expect, it } from 'vitest'
import { ClinicAppointmentStatus } from '@prisma/client'
import {
  isPolicyFeePaymentReference,
  normalizePolicyFeeKind,
  policyFeeAmountCents,
  policyFeeReference,
  policyFeeStatusPatch,
} from '@/lib/clinic/policy-fees'

describe('policy fee helpers', () => {
  it('normalizes supported fee kinds', () => {
    expect(normalizePolicyFeeKind('late_cancel')).toBe('LATE_CANCEL')
    expect(normalizePolicyFeeKind('NO_SHOW')).toBe('NO_SHOW')
    expect(normalizePolicyFeeKind('deposit')).toBeNull()
  })

  it('builds and detects policy fee references', () => {
    expect(policyFeeReference('LATE_CANCEL', 'appt_1')).toBe('LATE_CANCEL:appt_1')
    expect(policyFeeReference('NO_SHOW', 'appt_1')).toBe('NO_SHOW:appt_1')
    expect(isPolicyFeePaymentReference('NO_SHOW:appt_1')).toBe(true)
    expect(isPolicyFeePaymentReference('DEPOSIT:appt_1')).toBe(false)
  })

  it('selects the right appointment fee amount', () => {
    const appointment = { lateCancelFeeCents: 15000, noShowFeeCents: 25000 }
    expect(policyFeeAmountCents(appointment, 'LATE_CANCEL')).toBe(15000)
    expect(policyFeeAmountCents(appointment, 'NO_SHOW')).toBe(25000)
  })

  it('maps fee kind to the right appointment status patch', () => {
    expect(policyFeeStatusPatch('NO_SHOW', null)).toEqual({
      status: ClinicAppointmentStatus.NO_SHOW,
    })
    expect(policyFeeStatusPatch('LATE_CANCEL', 'Client cancelled same day')).toEqual({
      status: ClinicAppointmentStatus.CANCELLED,
      cancelReason: 'Client cancelled same day',
    })
  })
})
