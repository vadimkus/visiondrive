import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession } from '@/lib/portal/session'

function minutesAgo(d: Date) {
  return Math.floor((Date.now() - d.getTime()) / 60000)
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
    const lowBatteryPct = Number(thresholds.lowBatteryPct || 20)
    const staleEventMinutes = Number(thresholds.staleEventMinutes || 15)

    const [counts] = await sql/*sql*/`
      WITH latest AS (
        SELECT s.id AS "sensorId", MAX(e.time) AS "lastEventTime"
        FROM sensors s
        LEFT JOIN sensor_events e
          ON e."tenantId" = ${session.tenantId} AND e."sensorId" = s.id
        WHERE s."tenantId" = ${session.tenantId}
          AND (${zoneId}::text IS NULL OR s."zoneId" = ${zoneId})
          AND s."bayId" IS NOT NULL
        GROUP BY s.id
      )
      SELECT
        (SELECT COUNT(*)::int FROM bays WHERE "tenantId" = ${session.tenantId} AND (${zoneId}::text IS NULL OR "zoneId" = ${zoneId})) AS "totalBays",
        (SELECT COUNT(*)::int FROM sensors WHERE "tenantId" = ${session.tenantId} AND (${zoneId}::text IS NULL OR "zoneId" = ${zoneId}) AND "bayId" IS NOT NULL) AS "totalSensors",
        (SELECT COUNT(*)::int FROM latest WHERE "lastEventTime" IS NOT NULL AND "lastEventTime" > now() - (${offlineMinutes} || ' minutes')::interval) AS "onlineSensors",
        (SELECT COUNT(*)::int FROM latest WHERE "lastEventTime" IS NULL OR "lastEventTime" <= now() - (${offlineMinutes} || ' minutes')::interval) AS "offlineSensors",
        (SELECT COUNT(*)::int FROM sensors WHERE "tenantId" = ${session.tenantId} AND (${zoneId}::text IS NULL OR "zoneId" = ${zoneId}) AND "bayId" IS NOT NULL AND "batteryPct" IS NOT NULL AND "batteryPct" <= ${lowBatteryPct}) AS "lowBatterySensors",
        (SELECT COUNT(*)::int FROM ingest_dead_letters WHERE "tenantId" = ${session.tenantId} AND "createdAt" > now() - interval '24 hours') AS "deadLetters24h",
        (SELECT COUNT(*)::int FROM alerts a
          LEFT JOIN sensors s ON s.id = a."sensorId"
          WHERE a."tenantId" = ${session.tenantId}
            AND a.status IN ('OPEN','ACKNOWLEDGED')
            AND (${zoneId}::text IS NULL OR COALESCE(a."zoneId", s."zoneId") = ${zoneId})
        ) AS "openAlerts",
        (SELECT COUNT(*)::int FROM alerts a
          LEFT JOIN sensors s ON s.id = a."sensorId"
          WHERE a."tenantId" = ${session.tenantId}
            AND a.status IN ('OPEN','ACKNOWLEDGED')
            AND a.severity = 'CRITICAL'
            AND (${zoneId}::text IS NULL OR COALESCE(a."zoneId", s."zoneId") = ${zoneId})
        ) AS "criticalAlerts"
    `

    // Bay-level truth: classify every bay so counts always correlate to total bays.
    const bayRows = await sql/*sql*/`
      SELECT
        b.id AS "bayId",
        s.id AS "sensorId",
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
    `

    let occupied = 0
    let free = 0
    let offlineBays = 0
    let unknown = 0

    for (const r of bayRows || []) {
      if (!r.sensorId) {
        unknown++
        continue
      }
      const eventTime = r.eventTime ? new Date(r.eventTime) : null
      const ageMin = eventTime ? minutesAgo(eventTime) : 10_000
      if (!eventTime || ageMin > offlineMinutes) {
        offlineBays++
        continue
      }
      if (ageMin > staleEventMinutes) {
        unknown++
        continue
      }
      const decoded = normalizeJson(r.decoded)
      const occ = (decoded as any)?.occupied
      if (typeof occ === 'boolean') {
        if (occ) occupied++
        else free++
      } else {
        unknown++
      }
    }

    // Trend: events per hour last 24h
    const trendRows = await sql/*sql*/`
      SELECT time_bucket('1 hour', time) AS bucket, COUNT(*)::int AS count
      FROM sensor_events e
      JOIN sensors s ON s.id = e."sensorId"
      WHERE e."tenantId" = ${session.tenantId}
        AND (${zoneId}::text IS NULL OR s."zoneId" = ${zoneId})
        AND e.time > now() - interval '24 hours'
      GROUP BY bucket
      ORDER BY bucket ASC
    `

    return NextResponse.json({
      success: true,
      zoneId,
      thresholds: { offlineMinutes, lowBatteryPct, staleEventMinutes },
      kpis: {
        totalBays: counts?.totalBays || 0,
        totalSensors: counts?.totalSensors || 0,
        onlineSensors: counts?.onlineSensors || 0,
        offlineSensors: counts?.offlineSensors || 0,
        lowBatterySensors: counts?.lowBatterySensors || 0,
        deadLetters24h: counts?.deadLetters24h || 0,
        openAlerts: counts?.openAlerts || 0,
        criticalAlerts: counts?.criticalAlerts || 0,
        occupiedBays: occupied,
        freeBays: free,
        offlineBays,
        unknownBays: unknown,
      },
      trend: (trendRows || []).map((t: any) => ({
        bucket: new Date(t.bucket).toISOString(),
        count: t.count,
      })),
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


