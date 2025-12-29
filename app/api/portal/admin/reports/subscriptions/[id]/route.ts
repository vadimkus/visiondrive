import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession, assertRole } from '@/lib/portal/session'
import { writeAuditLog } from '@/lib/audit'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePortalSession(request)
    assertRole(session, ['MASTER_ADMIN', 'ADMIN', 'CUSTOMER_ADMIN'])
    const { id } = await params

    const beforeRows = await sql/*sql*/`
      SELECT id, name, enabled, timezone, recipients, params
      FROM report_subscriptions
      WHERE id = ${id} AND "tenantId" = ${session.tenantId}
      LIMIT 1
    `
    const before = beforeRows?.[0] || null

    const body = await request.json().catch(() => ({}))
    const name = typeof body?.name === 'string' ? body.name.trim() : null
    const enabled = typeof body?.enabled === 'boolean' ? body.enabled : null
    const timezone = typeof body?.timezone === 'string' ? body.timezone.trim() : null
    const recipients = typeof body?.recipients === 'undefined' ? undefined : body.recipients
    const paramsJson = typeof body?.params === 'undefined' ? undefined : body.params

    await sql/*sql*/`
      UPDATE report_subscriptions
      SET
        name = COALESCE(${name}, name),
        enabled = COALESCE(${enabled}, enabled),
        timezone = COALESCE(${timezone}, timezone),
        recipients = CASE
          WHEN ${typeof recipients === 'undefined'} THEN recipients
          WHEN ${recipients === null} THEN NULL
          ELSE ${sql.json(recipients as any) as any}
        END,
        params = CASE
          WHEN ${typeof paramsJson === 'undefined'} THEN params
          WHEN ${paramsJson === null} THEN NULL
          ELSE ${sql.json(paramsJson as any) as any}
        END,
        "updatedAt" = now()
      WHERE id = ${id} AND "tenantId" = ${session.tenantId}
    `

    await writeAuditLog({
      request,
      session,
      action: 'REPORT_SUBSCRIPTION_UPDATE',
      entityType: 'ReportSubscription',
      entityId: id,
      before,
      after: { name, enabled, timezone, recipients, params: paramsJson },
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
    assertRole(session, ['MASTER_ADMIN', 'ADMIN', 'CUSTOMER_ADMIN'])
    const { id } = await params

    const beforeRows = await sql/*sql*/`
      SELECT id, name, kind, cadence, enabled
      FROM report_subscriptions
      WHERE id = ${id} AND "tenantId" = ${session.tenantId}
      LIMIT 1
    `
    const before = beforeRows?.[0] || null

    await sql/*sql*/`
      DELETE FROM report_subscriptions
      WHERE id = ${id} AND "tenantId" = ${session.tenantId}
    `

    await writeAuditLog({
      request,
      session,
      action: 'REPORT_SUBSCRIPTION_DELETE',
      entityType: 'ReportSubscription',
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


