import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession } from '@/lib/portal/session'

// Network overview (tenant-scoped):
// - nodes: sites, gateways, sensors
// - edges: gateway -> sensor (based on last 24h sensor_events.gatewayId)
export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)
    const { searchParams } = new URL(request.url)
    const zoneIdParam = (searchParams.get('zoneId') || '').trim()
    const zoneId = zoneIdParam && zoneIdParam !== 'all' ? zoneIdParam : null

    const sites = await sql/*sql*/`
      SELECT id, name, address, "centerLat", "centerLng"
      FROM sites
      WHERE "tenantId" = ${session.tenantId}
      ORDER BY name ASC
      LIMIT 500
    `

    const gateways = await sql/*sql*/`
      SELECT id, name, serial, status, "siteId", lat, lng, "lastHeartbeat"
      FROM gateways
      WHERE "tenantId" = ${session.tenantId}
      ORDER BY name ASC
      LIMIT 1000
    `

    const sensors = await sql/*sql*/`
      SELECT s.id, s."devEui", s.type, s.status, s."siteId", s."zoneId", s."bayId", s.lat, s.lng, s."lastSeen",
             b.code AS "bayCode"
      FROM sensors s
      LEFT JOIN bays b ON b.id = s."bayId"
      WHERE s."tenantId" = ${session.tenantId}
        AND s."bayId" IS NOT NULL
        AND (${zoneId}::text IS NULL OR s."zoneId" = ${zoneId})
      ORDER BY s."devEui" ASC
      LIMIT 5000
    `

    // Edges based on last 24h traffic
    const edges = await sql/*sql*/`
      WITH lastgw AS (
        SELECT DISTINCT ON (e."sensorId")
          e."sensorId",
          e."gatewayId",
          e.time
        FROM sensor_events e
        JOIN sensors s ON s.id = e."sensorId"
        WHERE e."tenantId" = ${session.tenantId}
          AND e."gatewayId" IS NOT NULL
          AND e.time > now() - interval '24 hours'
          AND s."bayId" IS NOT NULL
          AND (${zoneId}::text IS NULL OR s."zoneId" = ${zoneId})
        ORDER BY e."sensorId", e.time DESC
      )
      SELECT "gatewayId", "sensorId", time
      FROM lastgw
    `

    const nodes = [
      ...(sites || []).map((s: any) => ({
        id: `site:${s.id}`,
        kind: 'site',
        refId: s.id,
        name: s.name,
        address: s.address || null,
        lat: typeof s.centerLat === 'number' ? s.centerLat : null,
        lng: typeof s.centerLng === 'number' ? s.centerLng : null,
      })),
      ...(gateways || []).map((g: any) => ({
        id: `gw:${g.id}`,
        kind: 'gateway',
        refId: g.id,
        name: g.name,
        serial: g.serial || null,
        siteId: g.siteId || null,
        status: g.status,
        lastHeartbeat: g.lastHeartbeat ? new Date(g.lastHeartbeat).toISOString() : null,
        lat: typeof g.lat === 'number' ? g.lat : null,
        lng: typeof g.lng === 'number' ? g.lng : null,
      })),
      ...(sensors || []).map((s: any) => ({
        id: `sensor:${s.id}`,
        kind: 'sensor',
        refId: s.id,
        devEui: s.devEui,
        type: s.type,
        status: s.status,
        siteId: s.siteId || null,
        zoneId: s.zoneId || null,
        bayCode: s.bayCode || null,
        lastSeen: s.lastSeen ? new Date(s.lastSeen).toISOString() : null,
        lat: typeof s.lat === 'number' ? s.lat : null,
        lng: typeof s.lng === 'number' ? s.lng : null,
      })),
    ]

    const links = (edges || []).map((e: any) => ({
      from: `gw:${e.gatewayId}`,
      to: `sensor:${e.sensorId}`,
      lastSeen: e.time ? new Date(e.time).toISOString() : null,
    }))

    return NextResponse.json({
      success: true,
      meta: { zoneId },
      nodes,
      links,
    })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


