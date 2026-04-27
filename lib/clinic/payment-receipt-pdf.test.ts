import { describe, expect, it } from 'vitest'
import { buildClinicPaymentReceiptPdf } from './payment-receipt-pdf'

describe('clinic payment receipt pdf', () => {
  it('generates a pdf buffer', () => {
    const bytes = new Uint8Array(
      buildClinicPaymentReceiptPdf({
        practiceName: 'VisionDrive Practice',
        generatedAt: new Date('2026-04-27T07:00:00.000Z'),
        receiptNo: 'PAY-123',
        patient: {
          firstName: 'Iryna',
          lastName: 'Patient',
          middleName: null,
          phone: '+971500000000',
          email: null,
        },
        payment: {
          amountCents: 45000,
          discountCents: 5000,
          feeCents: 0,
          currency: 'AED',
          method: 'CARD',
          status: 'PAID',
          reference: 'POS123',
          note: null,
          paidAt: new Date('2026-04-27T06:30:00.000Z'),
        },
        appointment: {
          startsAt: new Date('2026-04-27T06:00:00.000Z'),
          label: 'Skin treatment',
          basePriceCents: 50000,
        },
      })
    )

    expect(Array.from(bytes.slice(0, 4))).toEqual([0x25, 0x50, 0x44, 0x46])
  })
})
