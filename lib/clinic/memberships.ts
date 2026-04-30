import { randomUUID } from 'crypto'

export type MembershipBillingInterval = 'MONTHLY'
export type MembershipSubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED'

export type MembershipPlan = {
  id: string
  name: string
  monthlyPriceCents: number
  currency: string
  includedSessions: number
  description: string | null
  active: boolean
  createdAt: string
}

export type MembershipSubscription = {
  id: string
  patientId: string
  planId: string
  status: MembershipSubscriptionStatus
  billingInterval: MembershipBillingInterval
  nextBillingAt: string
  autopayEnabled: boolean
  paymentMethod: string
  note: string | null
  startedAt: string
  lastChargePreparedAt: string | null
}

export type MembershipSettings = {
  memberships?: {
    plans?: MembershipPlan[]
    subscriptions?: MembershipSubscription[]
  }
}

export const MEMBERSHIP_PAYMENT_REFERENCE_PREFIX = 'MEMBERSHIP:'

export function emptyMembershipSettings() {
  return { plans: [], subscriptions: [] }
}

export function asMembershipSettings(value: unknown): MembershipSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as MembershipSettings
}

export function membershipDataFromThresholds(value: unknown) {
  const memberships = asMembershipSettings(value).memberships
  return {
    plans: Array.isArray(memberships?.plans) ? memberships.plans : [],
    subscriptions: Array.isArray(memberships?.subscriptions) ? memberships.subscriptions : [],
  }
}

export function normalizeMembershipAmountCents(value: unknown) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  return Math.round(parsed)
}

export function normalizeIncludedSessions(value: unknown) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  return Math.min(100, Math.round(parsed))
}

export function normalizeSubscriptionStatus(value: unknown): MembershipSubscriptionStatus {
  const text = String(value ?? '').trim().toUpperCase()
  if (text === 'PAUSED' || text === 'CANCELLED') return text
  return 'ACTIVE'
}

export function nextMonthlyBillingDate(from: Date) {
  const next = new Date(from)
  next.setMonth(next.getMonth() + 1)
  return next
}

export function membershipPaymentReference(subscriptionId: string, billingDate: Date) {
  return `${MEMBERSHIP_PAYMENT_REFERENCE_PREFIX}${subscriptionId}:${billingDate.toISOString().slice(0, 10)}`
}

export function buildMembershipPlan(input: {
  name: unknown
  monthlyPriceCents: unknown
  currency?: unknown
  includedSessions?: unknown
  description?: unknown
  now?: Date
}): MembershipPlan {
  const name = String(input.name ?? '').trim().slice(0, 120)
  if (!name) throw new Error('Plan name is required')
  const now = input.now ?? new Date()
  return {
    id: randomUUID(),
    name,
    monthlyPriceCents: normalizeMembershipAmountCents(input.monthlyPriceCents),
    currency: String(input.currency ?? 'AED').trim().toUpperCase() || 'AED',
    includedSessions: normalizeIncludedSessions(input.includedSessions),
    description: String(input.description ?? '').trim().slice(0, 500) || null,
    active: true,
    createdAt: now.toISOString(),
  }
}

export function buildMembershipSubscription(input: {
  patientId: unknown
  planId: unknown
  nextBillingAt?: unknown
  autopayEnabled?: unknown
  paymentMethod?: unknown
  note?: unknown
  now?: Date
}): MembershipSubscription {
  const patientId = String(input.patientId ?? '').trim()
  const planId = String(input.planId ?? '').trim()
  if (!patientId) throw new Error('Patient is required')
  if (!planId) throw new Error('Plan is required')
  const now = input.now ?? new Date()
  const parsedNext = input.nextBillingAt ? new Date(String(input.nextBillingAt)) : now
  const nextBillingAt = Number.isNaN(parsedNext.getTime()) ? now : parsedNext
  return {
    id: randomUUID(),
    patientId,
    planId,
    status: 'ACTIVE',
    billingInterval: 'MONTHLY',
    nextBillingAt: nextBillingAt.toISOString(),
    autopayEnabled: input.autopayEnabled === true,
    paymentMethod: String(input.paymentMethod ?? 'CARD').trim().toUpperCase() || 'CARD',
    note: String(input.note ?? '').trim().slice(0, 500) || null,
    startedAt: now.toISOString(),
    lastChargePreparedAt: null,
  }
}

export function dueMembershipSubscriptions(
  subscriptions: MembershipSubscription[],
  now = new Date()
) {
  return subscriptions.filter((subscription) => {
    if (subscription.status !== 'ACTIVE') return false
    const next = new Date(subscription.nextBillingAt)
    return !Number.isNaN(next.getTime()) && next.getTime() <= now.getTime()
  })
}

export function summarizeMemberships({
  plans,
  subscriptions,
  now = new Date(),
}: {
  plans: MembershipPlan[]
  subscriptions: MembershipSubscription[]
  now?: Date
}) {
  const activeSubscriptions = subscriptions.filter((subscription) => subscription.status === 'ACTIVE')
  const dueSubscriptions = dueMembershipSubscriptions(subscriptions, now)
  const monthlyRecurringCents = activeSubscriptions.reduce((total, subscription) => {
    const plan = plans.find((item) => item.id === subscription.planId && item.active)
    return total + (plan?.monthlyPriceCents ?? 0)
  }, 0)

  return {
    activePlans: plans.filter((plan) => plan.active).length,
    activeSubscriptions: activeSubscriptions.length,
    dueSubscriptions: dueSubscriptions.length,
    autopayEnabled: activeSubscriptions.filter((subscription) => subscription.autopayEnabled).length,
    monthlyRecurringCents,
  }
}
