import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession } from '@/lib/portal/session'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePortalSession(request)
    const { id } = await params

    const owner = await sql/*sql*/`
      SELECT id
      FROM alerts
      WHERE id = ${id} AND "tenantId" = ${session.tenantId}
      LIMIT 1
    `
    if (!owner?.[0]) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const rows = await sql/*sql*/`
      SELECT
        e.id,
        e.action,
        e.note,
        e.meta,
        e."createdAt",
        u.email AS "actorEmail"
      FROM alert_events e
      LEFT JOIN users u ON u.id = e."actorUserId"
      WHERE e."tenantId" = ${session.tenantId}
        AND e."alertId" = ${id}
      ORDER BY e."createdAt" DESC
      LIMIT 200
    `

    return NextResponse.json({
      success: true,
      items: (rows || []).map((r: any) => ({
        id: r.id,
        action: r.action,
        note: r.note,
        meta: r.meta,
        actorEmail: r.actorEmail || null,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
      })),
    })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}



