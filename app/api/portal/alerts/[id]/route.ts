import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { sql } from '@/lib/sql'
import { requirePortalSession } from '@/lib/portal/session'

type Action = 'ACKNOWLEDGE' | 'ASSIGN_TO_ME' | 'RESOLVE'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePortalSession(request)
    const { id } = await params

    const body = await request.json().catch(() => ({}))
    const action = String(body?.action || '').trim().toUpperCase() as Action
    const note = typeof body?.note === 'string' ? body.note.trim() : null

    const rows = await sql/*sql*/`
      SELECT id, status
      FROM alerts
      WHERE id = ${id} AND "tenantId" = ${session.tenantId}
      LIMIT 1
    `
    const a = rows?.[0] || null
    if (!a) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    if (action === 'ACKNOWLEDGE') {
      await sql/*sql*/`
        UPDATE alerts
        SET status = CASE WHEN status = 'OPEN' THEN 'ACKNOWLEDGED' ELSE status END,
            "acknowledgedAt" = COALESCE("acknowledgedAt", now()),
            "acknowledgedByUserId" = COALESCE("acknowledgedByUserId", ${session.userId}),
            "updatedAt" = now()
        WHERE id = ${id} AND "tenantId" = ${session.tenantId}
      `
      await sql/*sql*/`
        INSERT INTO alert_events (id, "tenantId", "alertId", "actorUserId", action, note, "createdAt")
        VALUES (${randomUUID()}, ${session.tenantId}, ${id}, ${session.userId}, 'ACKNOWLEDGE', ${note}, now())
      `
    } else if (action === 'ASSIGN_TO_ME') {
      await sql/*sql*/`
        UPDATE alerts
        SET "assignedToUserId" = ${session.userId},
            "updatedAt" = now()
        WHERE id = ${id} AND "tenantId" = ${session.tenantId}
      `
      await sql/*sql*/`
        INSERT INTO alert_events (id, "tenantId", "alertId", "actorUserId", action, note, "createdAt")
        VALUES (${randomUUID()}, ${session.tenantId}, ${id}, ${session.userId}, 'ASSIGN_TO_ME', ${note}, now())
      `
    } else if (action === 'RESOLVE') {
      await sql/*sql*/`
        UPDATE alerts
        SET status = 'RESOLVED',
            "resolvedAt" = COALESCE("resolvedAt", now()),
            "updatedAt" = now()
        WHERE id = ${id} AND "tenantId" = ${session.tenantId}
      `
      await sql/*sql*/`
        INSERT INTO alert_events (id, "tenantId", "alertId", "actorUserId", action, note, "createdAt")
        VALUES (${randomUUID()}, ${session.tenantId}, ${id}, ${session.userId}, 'RESOLVE', ${note}, now())
      `
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


