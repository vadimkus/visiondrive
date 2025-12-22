import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession, assertRole } from '@/lib/portal/session'

function parseDate(input: string | null, fallback: Date) {
  if (!input) return fallback
  const d = new Date(input)
  return Number.isNaN(d.getTime()) ? fallback : d
}

export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)
    assertRole(session, ['MASTER_ADMIN'])

    const { searchParams } = new URL(request.url)
    const tenantIdParam = (searchParams.get('tenantId') || '').trim()
    const tenantId = tenantIdParam && tenantIdParam !== 'all' ? tenantIdParam : null

    const end = parseDate(searchParams.get('end'), new Date())
    const start = parseDate(searchParams.get('start'), new Date(end.getTime() - 30 * 24 * 3600 * 1000))

    // Revenue/refunds from Stripe events
    const [rev] = await sql/*sql*/`
      SELECT
        COALESCE(SUM(CASE WHEN type IN ('invoice.paid','invoice.payment_succeeded','checkout.session.completed') THEN COALESCE("amountCents",0) ELSE 0 END),0)::bigint AS "grossRevenueCents",
        COALESCE(SUM(CASE WHEN type IN ('charge.refunded') THEN COALESCE("amountCents",0) ELSE 0 END),0)::bigint AS "refundsCents",
        COALESCE(COUNT(*) FILTER (WHERE type IN ('invoice.paid','invoice.payment_succeeded')),0)::int AS "invoicesPaid"
      FROM billing_events
      WHERE provider = 'STRIPE'
        AND "occurredAt" >= ${start}
        AND "occurredAt" <= ${end}
        AND (${tenantId}::text IS NULL OR "tenantId" = ${tenantId})
    `

    // Active subs / MRR
    const [subs] = await sql/*sql*/`
      SELECT
        COALESCE(SUM(CASE WHEN status IN ('active','trialing') THEN "mrrCents" ELSE 0 END),0)::bigint AS "mrrCents",
        COALESCE(COUNT(*) FILTER (WHERE status IN ('active','trialing')),0)::int AS "activeSubs",
        COALESCE(COUNT(*) FILTER (WHERE status IN ('canceled','unpaid','incomplete_expired') AND "canceledAt" >= ${start} AND "canceledAt" <= ${end}),0)::int AS "churnedSubs"
      FROM billing_subscriptions
      WHERE provider = 'STRIPE'
        AND (${tenantId}::text IS NULL OR "tenantId" = ${tenantId})
    `

    // Expenses
    const [exp] = await sql/*sql*/`
      SELECT COALESCE(SUM("amountCents"),0)::bigint AS "expensesCents"
      FROM expenses
      WHERE "occurredAt" >= ${start}
        AND "occurredAt" <= ${end}
        AND (${tenantId}::text IS NULL OR "tenantId" = ${tenantId})
    `

    const grossRevenueCents = Number(rev?.grossRevenueCents || 0)
    const refundsCents = Number(rev?.refundsCents || 0)
    const netRevenueCents = grossRevenueCents - refundsCents
    const expensesCents = Number(exp?.expensesCents || 0)
    const profitCents = netRevenueCents - expensesCents

    const mrrCents = Number(subs?.mrrCents || 0)
    const arrCents = mrrCents * 12

    const churnRate = (() => {
      const active = Number(subs?.activeSubs || 0)
      const churned = Number(subs?.churnedSubs || 0)
      if (active <= 0) return 0
      return Number(((churned / active) * 100).toFixed(2))
    })()

    // Breakdown: expenses by category
    const expCats = await sql/*sql*/`
      SELECT category, COALESCE(SUM("amountCents"),0)::bigint AS cents
      FROM expenses
      WHERE "occurredAt" >= ${start}
        AND "occurredAt" <= ${end}
        AND (${tenantId}::text IS NULL OR "tenantId" = ${tenantId})
      GROUP BY category
      ORDER BY cents DESC
    `

    // Trend: revenue and expenses per day (simple)
    const trend = await sql/*sql*/`
      WITH days AS (
        SELECT generate_series(date_trunc('day', ${start}::timestamptz), date_trunc('day', ${end}::timestamptz), interval '1 day') AS day
      ),
      r AS (
        SELECT date_trunc('day',"occurredAt") AS day,
               SUM(CASE WHEN type IN ('invoice.paid','invoice.payment_succeeded','checkout.session.completed') THEN COALESCE("amountCents",0) ELSE 0 END)::bigint AS revenue,
               SUM(CASE WHEN type IN ('charge.refunded') THEN COALESCE("amountCents",0) ELSE 0 END)::bigint AS refunds
        FROM billing_events
        WHERE provider='STRIPE'
          AND "occurredAt" >= ${start}
          AND "occurredAt" <= ${end}
          AND (${tenantId}::text IS NULL OR "tenantId" = ${tenantId})
        GROUP BY 1
      ),
      e AS (
        SELECT date_trunc('day',"occurredAt") AS day,
               SUM("amountCents")::bigint AS expenses
        FROM expenses
        WHERE "occurredAt" >= ${start}
          AND "occurredAt" <= ${end}
          AND (${tenantId}::text IS NULL OR "tenantId" = ${tenantId})
        GROUP BY 1
      )
      SELECT d.day,
             COALESCE(r.revenue,0)::bigint AS revenue,
             COALESCE(r.refunds,0)::bigint AS refunds,
             COALESCE(e.expenses,0)::bigint AS expenses
      FROM days d
      LEFT JOIN r ON r.day = d.day
      LEFT JOIN e ON e.day = d.day
      ORDER BY d.day ASC
    `

    return NextResponse.json({
      success: true,
      range: { start: start.toISOString(), end: end.toISOString() },
      kpis: {
        grossRevenueCents,
        refundsCents,
        netRevenueCents,
        expensesCents,
        profitCents,
        mrrCents,
        arrCents,
        activeSubs: Number(subs?.activeSubs || 0),
        churnedSubs: Number(subs?.churnedSubs || 0),
        churnRatePct: churnRate,
        invoicesPaid: Number(rev?.invoicesPaid || 0),
      },
      breakdown: {
        expensesByCategory: (expCats || []).map((r: any) => ({ category: r.category, cents: Number(r.cents || 0) })),
      },
      trend: (trend || []).map((t: any) => ({
        day: new Date(t.day).toISOString(),
        revenueCents: Number(t.revenue || 0),
        refundsCents: Number(t.refunds || 0),
        expensesCents: Number(t.expenses || 0),
      })),
    })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


