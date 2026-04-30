import { describe, expect, it } from 'vitest'
import {
  buildMembershipPlan,
  buildMembershipSubscription,
  dueMembershipSubscriptions,
  membershipPaymentReference,
  summarizeMemberships,
} from '@/lib/clinic/memberships'

const now = new Date('2026-04-30T08:00:00.000Z')

describe('membership helpers', () => {
  it('normalizes plans and subscriptions', () => {
    const plan = buildMembershipPlan({
      name: 'Maintenance',
      monthlyPriceCents: 120000,
      includedSessions: 2,
      now,
    })
    const subscription = buildMembershipSubscription({
      patientId: 'p1',
      planId: plan.id,
      nextBillingAt: '2026-04-30',
      autopayEnabled: true,
      now,
    })

    expect(plan.currency).toBe('AED')
    expect(plan.includedSessions).toBe(2)
    expect(subscription.status).toBe('ACTIVE')
    expect(subscription.autopayEnabled).toBe(true)
  })

  it('finds subscriptions due for billing', () => {
    const due = buildMembershipSubscription({
      patientId: 'p1',
      planId: 'plan1',
      nextBillingAt: '2026-04-01',
      now,
    })
    const future = buildMembershipSubscription({
      patientId: 'p2',
      planId: 'plan1',
      nextBillingAt: '2026-05-01',
      now,
    })

    expect(dueMembershipSubscriptions([due, future], now)).toHaveLength(1)
    expect(membershipPaymentReference(due.id, new Date(due.nextBillingAt))).toContain('MEMBERSHIP:')
  })

  it('summarizes monthly recurring revenue and autopay count', () => {
    const plan = buildMembershipPlan({ name: 'Glow', monthlyPriceCents: 90000, now })
    const sub = buildMembershipSubscription({
      patientId: 'p1',
      planId: plan.id,
      nextBillingAt: '2026-04-01',
      autopayEnabled: true,
      now,
    })

    expect(summarizeMemberships({ plans: [plan], subscriptions: [sub], now })).toMatchObject({
      activePlans: 1,
      activeSubscriptions: 1,
      dueSubscriptions: 1,
      autopayEnabled: 1,
      monthlyRecurringCents: 90000,
    })
  })
})
