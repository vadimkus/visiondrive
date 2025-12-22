import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession } from '@/lib/portal/session'
import { getAlertThresholds, computeHealthScore, type HealthMetrics } from '@/lib/alerts'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePortalSession(request)
    const { id } = await params
    const thresholds = await getAlertThresholds(session.tenantId)

    const sensorRows = await sql/*sql*/`
      SELECT
        s.*,
        b.code AS "bayCode",
        z.name AS "zoneName",
        si.name AS "siteName"
      FROM sensors s
      LEFT JOIN bays b ON b.id = s."bayId"
      LEFT JOIN zones z ON z.id = s."zoneId"
      LEFT JOIN sites si ON si.id = s."siteId"
      WHERE s."tenantId" = ${session.tenantId} AND s.id = ${id}
      LIMIT 1
    `
    const sensor = sensorRows?.[0] || null
    if (!sensor) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const events = await sql/*sql*/`
      SELECT time, kind, decoded, "rawPayload", rssi, snr, "batteryPct"
      FROM sensor_events
      WHERE "tenantId" = ${session.tenantId} AND "sensorId" = ${id}
      ORDER BY time DESC
      LIMIT 200
    `

    const metricsRows = await sql/*sql*/`
      SELECT
        le.time AS "lastEventTime",
        le.rssi AS "lastRssi",
        le.snr AS "lastSnr",
        ss."avgRssi" AS "avgRssi24h",
        ss."avgSnr" AS "avgSnr24h",
        COALESCE(ss.samples, 0) AS "signalSamples24h",
        bs."minBattery" AS "minBattery7d",
        bs."maxBattery" AS "maxBattery7d",
        bs."minTime" AS "minBatteryTime7d",
        bs."maxTime" AS "maxBatteryTime7d",
        COALESCE(fs.changes, 0) AS "flapChanges"
      FROM (SELECT 1) x
      LEFT JOIN LATERAL (
        SELECT time, rssi, snr
        FROM sensor_events
        WHERE "tenantId" = ${session.tenantId} AND "sensorId" = ${id}
        ORDER BY time DESC
        LIMIT 1
      ) le ON true
      LEFT JOIN LATERAL (
        SELECT
          AVG(rssi)::float AS "avgRssi",
          AVG(snr)::float AS "avgSnr",
          COUNT(*)::int AS samples
        FROM sensor_events
        WHERE "tenantId" = ${session.tenantId}
          AND "sensorId" = ${id}
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
          AND "sensorId" = ${id}
          AND time > now() - interval '7 days'
          AND "batteryPct" IS NOT NULL
      ) bs ON true
      LEFT JOIN LATERAL (
        WITH occ AS (
          SELECT
            time,
            CASE
              WHEN decoded ? 'occupied' THEN (decoded->>'occupied')::boolean
              ELSE NULL
            END AS occ
          FROM sensor_events
          WHERE "tenantId" = ${session.tenantId}
            AND "sensorId" = ${id}
            AND time > now() - (${thresholds.flappingWindowMinutes} || ' minutes')::interval
            AND decoded IS NOT NULL
          ORDER BY time ASC
        )
        SELECT COUNT(*)::int AS changes
        FROM (
          SELECT occ, LAG(occ) OVER (ORDER BY time) AS prev
          FROM occ
          WHERE occ IS NOT NULL
        ) x
        WHERE prev IS NOT NULL AND occ IS DISTINCT FROM prev
      ) fs ON true
      LIMIT 1
    `
    const m = metricsRows?.[0] || {}
    const lastSeen = sensor.lastSeen ? new Date(sensor.lastSeen) : null
    const ageMinutes = lastSeen ? Math.floor((Date.now() - lastSeen.getTime()) / 60000) : null
    const installDate = sensor.installDate ? new Date(sensor.installDate) : null
    const daysInUse = installDate ? Math.floor((Date.now() - installDate.getTime()) / 86400000) : null

    let batteryDrainPerDay7d: number | null = null
    if (typeof m.minBattery7d === 'number' && typeof m.maxBattery7d === 'number' && m.minBatteryTime7d && m.maxBatteryTime7d) {
      const minT = new Date(m.minBatteryTime7d)
      const maxT = new Date(m.maxBatteryTime7d)
      const days = Math.max(1, (maxT.getTime() - minT.getTime()) / 86400000)
      const drop = Math.max(0, Number(m.maxBattery7d) - Number(m.minBattery7d))
      batteryDrainPerDay7d = drop / days
    }

    const healthMetrics: HealthMetrics = {
      daysInUse,
      lastSeen,
      ageMinutes,
      lastRssi: typeof m.lastRssi === 'number' ? m.lastRssi : null,
      lastSnr: typeof m.lastSnr === 'number' ? m.lastSnr : null,
      avgRssi24h: typeof m.avgRssi24h === 'number' ? m.avgRssi24h : null,
      avgSnr24h: typeof m.avgSnr24h === 'number' ? m.avgSnr24h : null,
      signalSamples24h: Number(m.signalSamples24h || 0),
      batteryPct: typeof sensor.batteryPct === 'number' ? sensor.batteryPct : null,
      batteryDrainPerDay7d,
      flapChanges: Number(m.flapChanges || 0),
    }
    const healthScore = computeHealthScore(thresholds, healthMetrics)

    const alerts = await sql/*sql*/`
      SELECT id, type, severity, status, title, message, "openedAt", "lastDetectedAt", "slaDueAt"
      FROM alerts
      WHERE "tenantId" = ${session.tenantId}
        AND "sensorId" = ${id}
        AND status IN ('OPEN','ACKNOWLEDGED')
      ORDER BY
        CASE severity WHEN 'CRITICAL' THEN 0 WHEN 'WARNING' THEN 1 ELSE 2 END,
        "lastDetectedAt" DESC
      LIMIT 50
    `

    const notes = await sql/*sql*/`
      SELECT n.id, n.note, n."createdAt", u.email AS "authorEmail"
      FROM maintenance_notes n
      LEFT JOIN users u ON u.id = n."createdByUserId"
      WHERE n."tenantId" = ${session.tenantId} AND n."sensorId" = ${id}
      ORDER BY n."createdAt" DESC
      LIMIT 50
    `

    return NextResponse.json({
      success: true,
      sensor: {
        id: sensor.id,
        devEui: sensor.devEui,
        type: sensor.type,
        status: sensor.status,
        model: sensor.model,
        firmware: sensor.firmware,
        installDate: sensor.installDate ? new Date(sensor.installDate).toISOString() : null,
        lastSeen: sensor.lastSeen ? new Date(sensor.lastSeen).toISOString() : null,
        batteryPct: sensor.batteryPct ?? null,
        siteName: sensor.siteName || null,
        zoneName: sensor.zoneName || null,
        bayCode: sensor.bayCode || null,
        health: {
          score: healthScore,
          daysInUse,
          ageMinutes,
          batteryDrainPerDay7d,
          lastRssi: healthMetrics.lastRssi,
          lastSnr: healthMetrics.lastSnr,
          avgRssi24h: healthMetrics.avgRssi24h,
          avgSnr24h: healthMetrics.avgSnr24h,
          signalSamples24h: healthMetrics.signalSamples24h,
          flapChanges: healthMetrics.flapChanges,
        },
      },
      events: (events || []).map((e: any) => ({
        time: new Date(e.time).toISOString(),
        kind: e.kind,
        decoded: e.decoded,
        rawPayload: e.rawPayload,
        rssi: e.rssi,
        snr: e.snr,
        batteryPct: e.batteryPct,
      })),
      notes: notes || [],
      alerts: (alerts || []).map((a: any) => ({
        id: a.id,
        type: a.type,
        severity: a.severity,
        status: a.status,
        title: a.title,
        message: a.message,
        openedAt: a.openedAt ? new Date(a.openedAt).toISOString() : null,
        lastDetectedAt: a.lastDetectedAt ? new Date(a.lastDetectedAt).toISOString() : null,
        slaDueAt: a.slaDueAt ? new Date(a.slaDueAt).toISOString() : null,
      })),
    })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


