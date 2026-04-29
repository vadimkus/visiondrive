import { describe, expect, it } from 'vitest'
import {
  ClinicAppointmentStatus,
  ClinicPaymentRequirementStatus,
  ClinicPaymentStatus,
} from '@prisma/client'
import {
  depositPaymentReference,
  depositRequirementStatusFromPayments,
  isDepositPaymentReference,
  shouldBlockConfirmation,
} from '@/lib/clinic/deposit-requests'

describe('deposit request helpers', () => {
  it('identifies appointment deposit references', () => {
    expect(depositPaymentReference('appt_1')).toBe('DEPOSIT:appt_1')
    expect(isDepositPaymentReference('DEPOSIT:appt_1')).toBe(true)
    expect(isDepositPaymentReference('PACKAGE:pkg_1')).toBe(false)
  })

  it('marks requirement paid only when deposit payments cover required amount', () => {
    expect(
      depositRequirementStatusFromPayments(
        { depositRequiredCents: 10000 },
        [{ amountCents: 5000, status: ClinicPaymentStatus.PAID, reference: 'DEPOSIT:appt_1' }]
      )
    ).toBe(ClinicPaymentRequirementStatus.PENDING)

    expect(
      depositRequirementStatusFromPayments(
        { depositRequiredCents: 10000 },
        [{ amountCents: 10000, status: ClinicPaymentStatus.PAID, reference: 'DEPOSIT:appt_1' }]
      )
    ).toBe(ClinicPaymentRequirementStatus.PAID)
  })

  it('blocks confirmation while a required deposit is pending', () => {
    expect(
      shouldBlockConfirmation({
        nextStatus: ClinicAppointmentStatus.CONFIRMED,
        paymentRequirementStatus: ClinicPaymentRequirementStatus.PENDING,
        depositRequiredCents: 10000,
      })
    ).toBe(true)

    expect(
      shouldBlockConfirmation({
        nextStatus: ClinicAppointmentStatus.CONFIRMED,
        paymentRequirementStatus: ClinicPaymentRequirementStatus.PAID,
        depositRequiredCents: 10000,
      })
    ).toBe(false)
  })
})
