import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { sql } from '@/lib/sql'
import { requirePortalSession, assertRole } from '@/lib/portal/session'
import { writeAuditLog } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)
    assertRole(session, ['MASTER_ADMIN', 'ADMIN', 'CUSTOMER_ADMIN'])

    const rows = await sql/*sql*/`
      SELECT
        s.id,
        s.name,
        s.kind,
        s.cadence,
        s.timezone,
        s.recipients,
        s.params,
        s.enabled,
        s."lastRunAt",
        s."nextRunAt",
        s."createdAt",
        s."updatedAt"
      FROM report_subscriptions s
      WHERE s."tenantId" = ${session.tenantId}
      ORDER BY s."createdAt" DESC
      LIMIT 200
    `

    return NextResponse.json({
      success: true,
      items: (rows || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        kind: r.kind,
        cadence: r.cadence,
        timezone: r.timezone || null,
        recipients: r.recipients || null,
        params: r.params || null,
        enabled: !!r.enabled,
        lastRunAt: r.lastRunAt ? new Date(r.lastRunAt).toISOString() : null,
        nextRunAt: r.nextRunAt ? new Date(r.nextRunAt).toISOString() : null,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
        updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : null,
      })),
    })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)
    assertRole(session, ['MASTER_ADMIN', 'ADMIN', 'CUSTOMER_ADMIN'])

    const body = await request.json().catch(() => ({}))
    const name = String(body?.name || '').trim()
    const kind = String(body?.kind || '').trim()
    const cadence = String(body?.cadence || '').trim()
    const timezone = typeof body?.timezone === 'string' ? body.timezone.trim() : null
    const recipients = typeof body?.recipients === 'undefined' ? null : body.recipients
    const params = typeof body?.params === 'undefined' ? null : body.params
    const enabled = typeof body?.enabled === 'boolean' ? body.enabled : true

    if (!name || !kind || !cadence) return NextResponse.json({ success: false, error: 'name, kind, cadence are required' }, { status: 400 })

    const id = randomUUID()
    await sql/*sql*/`
      INSERT INTO report_subscriptions (
        id,
        "tenantId",
        name,
        kind,
        cadence,
        timezone,
        recipients,
        params,
        enabled,
        "createdByUserId",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${id},
        ${session.tenantId},
        ${name},
        ${kind}::"ReportKind",
        ${cadence}::"ReportCadence",
        ${timezone},
        ${recipients === null ? null : (sql.json(recipients) as any)},
        ${params === null ? null : (sql.json(params) as any)},
        ${enabled},
        ${session.userId},
        now(),
        now()
      )
    `

    await writeAuditLog({
      request,
      session,
      action: 'REPORT_SUBSCRIPTION_CREATE',
      entityType: 'ReportSubscription',
      entityId: id,
      before: null,
      after: { id, tenantId: session.tenantId, name, kind, cadence, timezone, enabled },
    })

    return NextResponse.json({ success: true, id })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


