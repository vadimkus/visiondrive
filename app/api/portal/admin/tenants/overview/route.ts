import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession, assertRole } from '@/lib/portal/session'

export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)
    assertRole(session, ['MASTER_ADMIN'])

    const [k] = await sql/*sql*/`
      SELECT
        (SELECT COUNT(*)::int FROM tenants) AS "tenantsTotal",
        (SELECT COUNT(*)::int FROM tenants WHERE status = 'ACTIVE') AS "tenantsActive",
        (SELECT COUNT(*)::int FROM sites) AS "sitesTotal",
        (SELECT COUNT(*)::int FROM sensors WHERE "bayId" IS NOT NULL) AS "installedSensors",
        (SELECT COUNT(*)::int FROM sensors WHERE "bayId" IS NOT NULL AND "lastSeen" > now() - interval '60 minutes') AS "onlineSensors",
        (SELECT COUNT(*)::int FROM sensors WHERE "bayId" IS NOT NULL AND ("lastSeen" IS NULL OR "lastSeen" <= now() - interval '60 minutes')) AS "offlineSensors",
        (SELECT COUNT(*)::int FROM alerts WHERE status IN ('OPEN','ACKNOWLEDGED')) AS "openAlerts",
        (SELECT COUNT(*)::int FROM alerts WHERE status IN ('OPEN','ACKNOWLEDGED') AND severity = 'CRITICAL') AS "criticalAlerts",
        (SELECT (COUNT(*)::float / 5.0) FROM sensor_events WHERE time > now() - interval '5 minutes') AS "eventsPerMin5m"
    `

    const sites = await sql/*sql*/`
      SELECT
        si.id,
        si.name,
        si.address,
        si."centerLat",
        si."centerLng",
        si."tenantId",
        t.name AS "tenantName",
        (SELECT COUNT(*)::int FROM sensors s WHERE s."siteId" = si.id AND s."bayId" IS NOT NULL) AS "installedSensors",
        (SELECT COUNT(*)::int FROM sensors s WHERE s."siteId" = si.id AND s."bayId" IS NOT NULL AND s."lastSeen" > now() - interval '60 minutes') AS "onlineSensors",
        (SELECT COUNT(*)::int FROM sensors s WHERE s."siteId" = si.id AND s."bayId" IS NOT NULL AND (s."lastSeen" IS NULL OR s."lastSeen" <= now() - interval '60 minutes')) AS "offlineSensors",
        (SELECT COUNT(*)::int FROM alerts a WHERE a."siteId" = si.id AND a.status IN ('OPEN','ACKNOWLEDGED')) AS "openAlerts",
        (SELECT COUNT(*)::int FROM alerts a WHERE a."siteId" = si.id AND a.status IN ('OPEN','ACKNOWLEDGED') AND a.severity = 'CRITICAL') AS "criticalAlerts",
        (SELECT MAX(time) FROM sensor_events e WHERE e."siteId" = si.id) AS "lastEventTime"
      FROM sites si
      JOIN tenants t ON t.id = si."tenantId"
      ORDER BY si."createdAt" DESC
      LIMIT 2000
    `

    const topSensors = await sql/*sql*/`
      SELECT
        s.id,
        s."devEui",
        s."tenantId",
        t.name AS "tenantName",
        s."siteId",
        si.name AS "siteName",
        s."lastSeen",
        (SELECT COUNT(*)::int FROM alerts a WHERE a."sensorId" = s.id AND a.status IN ('OPEN','ACKNOWLEDGED')) AS "openAlerts",
        (SELECT COUNT(*)::int FROM alerts a WHERE a."sensorId" = s.id AND a.status IN ('OPEN','ACKNOWLEDGED') AND a.severity = 'CRITICAL') AS "criticalAlerts"
      FROM sensors s
      JOIN tenants t ON t.id = s."tenantId"
      LEFT JOIN sites si ON si.id = s."siteId"
      WHERE s."bayId" IS NOT NULL
      ORDER BY "criticalAlerts" DESC, "openAlerts" DESC, s."lastSeen" ASC NULLS FIRST
      LIMIT 10
    `

    const topSites = await sql/*sql*/`
      SELECT
        si.id,
        si.name,
        si."tenantId",
        t.name AS "tenantName",
        (SELECT COUNT(*)::int FROM sensors s WHERE s."siteId" = si.id AND s."bayId" IS NOT NULL AND (s."lastSeen" IS NULL OR s."lastSeen" <= now() - interval '60 minutes')) AS "offlineSensors",
        (SELECT COUNT(*)::int FROM alerts a WHERE a."siteId" = si.id AND a.status IN ('OPEN','ACKNOWLEDGED') AND a.severity = 'CRITICAL') AS "criticalAlerts"
      FROM sites si
      JOIN tenants t ON t.id = si."tenantId"
      ORDER BY "criticalAlerts" DESC, "offlineSensors" DESC
      LIMIT 10
    `

    return NextResponse.json({
      success: true,
      kpis: {
        tenantsTotal: k?.tenantsTotal || 0,
        tenantsActive: k?.tenantsActive || 0,
        sitesTotal: k?.sitesTotal || 0,
        installedSensors: k?.installedSensors || 0,
        onlineSensors: k?.onlineSensors || 0,
        offlineSensors: k?.offlineSensors || 0,
        openAlerts: k?.openAlerts || 0,
        criticalAlerts: k?.criticalAlerts || 0,
        eventsPerMin5m: typeof k?.eventsPerMin5m === 'number' ? Number(k.eventsPerMin5m.toFixed(1)) : 0,
      },
      sites: (sites || []).map((r: any) => {
        const health = r.criticalAlerts > 0 ? 'CRITICAL' : r.offlineSensors > 0 || r.openAlerts > 0 ? 'WARNING' : 'OK'
        return {
          id: r.id,
          name: r.name,
          address: r.address,
          tenantId: r.tenantId,
          tenantName: r.tenantName,
          centerLat: r.centerLat,
          centerLng: r.centerLng,
          installedSensors: r.installedSensors || 0,
          onlineSensors: r.onlineSensors || 0,
          offlineSensors: r.offlineSensors || 0,
          openAlerts: r.openAlerts || 0,
          criticalAlerts: r.criticalAlerts || 0,
          lastEventTime: r.lastEventTime ? new Date(r.lastEventTime).toISOString() : null,
          health,
        }
      }),
      top: {
        sites: (topSites || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          tenantId: r.tenantId,
          tenantName: r.tenantName,
          offlineSensors: r.offlineSensors || 0,
          criticalAlerts: r.criticalAlerts || 0,
        })),
        sensors: (topSensors || []).map((r: any) => ({
          id: r.id,
          devEui: r.devEui,
          tenantId: r.tenantId,
          tenantName: r.tenantName,
          siteId: r.siteId,
          siteName: r.siteName || null,
          lastSeen: r.lastSeen ? new Date(r.lastSeen).toISOString() : null,
          openAlerts: r.openAlerts || 0,
          criticalAlerts: r.criticalAlerts || 0,
        })),
      },
    })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}



