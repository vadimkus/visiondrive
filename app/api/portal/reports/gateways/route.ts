import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession } from '@/lib/portal/session'

function csvEscape(v: any) {
  const s = String(v ?? '')
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)
    const { searchParams } = new URL(request.url)
    const format = (searchParams.get('format') || '').trim().toLowerCase()
    const zoneIdParam = (searchParams.get('zoneId') || '').trim()
    const zoneId = zoneIdParam && zoneIdParam !== 'all' ? zoneIdParam : null
    const limit = Math.min(200, Math.max(20, Number(searchParams.get('limit') || 100)))

    const rows = await sql/*sql*/`
      SELECT
        g.id,
        g.name,
        g.serial,
        g.model,
        g.firmware,
        g.status,
        g.backhaul,
        g."lastHeartbeat",
        g.lat,
        g.lng,
        g."siteId",
        si.name AS "siteName",
        (SELECT COUNT(*)::int FROM sensor_events e WHERE e."tenantId" = ${session.tenantId} AND e."gatewayId" = g.id AND e.time > now() - interval '24 hours') AS "events24h",
        (SELECT AVG(e.rssi)::float FROM sensor_events e WHERE e."tenantId" = ${session.tenantId} AND e."gatewayId" = g.id AND e.time > now() - interval '24 hours') AS "avgRssi24h",
        (SELECT AVG(e.snr)::float FROM sensor_events e WHERE e."tenantId" = ${session.tenantId} AND e."gatewayId" = g.id AND e.time > now() - interval '24 hours') AS "avgSnr24h",
        (SELECT COUNT(DISTINCT e."sensorId")::int FROM sensor_events e
           JOIN sensors s ON s.id = e."sensorId"
           WHERE e."tenantId" = ${session.tenantId}
             AND e."gatewayId" = g.id
             AND e.time > now() - interval '24 hours'
             AND s."bayId" IS NOT NULL
             AND (${zoneId}::text IS NULL OR s."zoneId" = ${zoneId})
        ) AS "uniqueSensors24h",
        (SELECT COUNT(*)::int FROM alerts a WHERE a."tenantId" = ${session.tenantId} AND a."gatewayId" = g.id AND a.status IN ('OPEN','ACKNOWLEDGED')) AS "openAlerts",
        (SELECT COUNT(*)::int FROM alerts a WHERE a."tenantId" = ${session.tenantId} AND a."gatewayId" = g.id AND a.status IN ('OPEN','ACKNOWLEDGED') AND a.severity = 'CRITICAL') AS "criticalAlerts"
      FROM gateways g
      LEFT JOIN sites si ON si.id = g."siteId"
      WHERE g."tenantId" = ${session.tenantId}
      ORDER BY "criticalAlerts" DESC, "openAlerts" DESC, "events24h" DESC, g.name ASC
      LIMIT ${limit}
    `

    const items = (rows || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      serial: r.serial || null,
      model: r.model || null,
      firmware: r.firmware || null,
      status: r.status,
      backhaul: r.backhaul,
      lastHeartbeat: r.lastHeartbeat ? new Date(r.lastHeartbeat).toISOString() : null,
      lat: typeof r.lat === 'number' ? r.lat : null,
      lng: typeof r.lng === 'number' ? r.lng : null,
      siteId: r.siteId || null,
      siteName: r.siteName || null,
      events24h: r.events24h || 0,
      uniqueSensors24h: r.uniqueSensors24h || 0,
      avgRssi24h: typeof r.avgRssi24h === 'number' ? r.avgRssi24h : null,
      avgSnr24h: typeof r.avgSnr24h === 'number' ? r.avgSnr24h : null,
      alerts: { open: r.openAlerts || 0, critical: r.criticalAlerts || 0 },
    }))

    if (format === 'csv') {
      const headers = [
        'name',
        'serial',
        'status',
        'backhaul',
        'siteName',
        'events24h',
        'uniqueSensors24h',
        'avgRssi24h',
        'avgSnr24h',
        'openAlerts',
        'criticalAlerts',
        'lastHeartbeat',
        'lat',
        'lng',
      ]
      const lines = [
        headers.join(','),
        ...items.map((g: any) =>
          [
            g.name,
            g.serial || '',
            g.status,
            g.backhaul,
            g.siteName || '',
            g.events24h,
            g.uniqueSensors24h,
            g.avgRssi24h ?? '',
            g.avgSnr24h ?? '',
            g.alerts.open,
            g.alerts.critical,
            g.lastHeartbeat || '',
            g.lat ?? '',
            g.lng ?? '',
          ].map(csvEscape).join(',')
        ),
      ].join('\n')
      return new NextResponse(lines, {
        headers: {
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition': `attachment; filename="gateway-health.csv"`,
        },
      })
    }

    // Coverage panels (basic): distribution by site and backhaul
    const coverage = await sql/*sql*/`
      SELECT
        COALESCE(si.name, 'Unassigned') AS "siteName",
        COUNT(*)::int AS "gateways",
        SUM(CASE WHEN g."lastHeartbeat" IS NOT NULL AND g."lastHeartbeat" > now() - interval '15 minutes' THEN 1 ELSE 0 END)::int AS "online15m",
        SUM(CASE WHEN g."lastHeartbeat" IS NULL OR g."lastHeartbeat" <= now() - interval '15 minutes' THEN 1 ELSE 0 END)::int AS "offline15m"
      FROM gateways g
      LEFT JOIN sites si ON si.id = g."siteId"
      WHERE g."tenantId" = ${session.tenantId}
      GROUP BY "siteName"
      ORDER BY gateways DESC
    `

    const backhaul = await sql/*sql*/`
      SELECT backhaul, COUNT(*)::int AS count
      FROM gateways
      WHERE "tenantId" = ${session.tenantId}
      GROUP BY backhaul
      ORDER BY count DESC
    `

    return NextResponse.json({ success: true, items, coverage: { bySite: coverage || [], byBackhaul: backhaul || [] } })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}



