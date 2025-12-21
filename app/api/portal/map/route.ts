import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession } from '@/lib/portal/session'

function confidenceFromAgeMinutes(ageMin: number) {
  if (ageMin <= 2) return 0.98
  if (ageMin <= 5) return 0.9
  if (ageMin <= 15) return 0.75
  if (ageMin <= 60) return 0.45
  if (ageMin <= 180) return 0.25
  return 0.1
}

function normalizeJson(value: any) {
  if (value === null || typeof value === 'undefined') return null
  if (typeof value === 'object') return value
  if (typeof value === 'string') {
    const t = value.trim()
    if (!t) return null
    try {
      return JSON.parse(t)
    } catch {
      return null
    }
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)
    const { searchParams } = new URL(request.url)
    const zoneIdParam = (searchParams.get('zoneId') || '').trim()
    const zoneId = zoneIdParam && zoneIdParam !== 'all' ? zoneIdParam : null

    const settingsRows = await sql/*sql*/`
      SELECT thresholds
      FROM tenant_settings
      WHERE "tenantId" = ${session.tenantId}
      LIMIT 1
    `
    const thresholds = settingsRows?.[0]?.thresholds || {}
    const offlineMinutes = Number(thresholds.offlineMinutes || 60)
    const staleEventMinutes = Number(thresholds.staleEventMinutes || 15)

    const metaRows = await sql/*sql*/`
      SELECT
        si.name AS "siteName",
        si.address AS address,
        si."centerLat" AS "centerLat",
        si."centerLng" AS "centerLng",
        z.name AS "zoneName",
        z.geojson AS "zoneGeojson",
        COUNT(*)::int AS "bayCount"
      FROM bays b
      JOIN sites si ON si.id = b."siteId"
      LEFT JOIN zones z ON z.id = b."zoneId"
      WHERE b."tenantId" = ${session.tenantId}
        AND (${zoneId}::text IS NULL OR b."zoneId" = ${zoneId})
      GROUP BY si.name, si.address, si."centerLat", si."centerLng", z.name, z.geojson
      ORDER BY COUNT(*) DESC
      LIMIT 1
    `
    const meta = metaRows?.[0]

    const rows = await sql/*sql*/`
      SELECT
        b.id AS "bayId",
        b.code AS "bayCode",
        b.lat,
        b.lng,
        b.geojson AS "bayGeojson",
        s.id AS "sensorId",
        s."devEui",
        s."lastSeen",
        s."batteryPct",
        e.time AS "eventTime",
        e.decoded AS "decoded"
      FROM bays b
      LEFT JOIN sensors s
        ON s."bayId" = b.id AND s."tenantId" = ${session.tenantId}
      LEFT JOIN LATERAL (
        SELECT time, decoded
        FROM sensor_events
        WHERE "tenantId" = ${session.tenantId} AND "sensorId" = s.id
        ORDER BY time DESC
        LIMIT 1
      ) e ON true
      WHERE b."tenantId" = ${session.tenantId}
        AND (${zoneId}::text IS NULL OR b."zoneId" = ${zoneId})
      ORDER BY b.code NULLS LAST, b.id ASC
      LIMIT 2000
    `

    const items = (rows || []).map((r: any) => {
      // Prefer eventTime for freshness (TIMESTAMPTZ) over sensors.lastSeen (timestamp without tz)
      const eventTime = r.eventTime ? new Date(r.eventTime) : null
      const lastSeen = eventTime || (r.lastSeen ? new Date(r.lastSeen) : null)
      const ageMin = lastSeen ? Math.floor((Date.now() - lastSeen.getTime()) / 60000) : 999999
      let confidence = lastSeen ? confidenceFromAgeMinutes(ageMin) : 0
      if (typeof r.batteryPct === 'number' && r.batteryPct <= 20) confidence = Math.max(0, confidence - 0.2)

      const decoded = normalizeJson(r.decoded)
      const occupied = (decoded as any)?.occupied
      const state =
        !r.sensorId
          ? 'UNKNOWN' // no sensor installed for this bay yet
          : ageMin > offlineMinutes
            ? 'OFFLINE'
            : confidence < 0.35 || ageMin > staleEventMinutes || typeof occupied !== 'boolean'
              ? 'UNKNOWN'
              : occupied
                ? 'OCCUPIED'
                : 'FREE'

      const color = state === 'FREE' ? 'GREEN' : state === 'OCCUPIED' ? 'RED' : 'GRAY'

      return {
        bayId: r.bayId,
        bayCode: r.bayCode,
        lat: r.lat,
        lng: r.lng,
        geojson: normalizeJson(r.bayGeojson),
        sensorId: r.sensorId,
        devEui: r.devEui,
        lastSeen: lastSeen ? lastSeen.toISOString() : null,
        batteryPct: r.batteryPct ?? null,
        confidence: Number(confidence.toFixed(2)),
        ageMinutes: Number.isFinite(ageMin) ? ageMin : null,
        state,
        color,
      }
    })

    return NextResponse.json({
      success: true,
      zoneId,
      meta: meta
        ? {
            siteName: meta.siteName || null,
            zoneName: meta.zoneName || null,
            address: meta.address || null,
            centerLat: typeof meta.centerLat === 'number' ? meta.centerLat : null,
            centerLng: typeof meta.centerLng === 'number' ? meta.centerLng : null,
            zoneGeojson: normalizeJson(meta.zoneGeojson),
            bayCount: meta.bayCount || items.length,
          }
        : { siteName: null, zoneName: null, address: null, centerLat: null, centerLng: null, zoneGeojson: null, bayCount: items.length },
      items,
    })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


