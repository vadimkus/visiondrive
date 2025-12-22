import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession, assertRole } from '@/lib/portal/session'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePortalSession(request)
    assertRole(session, ['MASTER_ADMIN', 'ADMIN', 'CUSTOMER_ADMIN'])
    const { id } = await params

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

    return NextResponse.json({ success: true })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
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

    await sql/*sql*/`
      DELETE FROM report_subscriptions
      WHERE id = ${id} AND "tenantId" = ${session.tenantId}
    `

    return NextResponse.json({ success: true })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


