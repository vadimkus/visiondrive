import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession, assertRole } from '@/lib/portal/session'
import { writeAuditLog } from '@/lib/audit'

const ALLOWED_CATEGORIES = new Set(['CLOUD', 'HARDWARE', 'OPS', 'SUPPORT', 'MARKETING', 'SOFTWARE', 'OTHER'])

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePortalSession(request)
    assertRole(session, ['MASTER_ADMIN'])
    const { id } = await params

    const beforeRows = await sql/*sql*/`
      SELECT id, "tenantId", category, vendor, description, "amountCents", currency, "occurredAt"
      FROM expenses
      WHERE id = ${id}
      LIMIT 1
    `
    const before = beforeRows?.[0] || null

    const body = await request.json().catch(() => ({}))
    const category = typeof body?.category === 'string' ? body.category.trim().toUpperCase() : null
    const vendor = typeof body?.vendor === 'string' ? body.vendor.trim() : null
    const description = typeof body?.description === 'string' ? body.description.trim() : null
    const currency = typeof body?.currency === 'string' ? body.currency.trim().toUpperCase() : null
    const amountCents = typeof body?.amountCents === 'number' ? Number(body.amountCents) : null
    const occurredAt = typeof body?.occurredAt === 'string' ? new Date(body.occurredAt) : null

    if (category !== null && !ALLOWED_CATEGORIES.has(category)) {
      return NextResponse.json({ success: false, error: 'Invalid category' }, { status: 400 })
    }
    if (currency !== null && !/^[A-Z]{3}$/.test(currency)) {
      return NextResponse.json({ success: false, error: 'Invalid currency (3-letter code)' }, { status: 400 })
    }
    if (occurredAt && Number.isNaN(occurredAt.getTime())) {
      return NextResponse.json({ success: false, error: 'Invalid occurredAt' }, { status: 400 })
    }
    if (amountCents !== null && (!Number.isFinite(amountCents) || amountCents <= 0)) {
      return NextResponse.json({ success: false, error: 'amountCents must be > 0' }, { status: 400 })
    }

    await sql/*sql*/`
      UPDATE expenses
      SET
        category = COALESCE(${category as any}::"ExpenseCategory", category),
        vendor = COALESCE(${vendor}, vendor),
        description = COALESCE(${description}, description),
        currency = COALESCE(${currency}, currency),
        "amountCents" = COALESCE(${amountCents}, "amountCents"),
        "occurredAt" = COALESCE(${occurredAt}, "occurredAt"),
        "updatedAt" = now()
      WHERE id = ${id}
    `

    await writeAuditLog({
      request,
      session,
      tenantId: before?.tenantId || null,
      action: 'EXPENSE_UPDATE',
      entityType: 'Expense',
      entityId: id,
      before,
      after: { category, vendor, description, currency, amountCents, occurredAt: occurredAt ? occurredAt.toISOString() : null },
    })
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePortalSession(request)
    assertRole(session, ['MASTER_ADMIN'])
    const { id } = await params

    const beforeRows = await sql/*sql*/`
      SELECT id, "tenantId", category, vendor, description, "amountCents", currency, "occurredAt"
      FROM expenses
      WHERE id = ${id}
      LIMIT 1
    `
    const before = beforeRows?.[0] || null

    await sql/*sql*/`DELETE FROM expenses WHERE id = ${id}`

    await writeAuditLog({
      request,
      session,
      tenantId: before?.tenantId || null,
      action: 'EXPENSE_DELETE',
      entityType: 'Expense',
      entityId: id,
      before,
      after: null,
    })
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


