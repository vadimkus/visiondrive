import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession } from '@/lib/portal/session'

export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)
    const { searchParams } = new URL(request.url)

    const statusParam = (searchParams.get('status') || '').trim().toUpperCase()
    const typeParam = (searchParams.get('type') || '').trim().toUpperCase()
    const severityParam = (searchParams.get('severity') || '').trim().toUpperCase()
    const status = statusParam ? statusParam : null
    const type = typeParam ? typeParam : null
    const severity = severityParam ? severityParam : null
    const zoneIdParam = (searchParams.get('zoneId') || '').trim()
    const zoneId = zoneIdParam && zoneIdParam !== 'all' ? zoneIdParam : null
    const sensorId = (searchParams.get('sensorId') || '').trim() || null
    const q = (searchParams.get('q') || '').trim()
    const limit = Math.min(500, Math.max(20, Number(searchParams.get('limit') || 200)))

    const rows = await sql/*sql*/`
      SELECT
        a.id,
        a.type,
        a.severity,
        a.status,
        a.title,
        a.message,
        a.meta,
        a."openedAt",
        a."firstDetectedAt",
        a."lastDetectedAt",
        a."acknowledgedAt",
        a."acknowledgedByUserId",
        au.email AS "acknowledgedByEmail",
        a."assignedToUserId",
        asu.email AS "assignedToEmail",
        a."resolvedAt",
        a."slaDueAt",
        a."sensorId",
        s."devEui",
        s."bayId",
        b.code AS "bayCode",
        s."zoneId" AS "sensorZoneId",
        z.name AS "zoneName",
        si.name AS "siteName"
      FROM alerts a
      LEFT JOIN sensors s ON s.id = a."sensorId"
      LEFT JOIN bays b ON b.id = s."bayId"
      LEFT JOIN zones z ON z.id = COALESCE(a."zoneId", s."zoneId")
      LEFT JOIN sites si ON si.id = a."siteId"
      LEFT JOIN users au ON au.id = a."acknowledgedByUserId"
      LEFT JOIN users asu ON asu.id = a."assignedToUserId"
      WHERE a."tenantId" = ${session.tenantId}
        AND (${zoneId}::text IS NULL OR COALESCE(a."zoneId", s."zoneId") = ${zoneId})
        AND (${sensorId}::text IS NULL OR a."sensorId" = ${sensorId})
        AND (${status}::text IS NULL OR a.status = ${status}::"AlertStatus")
        AND (${type}::text IS NULL OR a.type = ${type}::"AlertType")
        AND (${severity}::text IS NULL OR a.severity = ${severity}::"AlertSeverity")
        AND (${q}::text = '' OR a.title ILIKE ${'%' + q + '%'} OR COALESCE(s."devEui",'') ILIKE ${'%' + q + '%'} OR COALESCE(b.code,'') ILIKE ${'%' + q + '%'})
      ORDER BY
        CASE a.status WHEN 'OPEN' THEN 0 WHEN 'ACKNOWLEDGED' THEN 1 ELSE 2 END,
        CASE a.severity WHEN 'CRITICAL' THEN 0 WHEN 'WARNING' THEN 1 ELSE 2 END,
        a."lastDetectedAt" DESC
      LIMIT ${limit}
    `

    return NextResponse.json({
      success: true,
      items: (rows || []).map((r: any) => ({
        id: r.id,
        type: r.type,
        severity: r.severity,
        status: r.status,
        title: r.title,
        message: r.message,
        meta: r.meta,
        openedAt: r.openedAt ? new Date(r.openedAt).toISOString() : null,
        firstDetectedAt: r.firstDetectedAt ? new Date(r.firstDetectedAt).toISOString() : null,
        lastDetectedAt: r.lastDetectedAt ? new Date(r.lastDetectedAt).toISOString() : null,
        acknowledgedAt: r.acknowledgedAt ? new Date(r.acknowledgedAt).toISOString() : null,
        acknowledgedByUserId: r.acknowledgedByUserId || null,
        acknowledgedByEmail: r.acknowledgedByEmail || null,
        assignedToUserId: r.assignedToUserId || null,
        assignedToEmail: r.assignedToEmail || null,
        resolvedAt: r.resolvedAt ? new Date(r.resolvedAt).toISOString() : null,
        slaDueAt: r.slaDueAt ? new Date(r.slaDueAt).toISOString() : null,
        sensor: r.sensorId
          ? {
              id: r.sensorId,
              devEui: r.devEui || '',
              bayCode: r.bayCode || null,
              zoneId: r.sensorZoneId || null,
              zoneName: r.zoneName || null,
              siteName: r.siteName || null,
            }
          : null,
      })),
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


