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
    const limit = Math.min(500, Math.max(20, Number(searchParams.get('limit') || 200)))

    const rows = await sql/*sql*/`
      SELECT
        e.id,
        e."tenantId",
        t.name AS "tenantName",
        e.type,
        e."occurredAt",
        e."amountCents",
        e.currency,
        e.status,
        e."customerId",
        e."subscriptionId",
        e."invoiceId",
        e."providerEventId"
      FROM billing_events e
      LEFT JOIN tenants t ON t.id = e."tenantId"
      WHERE e.provider = 'STRIPE'
        AND e."occurredAt" >= ${start}
        AND e."occurredAt" <= ${end}
        AND (${tenantId}::text IS NULL OR e."tenantId" = ${tenantId})
      ORDER BY e."occurredAt" DESC
      LIMIT ${limit}
    `

    return NextResponse.json({
      success: true,
      items: (rows || []).map((r: any) => ({
        id: r.id,
        tenantId: r.tenantId || null,
        tenantName: r.tenantName || null,
        type: r.type,
        occurredAt: r.occurredAt ? new Date(r.occurredAt).toISOString() : null,
        amountCents: typeof r.amountCents === 'number' ? r.amountCents : null,
        currency: r.currency || null,
        status: r.status || null,
        customerId: r.customerId || null,
        subscriptionId: r.subscriptionId || null,
        invoiceId: r.invoiceId || null,
        providerEventId: r.providerEventId,
      })),
    })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


