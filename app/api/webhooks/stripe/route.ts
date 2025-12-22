import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { calcSubscriptionMrrCents, extractTenantIdFromStripeObject, verifyStripeSignature } from '@/lib/stripe-webhook'
import { randomUUID } from 'crypto'

// Stripe webhook for VisionDrive billing metrics ingestion.
// Env required:
// - STRIPE_WEBHOOK_SECRET
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET || ''
  if (!secret) {
    return NextResponse.json({ success: false, error: 'STRIPE_WEBHOOK_SECRET not configured' }, { status: 500 })
  }

  const signature = request.headers.get('stripe-signature')
  const payload = await request.text()

  const ok = verifyStripeSignature({ payload, signatureHeader: signature, webhookSecret: secret })
  if (!ok) {
    return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 })
  }

  let event: any
  try {
    event = JSON.parse(payload)
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const providerEventId = String(event?.id || '')
  const type = String(event?.type || '')
  const created = typeof event?.created === 'number' ? new Date(event.created * 1000) : new Date()
  const obj = event?.data?.object || {}
  const tenantId = extractTenantIdFromStripeObject(obj)

  // Extract common fields
  const currency = obj?.currency ? String(obj.currency).toUpperCase() : null
  const customerId = obj?.customer ? String(obj.customer) : null
  const subscriptionId =
    obj?.subscription ? String(obj.subscription) :
    obj?.id && (type.startsWith('customer.subscription') ? String(obj.id) : null)
  const invoiceId = type.startsWith('invoice.') && obj?.id ? String(obj.id) : null

  let amountCents: number | null = null
  let status: string | null = null

  // capture amounts for key event types
  if (type === 'invoice.paid' || type === 'invoice.payment_succeeded') {
    amountCents = typeof obj?.amount_paid === 'number' ? obj.amount_paid : (typeof obj?.amount_due === 'number' ? obj.amount_due : null)
    status = 'paid'
  } else if (type === 'invoice.payment_failed') {
    amountCents = typeof obj?.amount_due === 'number' ? obj.amount_due : null
    status = 'failed'
  } else if (type === 'checkout.session.completed') {
    amountCents = typeof obj?.amount_total === 'number' ? obj.amount_total : null
    status = 'completed'
  } else if (type === 'charge.refunded') {
    amountCents = typeof obj?.amount_refunded === 'number' ? obj.amount_refunded : null
    status = 'refunded'
  } else if (type.startsWith('customer.subscription')) {
    status = typeof obj?.status === 'string' ? obj.status : null
  }

  if (!providerEventId) {
    return NextResponse.json({ success: false, error: 'Missing event id' }, { status: 400 })
  }

  // Store raw event (idempotent on providerEventId)
  await sql/*sql*/`
    INSERT INTO billing_events (
      id,
      "tenantId",
      provider,
      "providerEventId",
      type,
      "occurredAt",
      "amountCents",
      currency,
      "customerId",
      "subscriptionId",
      "invoiceId",
      status,
      raw,
      "createdAt"
    )
    VALUES (
      ${randomUUID()},
      ${tenantId},
      'STRIPE',
      ${providerEventId},
      ${type},
      ${created},
      ${amountCents},
      ${currency},
      ${customerId},
      ${subscriptionId},
      ${invoiceId},
      ${status},
      ${sql.json(event) as any},
      now()
    )
    ON CONFLICT ("providerEventId") DO NOTHING
  `

  // Maintain subscription snapshot for MRR/ARR/churn
  if (type.startsWith('customer.subscription') && obj?.id) {
    const subId = String(obj.id)
    const subStatus = typeof obj?.status === 'string' ? obj.status : 'unknown'
    const cancelAtPeriodEnd = !!obj?.cancel_at_period_end
    const canceledAt = typeof obj?.canceled_at === 'number' ? new Date(obj.canceled_at * 1000) : null
    const cancelAt = typeof obj?.cancel_at === 'number' ? new Date(obj.cancel_at * 1000) : null
    const cps = typeof obj?.current_period_start === 'number' ? new Date(obj.current_period_start * 1000) : null
    const cpe = typeof obj?.current_period_end === 'number' ? new Date(obj.current_period_end * 1000) : null

    const m = calcSubscriptionMrrCents(obj)

    await sql/*sql*/`
      INSERT INTO billing_subscriptions (
        id,
        "tenantId",
        provider,
        "providerSubscriptionId",
        "customerId",
        status,
        currency,
        interval,
        "intervalCount",
        "mrrCents",
        "currentPeriodStart",
        "currentPeriodEnd",
        "cancelAt",
        "canceledAt",
        "cancelAtPeriodEnd",
        raw,
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${randomUUID()},
        ${tenantId},
        'STRIPE',
        ${subId},
        ${customerId},
        ${subStatus},
        ${m.currency},
        ${m.interval},
        ${m.intervalCount},
        ${m.mrrCents},
        ${cps},
        ${cpe},
        ${cancelAt},
        ${canceledAt},
        ${cancelAtPeriodEnd},
        ${sql.json(obj) as any},
        now(),
        now()
      )
      ON CONFLICT ("providerSubscriptionId") DO UPDATE
        SET "tenantId" = COALESCE(EXCLUDED."tenantId", billing_subscriptions."tenantId"),
            "customerId" = COALESCE(EXCLUDED."customerId", billing_subscriptions."customerId"),
            status = EXCLUDED.status,
            currency = EXCLUDED.currency,
            interval = EXCLUDED.interval,
            "intervalCount" = EXCLUDED."intervalCount",
            "mrrCents" = EXCLUDED."mrrCents",
            "currentPeriodStart" = EXCLUDED."currentPeriodStart",
            "currentPeriodEnd" = EXCLUDED."currentPeriodEnd",
            "cancelAt" = EXCLUDED."cancelAt",
            "canceledAt" = EXCLUDED."canceledAt",
            "cancelAtPeriodEnd" = EXCLUDED."cancelAtPeriodEnd",
            raw = EXCLUDED.raw,
            "updatedAt" = now()
    `
  }

  return NextResponse.json({ success: true })
}


