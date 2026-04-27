import { describe, expect, it } from 'vitest'
import {
  buildClientBalanceChargesFromAppointments,
  buildClientBalanceSummary,
} from './client-balance'

describe('clinic client balance', () => {
  it('marks a completed unpaid charge as debt', () => {
    const summary = buildClientBalanceSummary({
      charges: [{ expectedCents: 45000, currency: 'AED', payments: [] }],
    })

    expect(summary.status).toBe('DEBT')
    expect(summary.dueCents).toBe(45000)
    expect(summary.creditCents).toBe(0)
    expect(summary.balanceCents).toBe(-45000)
  })

  it('clears debt when a linked payment covers the charge', () => {
    const summary = buildClientBalanceSummary({
      charges: [
        {
          expectedCents: 45000,
          currency: 'AED',
          payments: [{ amountCents: 45000, currency: 'AED', status: 'PAID' }],
        },
      ],
    })

    expect(summary.status).toBe('CLEAR')
    expect(summary.dueCents).toBe(0)
    expect(summary.creditCents).toBe(0)
  })

  it('tracks overpayments and standalone deposits as credit', () => {
    const summary = buildClientBalanceSummary({
      charges: [
        {
          expectedCents: 30000,
          currency: 'AED',
          payments: [{ amountCents: 40000, currency: 'AED', status: 'PAID' }],
        },
      ],
      standalonePayments: [{ amountCents: 20000, currency: 'AED', status: 'PAID' }],
    })

    expect(summary.status).toBe('CREDIT')
    expect(summary.creditCents).toBe(30000)
    expect(summary.dueCents).toBe(0)
    expect(summary.balanceCents).toBe(30000)
  })

  it('uses pending standalone payments as due without counting void rows', () => {
    const summary = buildClientBalanceSummary({
      charges: [],
      standalonePayments: [
        { amountCents: 12000, currency: 'AED', status: 'PENDING' },
        { amountCents: 99900, currency: 'AED', status: 'VOID' },
      ],
    })

    expect(summary.status).toBe('DEBT')
    expect(summary.pendingCents).toBe(12000)
    expect(summary.dueCents).toBe(12000)
  })

  it('does not treat package sale payments as patient deposit credit', () => {
    const summary = buildClientBalanceSummary({
      charges: [],
      standalonePayments: [
        { amountCents: 100000, currency: 'AED', status: 'PAID', reference: 'PACKAGE:pkg_1' },
      ],
    })

    expect(summary.status).toBe('CLEAR')
    expect(summary.creditCents).toBe(0)
    expect(summary.paidCents).toBe(0)
  })

  it('does not treat product sale payments as patient deposit credit', () => {
    const summary = buildClientBalanceSummary({
      charges: [],
      standalonePayments: [
        { amountCents: 15000, currency: 'AED', status: 'PAID', reference: 'PRODUCT_SALE:sale_1' },
      ],
    })

    expect(summary.status).toBe('CLEAR')
    expect(summary.creditCents).toBe(0)
    expect(summary.paidCents).toBe(0)
  })

  it('builds charges only from arrived or completed appointments', () => {
    const charges = buildClientBalanceChargesFromAppointments([
      {
        status: 'SCHEDULED',
        procedure: { basePriceCents: 10000, currency: 'AED' },
        visits: [],
      },
      {
        status: 'COMPLETED',
        procedure: { basePriceCents: 20000, currency: 'AED' },
        visits: [{ payments: [{ amountCents: 5000, status: 'PAID' }] }],
      },
      {
        status: 'ARRIVED',
        procedure: { basePriceCents: 15000, currency: 'AED' },
        visits: [],
      },
    ])

    expect(charges).toHaveLength(2)
    expect(charges.map((charge) => charge.expectedCents)).toEqual([20000, 15000])
  })

  it('applies payment discounts and fees to the expected charge', () => {
    const summary = buildClientBalanceSummary({
      charges: [
        {
          expectedCents: 50000,
          currency: 'AED',
          payments: [
            {
              amountCents: 46000,
              currency: 'AED',
              status: 'PAID',
              discountCents: 5000,
              feeCents: 1000,
            },
          ],
        },
      ],
    })

    expect(summary.expectedCents).toBe(46000)
    expect(summary.dueCents).toBe(0)
    expect(summary.status).toBe('CLEAR')
  })
})
