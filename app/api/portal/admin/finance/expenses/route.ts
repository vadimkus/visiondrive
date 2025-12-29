import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { sql } from '@/lib/sql'
import { requirePortalSession, assertRole } from '@/lib/portal/session'
import { writeAuditLog } from '@/lib/audit'

const ALLOWED_CATEGORIES = new Set(['CLOUD', 'HARDWARE', 'OPS', 'SUPPORT', 'MARKETING', 'SOFTWARE', 'OTHER'])

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
        e.category,
        e.vendor,
        e.description,
        e."amountCents",
        e.currency,
        e."occurredAt",
        e."createdAt",
        u.email AS "createdByEmail"
      FROM expenses e
      LEFT JOIN tenants t ON t.id = e."tenantId"
      LEFT JOIN users u ON u.id = e."createdByUserId"
      WHERE e."occurredAt" >= ${start}
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
        category: r.category,
        vendor: r.vendor || null,
        description: r.description || null,
        amountCents: Number(r.amountCents || 0),
        currency: r.currency || 'AED',
        occurredAt: r.occurredAt ? new Date(r.occurredAt).toISOString() : null,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
        createdByEmail: r.createdByEmail || null,
      })),
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)
    assertRole(session, ['MASTER_ADMIN'])

    const body = await request.json().catch(() => ({}))
    const tenantIdParam = typeof body?.tenantId === 'string' ? body.tenantId.trim() : ''
    const tenantId = tenantIdParam && tenantIdParam !== 'all' ? tenantIdParam : null
    const category = String(body?.category || 'OTHER').trim().toUpperCase()
    const vendor = typeof body?.vendor === 'string' ? body.vendor.trim() : null
    const description = typeof body?.description === 'string' ? body.description.trim() : null
    const currency = typeof body?.currency === 'string' ? body.currency.trim().toUpperCase() : 'AED'
    const amountCents = Number(body?.amountCents)
    const occurredAt = new Date(String(body?.occurredAt || ''))

    if (!ALLOWED_CATEGORIES.has(category)) {
      return NextResponse.json({ success: false, error: 'Invalid category' }, { status: 400 })
    }
    if (!/^[A-Z]{3}$/.test(currency)) {
      return NextResponse.json({ success: false, error: 'Invalid currency (3-letter code)' }, { status: 400 })
    }
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return NextResponse.json({ success: false, error: 'amountCents must be > 0' }, { status: 400 })
    }
    if (Number.isNaN(occurredAt.getTime())) {
      return NextResponse.json({ success: false, error: 'occurredAt is required (ISO date)' }, { status: 400 })
    }

    const id = randomUUID()
    await sql/*sql*/`
      INSERT INTO expenses (
        id,
        "tenantId",
        category,
        vendor,
        description,
        "amountCents",
        currency,
        "occurredAt",
        "createdByUserId",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${id},
        ${tenantId},
        ${category}::"ExpenseCategory",
        ${vendor},
        ${description},
        ${amountCents},
        ${currency},
        ${occurredAt},
        ${session.userId},
        now(),
        now()
      )
    `

    await writeAuditLog({
      request,
      session,
      tenantId,
      action: 'EXPENSE_CREATE',
      entityType: 'Expense',
      entityId: id,
      before: null,
      after: { id, tenantId, category, vendor, description, amountCents, currency, occurredAt: occurredAt.toISOString() },
    })

    return NextResponse.json({ success: true, id })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


