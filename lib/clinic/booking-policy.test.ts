import { describe, expect, it } from 'vitest'
import { ClinicBookingPolicyType, ClinicPaymentRequirementStatus } from '@prisma/client'
import {
  bookingPolicyAppointmentData,
  bookingPolicyRequiresAcceptance,
  depositRequiredCents,
  type BookingPolicyProcedure,
} from '@/lib/clinic/booking-policy'

function procedure(patch: Partial<BookingPolicyProcedure>): BookingPolicyProcedure {
  return {
    id: 'proc_1',
    name: 'Consultation',
    basePriceCents: 50000,
    currency: 'AED',
    bookingPolicyType: ClinicBookingPolicyType.NONE,
    depositAmountCents: 0,
    depositPercent: 0,
    cancellationWindowHours: 24,
    lateCancelFeeCents: 0,
    noShowFeeCents: 0,
    bookingPolicyText: null,
    ...patch,
  }
}

describe('booking policy foundation', () => {
  it('does not require payment or acceptance for no policy', () => {
    const p = procedure({})

    expect(bookingPolicyRequiresAcceptance(p)).toBe(false)
    expect(depositRequiredCents(p)).toBe(0)
    expect(bookingPolicyAppointmentData(p, false).paymentRequirementStatus).toBe(
      ClinicPaymentRequirementStatus.NOT_REQUIRED
    )
  })

  it('uses the larger of fixed and percent deposit', () => {
    const p = procedure({
      bookingPolicyType: ClinicBookingPolicyType.DEPOSIT,
      depositAmountCents: 10000,
      depositPercent: 30,
    })

    expect(depositRequiredCents(p)).toBe(15000)
  })

  it('snapshots full prepay as the full service price', () => {
    const p = procedure({ bookingPolicyType: ClinicBookingPolicyType.FULL_PREPAY })
    const data = bookingPolicyAppointmentData(p, true, new Date('2026-04-29T08:00:00Z'))

    expect(data.depositRequiredCents).toBe(50000)
    expect(data.paymentRequirementStatus).toBe(ClinicPaymentRequirementStatus.PENDING)
    expect(data.bookingPolicyAcceptedAt?.toISOString()).toBe('2026-04-29T08:00:00.000Z')
  })
})
