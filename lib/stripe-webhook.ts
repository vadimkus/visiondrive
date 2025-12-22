import { createHmac, timingSafeEqual } from 'crypto'

export function verifyStripeSignature(params: {
  payload: string
  signatureHeader: string | null
  webhookSecret: string
  toleranceSeconds?: number
}) {
  const { payload, signatureHeader, webhookSecret } = params
  if (!signatureHeader) return false
  const parts = signatureHeader.split(',').map((p) => p.trim())
  const tPart = parts.find((p) => p.startsWith('t='))
  const v1Parts = parts.filter((p) => p.startsWith('v1='))
  const t = tPart?.slice(2)
  if (!t || v1Parts.length === 0) return false

  // Replay protection: require timestamp within tolerance.
  const tolerance = typeof params.toleranceSeconds === 'number' ? params.toleranceSeconds : 300
  const tNum = Number(t)
  if (!Number.isFinite(tNum)) return false
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - tNum) > tolerance) return false

  const signedPayload = `${t}.${payload}`
  const expected = createHmac('sha256', webhookSecret).update(signedPayload, 'utf8').digest('hex')

  // compare against any v1 signatures
  for (const v1 of v1Parts) {
    const sig = v1.slice(3)
    if (sig.length !== expected.length) continue
    try {
      const a = Buffer.from(sig, 'utf8')
      const b = Buffer.from(expected, 'utf8')
      if (a.length === b.length && timingSafeEqual(a, b)) return true
    } catch {
      // ignore
    }
  }
  return false
}

export function extractTenantIdFromStripeObject(obj: any): string | null {
  const t = obj?.metadata?.tenantId || obj?.metadata?.tenant_id || null
  if (!t) return null
  const s = String(t).trim()
  return s ? s : null
}

export function calcSubscriptionMrrCents(subscription: any): { mrrCents: number; currency: string | null; interval: string | null; intervalCount: number | null } {
  // Stripe subscription contains items.data[].price.unit_amount and recurring interval.
  const item = subscription?.items?.data?.[0]
  const qty = Number(item?.quantity || 1)
  const unit = typeof item?.price?.unit_amount === 'number' ? item.price.unit_amount : null
  const currency = item?.price?.currency ? String(item.price.currency).toUpperCase() : null
  const interval = item?.price?.recurring?.interval ? String(item.price.recurring.interval) : null
  const intervalCount = typeof item?.price?.recurring?.interval_count === 'number' ? item.price.recurring.interval_count : null

  if (unit === null || !interval) return { mrrCents: 0, currency, interval, intervalCount }
  const total = Math.max(0, Math.round(unit * qty))

  // Convert to monthly equivalent.
  // month => 1x, year => /12. If interval_count exists, scale accordingly.
  const count = intervalCount && intervalCount > 0 ? intervalCount : 1
  if (interval === 'month') return { mrrCents: Math.round(total / count), currency, interval, intervalCount: count }
  if (interval === 'year') return { mrrCents: Math.round(total / (12 * count)), currency, interval, intervalCount: count }
  // week/day are rare for subscriptions; approximate to month
  if (interval === 'week') return { mrrCents: Math.round((total / count) * (52 / 12)), currency, interval, intervalCount: count }
  if (interval === 'day') return { mrrCents: Math.round((total / count) * 30), currency, interval, intervalCount: count }
  return { mrrCents: 0, currency, interval, intervalCount: count }
}


