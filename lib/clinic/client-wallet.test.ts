import { describe, expect, it } from 'vitest'
import { buildClientWalletOverview, isPatientVisibleQuoteStatus } from '@/lib/clinic/client-wallet'
import type { ClientBalanceSummary } from '@/lib/clinic/client-balance'

const clearBalance: ClientBalanceSummary = {
  currency: 'AED',
  expectedCents: 0,
  paidCents: 0,
  refundedCents: 0,
  pendingCents: 0,
  grossDueCents: 0,
  dueCents: 0,
  creditCents: 0,
  balanceCents: 0,
  status: 'CLEAR',
  lastPaymentAt: null,
}

describe('client wallet helpers', () => {
  it('shows only patient-safe quote statuses', () => {
    expect(isPatientVisibleQuoteStatus('SENT')).toBe(true)
    expect(isPatientVisibleQuoteStatus('ACCEPTED')).toBe(true)
    expect(isPatientVisibleQuoteStatus('EXPIRED')).toBe(true)
    expect(isPatientVisibleQuoteStatus('DRAFT')).toBe(false)
    expect(isPatientVisibleQuoteStatus('DECLINED')).toBe(false)
  })

  it('summarizes patient-facing wallet totals', () => {
    const overview = buildClientWalletOverview({
      clientBalance: {
        ...clearBalance,
        dueCents: 25000,
        pendingCents: 10000,
        status: 'DEBT',
      },
      pendingPayments: [{ amountCents: 15000 }, { amountCents: 5000 }],
      packages: [
        { remainingSessions: 3, status: 'ACTIVE' },
        { remainingSessions: 5, status: 'EXPIRED' },
      ],
      giftCards: [
        { remainingBalanceCents: 12000, status: 'ACTIVE' },
        { remainingBalanceCents: 8000, status: 'REDEEMED' },
      ],
      savedPaymentMethods: [{ status: 'ACTIVE' }, { status: 'REVOKED' }],
    })

    expect(overview.dueCents).toBe(25000)
    expect(overview.pendingCents).toBe(20000)
    expect(overview.activePackageSessions).toBe(3)
    expect(overview.activeGiftCardBalanceCents).toBe(12000)
    expect(overview.activeSavedPaymentMethods).toBe(1)
  })
})
