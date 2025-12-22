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
    assertRole(session, ['MASTER_ADMIN', 'CUSTOMER_ADMIN'])

    const { searchParams } = new URL(request.url)
    const tenantIdParam = (searchParams.get('tenantId') || '').trim()
    const requestedTenantId = tenantIdParam && tenantIdParam !== 'all' ? tenantIdParam : null
    const tenantId = session.role === 'MASTER_ADMIN' ? requestedTenantId : session.tenantId

    const end = parseDate(searchParams.get('end'), new Date())
    const start = parseDate(searchParams.get('start'), new Date(end.getTime() - 7 * 24 * 3600 * 1000))
    const limit = Math.min(500, Math.max(20, Number(searchParams.get('limit') || 200)))
    const offset = Math.max(0, Number(searchParams.get('offset') || 0))

    const action = (searchParams.get('action') || '').trim()
    const entityType = (searchParams.get('entityType') || '').trim()
    const entityId = (searchParams.get('entityId') || '').trim()
    const actor = (searchParams.get('actor') || '').trim() // email substring

    const rows = await sql/*sql*/`
      SELECT
        a.id,
        a."tenantId",
        t.name AS "tenantName",
        a."actorUserId",
        u.email AS "actorEmail",
        a.action,
        a."entityType",
        a."entityId",
        a.before,
        a.after,
        a.ip,
        a."userAgent",
        a."createdAt"
      FROM audit_logs a
      LEFT JOIN users u ON u.id = a."actorUserId"
      LEFT JOIN tenants t ON t.id = a."tenantId"
      WHERE a."createdAt" >= ${start}
        AND a."createdAt" <= ${end}
        AND (${tenantId}::text IS NULL OR a."tenantId" = ${tenantId})
        AND (${action} = '' OR a.action ILIKE ${'%' + action + '%'})
        AND (${entityType} = '' OR a."entityType" ILIKE ${'%' + entityType + '%'})
        AND (${entityId} = '' OR COALESCE(a."entityId",'') ILIKE ${'%' + entityId + '%'})
        AND (${actor} = '' OR COALESCE(u.email,'') ILIKE ${'%' + actor + '%'})
      ORDER BY a."createdAt" DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    return NextResponse.json({
      success: true,
      items: (rows || []).map((r: any) => ({
        id: r.id,
        tenantId: r.tenantId || null,
        tenantName: r.tenantName || null,
        actorUserId: r.actorUserId || null,
        actorEmail: r.actorEmail || null,
        action: r.action,
        entityType: r.entityType,
        entityId: r.entityId || null,
        before: r.before ?? null,
        after: r.after ?? null,
        ip: r.ip || null,
        userAgent: r.userAgent || null,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
      })),
      page: { limit, offset },
      range: { start: start.toISOString(), end: end.toISOString() },
    })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


