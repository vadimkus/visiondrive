import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession } from '@/lib/portal/session'
import { computeHealthScore, getAlertThresholds, type HealthMetrics } from '@/lib/alerts'

function computeBatteryDrainPerDay7d(row: any): number | null {
  if (
    typeof row?.minBattery7d !== 'number' ||
    typeof row?.maxBattery7d !== 'number' ||
    !row?.minBatteryTime7d ||
    !row?.maxBatteryTime7d
  )
    return null
  const minT = new Date(row.minBatteryTime7d)
  const maxT = new Date(row.maxBatteryTime7d)
  const days = Math.max(1, (maxT.getTime() - minT.getTime()) / 86400000)
  const drop = Math.max(0, Number(row.maxBattery7d) - Number(row.minBattery7d))
  return drop / days
}

export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    const zoneIdParam = (searchParams.get('zoneId') || '').trim()
    const zoneId = zoneIdParam && zoneIdParam !== 'all' ? zoneIdParam : null
    const limit = Math.min(500, Math.max(20, Number(searchParams.get('limit') || 200)))

    const thresholds = await getAlertThresholds(session.tenantId)

    const rows = await sql/*sql*/`
      SELECT
        s.id,
        s."devEui",
        s.type,
        s.status,
        s."lastSeen",
        s."batteryPct",
        s."installDate",
        s."bayId",
        b.code AS "bayCode",
        e.time AS "eventTime",
        e.rssi AS "lastRssi",
        e.snr AS "lastSnr",
        ss."avgRssi" AS "avgRssi24h",
        ss."avgSnr" AS "avgSnr24h",
        COALESCE(ss.samples, 0) AS "signalSamples24h",
        bs."minBattery" AS "minBattery7d",
        bs."maxBattery" AS "maxBattery7d",
        bs."minTime" AS "minBatteryTime7d",
        bs."maxTime" AS "maxBatteryTime7d"
      FROM sensors s
      LEFT JOIN bays b ON b.id = s."bayId"
      LEFT JOIN LATERAL (
        SELECT time, rssi, snr
        FROM sensor_events
        WHERE "tenantId" = ${session.tenantId} AND "sensorId" = s.id
        ORDER BY time DESC
        LIMIT 1
      ) e ON true
      LEFT JOIN LATERAL (
        SELECT
          AVG(rssi)::float AS "avgRssi",
          AVG(snr)::float AS "avgSnr",
          COUNT(*)::int AS samples
        FROM sensor_events
        WHERE "tenantId" = ${session.tenantId}
          AND "sensorId" = s.id
          AND time > now() - (${thresholds.signalLookbackHours} || ' hours')::interval
          AND (rssi IS NOT NULL OR snr IS NOT NULL)
      ) ss ON true
      LEFT JOIN LATERAL (
        SELECT
          MIN("batteryPct")::float AS "minBattery",
          MAX("batteryPct")::float AS "maxBattery",
          MIN(time) AS "minTime",
          MAX(time) AS "maxTime"
        FROM sensor_events
        WHERE "tenantId" = ${session.tenantId}
          AND "sensorId" = s.id
          AND time > now() - interval '7 days'
          AND "batteryPct" IS NOT NULL
      ) bs ON true
      WHERE s."tenantId" = ${session.tenantId}
        AND (${zoneId}::text IS NULL OR s."zoneId" = ${zoneId})
        AND (${q}::text = '' OR s."devEui" ILIKE ${'%' + q + '%'})
      ORDER BY s."lastSeen" DESC NULLS LAST, s."devEui" ASC
      LIMIT ${limit}
    `

    const items = (rows || []).map((r: any) => {
      const lastSeen = r.lastSeen ? new Date(r.lastSeen) : null
      const ageMin = lastSeen ? Math.floor((Date.now() - lastSeen.getTime()) / 60000) : null
      const batteryPct = typeof r.batteryPct === 'number' ? r.batteryPct : null
      const installDate = r.installDate ? new Date(r.installDate) : null
      const daysInUse = installDate ? Math.floor((Date.now() - installDate.getTime()) / 86400000) : null
      const batteryDrainPerDay7d = computeBatteryDrainPerDay7d(r)
      const metrics: HealthMetrics = {
        daysInUse,
        lastSeen,
        ageMinutes: ageMin,
        lastRssi: typeof r.lastRssi === 'number' ? r.lastRssi : null,
        lastSnr: typeof r.lastSnr === 'number' ? r.lastSnr : null,
        avgRssi24h: typeof r.avgRssi24h === 'number' ? r.avgRssi24h : null,
        avgSnr24h: typeof r.avgSnr24h === 'number' ? r.avgSnr24h : null,
        signalSamples24h: Number(r.signalSamples24h || 0),
        batteryPct,
        batteryDrainPerDay7d,
        flapChanges: 0,
      }
      return {
        id: r.id,
        devEui: r.devEui,
        type: r.type,
        status: r.status,
        bayId: r.bayId,
        bayCode: r.bayCode,
        lastSeen: lastSeen ? lastSeen.toISOString() : null,
        batteryPct,
        daysInUse,
        avgRssi24h: metrics.avgRssi24h,
        avgSnr24h: metrics.avgSnr24h,
        batteryDrainPerDay7d,
        healthScore: computeHealthScore(thresholds, metrics),
      }
    })

    return NextResponse.json({ success: true, items })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


