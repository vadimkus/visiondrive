export const DISCOUNT_RULE_TYPES = ['PERCENT', 'FIXED'] as const

export type DiscountRuleType = (typeof DISCOUNT_RULE_TYPES)[number]

export type DiscountRuleLike = {
  id?: string | null
  name: string
  type: string
  percentBps: number
  fixedCents: number
  active: boolean
}

export function normalizeDiscountRuleName(value: unknown) {
  const name = String(value ?? '').trim().replace(/\s+/g, ' ')
  return name ? name.slice(0, 120) : null
}

export function normalizeDiscountRuleType(value: unknown): DiscountRuleType | null {
  const type = String(value ?? '').trim().toUpperCase()
  return DISCOUNT_RULE_TYPES.includes(type as DiscountRuleType) ? (type as DiscountRuleType) : null
}

export function normalizeDiscountPercentBps(value: unknown) {
  const percentBps = Number(value)
  if (!Number.isFinite(percentBps) || percentBps < 0 || percentBps > 10_000) return null
  return Math.round(percentBps)
}

export function normalizeDiscountFixedCents(value: unknown) {
  const cents = Number(value)
  if (!Number.isFinite(cents) || cents < 0 || cents > 1_000_000_000) return null
  return Math.round(cents)
}

export function normalizeDiscountReason(value: unknown) {
  const reason = String(value ?? '').trim().replace(/\s+/g, ' ')
  return reason ? reason.slice(0, 500) : null
}

export function calculateDiscountCents(
  baseCents: number,
  rule: Pick<DiscountRuleLike, 'type' | 'percentBps' | 'fixedCents' | 'active'> | null | undefined
) {
  if (!rule?.active) return 0
  const base = Math.max(0, Math.round(baseCents))
  if (base === 0) return 0
  if (rule.type === 'FIXED') return Math.min(base, Math.max(0, Math.round(rule.fixedCents)))
  return Math.min(base, Math.round((base * Math.max(0, Math.round(rule.percentBps))) / 10_000))
}

export function discountRuleSummary(rule: Pick<DiscountRuleLike, 'type' | 'percentBps' | 'fixedCents' | 'active'>) {
  if (!rule.active) return 'Off'
  if (rule.type === 'FIXED') return (Math.max(0, rule.fixedCents) / 100).toFixed(2)
  return `${(Math.max(0, rule.percentBps) / 100).toFixed(2).replace(/\.00$/, '')}%`
}

export function validateDiscountApplication({
  discountCents,
  discountReason,
}: {
  discountCents: number
  discountReason?: string | null
}) {
  if (!Number.isInteger(discountCents) || discountCents < 0) return 'discountCents must be a non-negative integer'
  if (discountCents > 0 && !normalizeDiscountReason(discountReason)) return 'discountReason is required when discount is applied'
  return null
}
