import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession } from '@/lib/portal/session'

function parseDate(input: string | null): Date | null {
  if (!input) return null
  const d = new Date(input)
  return Number.isNaN(d.getTime()) ? null : d
}

function csvEscape(v: any) {
  const s = String(v ?? '')
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)
    const { searchParams } = new URL(request.url)
    const zoneIdParam = (searchParams.get('zoneId') || '').trim()
    const zoneId = zoneIdParam && zoneIdParam !== 'all' ? zoneIdParam : null
    const format = (searchParams.get('format') || '').trim().toLowerCase()

    const end = parseDate(searchParams.get('end')) || new Date()
    const start = parseDate(searchParams.get('start')) || new Date(end.getTime() - 7 * 24 * 3600 * 1000)
    const spanMs = end.getTime() - start.getTime()
    const prevStart = new Date(start.getTime() - spanMs)
    const prevEnd = new Date(end.getTime() - spanMs)

    const limit = Math.min(200, Math.max(20, Number(searchParams.get('limit') || 50)))

    // Rankings with period comparisons (current vs previous range)
    const rows = await sql/*sql*/`
      WITH base AS (
        SELECT s.id, s."devEui", s.type, s.status, s."bayId", b.code AS "bayCode"
        FROM sensors s
        LEFT JOIN bays b ON b.id = s."bayId"
        WHERE s."tenantId" = ${session.tenantId}
          AND s."bayId" IS NOT NULL
          AND (${zoneId}::text IS NULL OR s."zoneId" = ${zoneId})
      ),
      cur AS (
        SELECT
          e."sensorId" AS id,
          COUNT(*)::int AS "events",
          AVG(e.rssi)::float AS "avgRssi",
          AVG(e.snr)::float AS "avgSnr",
          MIN(e."batteryPct")::float AS "minBattery",
          MAX(e."batteryPct")::float AS "maxBattery",
          MAX(e.time) AS "lastEventTime",
          COUNT(*) FILTER (WHERE e.decoded ? 'occupied')::int AS "occSamples",
          AVG(CASE WHEN e.decoded ? 'occupied' THEN (e.decoded->>'occupied')::boolean::int ELSE NULL END)::float AS "occRate"
        FROM sensor_events e
        WHERE e."tenantId" = ${session.tenantId}
          AND e.time >= ${start}
          AND e.time <= ${end}
        GROUP BY e."sensorId"
      ),
      prev AS (
        SELECT
          e."sensorId" AS id,
          COUNT(*)::int AS "eventsPrev",
          AVG(e.rssi)::float AS "avgRssiPrev",
          AVG(e.snr)::float AS "avgSnrPrev",
          MIN(e."batteryPct")::float AS "minBatteryPrev",
          MAX(e."batteryPct")::float AS "maxBatteryPrev",
          COUNT(*) FILTER (WHERE e.decoded ? 'occupied')::int AS "occSamplesPrev",
          AVG(CASE WHEN e.decoded ? 'occupied' THEN (e.decoded->>'occupied')::boolean::int ELSE NULL END)::float AS "occRatePrev"
        FROM sensor_events e
        WHERE e."tenantId" = ${session.tenantId}
          AND e.time >= ${prevStart}
          AND e.time <= ${prevEnd}
        GROUP BY e."sensorId"
      ),
      flap AS (
        WITH occ AS (
          SELECT
            e."sensorId" AS id,
            e.time,
            CASE WHEN e.decoded ? 'occupied' THEN (e.decoded->>'occupied')::boolean ELSE NULL END AS occ
          FROM sensor_events e
          WHERE e."tenantId" = ${session.tenantId}
            AND e.time >= ${start}
            AND e.time <= ${end}
            AND e.decoded IS NOT NULL
        )
        SELECT id, COUNT(*)::int AS "changes"
        FROM (
          SELECT id, occ, LAG(occ) OVER (PARTITION BY id ORDER BY time) AS prev
          FROM occ
          WHERE occ IS NOT NULL
        ) x
        WHERE prev IS NOT NULL AND occ IS DISTINCT FROM prev
        GROUP BY id
      ),
      a AS (
        SELECT
          "sensorId" AS id,
          COUNT(*)::int AS "openAlerts",
          COUNT(*) FILTER (WHERE severity = 'CRITICAL')::int AS "criticalAlerts"
        FROM alerts
        WHERE "tenantId" = ${session.tenantId}
          AND status IN ('OPEN','ACKNOWLEDGED')
          AND "sensorId" IS NOT NULL
        GROUP BY "sensorId"
      )
      SELECT
        b.id,
        b."devEui",
        b.type,
        b.status,
        b."bayCode",
        COALESCE(cur.events, 0) AS events,
        cur."lastEventTime",
        cur."avgRssi",
        cur."avgSnr",
        cur."minBattery",
        cur."maxBattery",
        COALESCE(cur."occSamples",0) AS "occSamples",
        cur."occRate",
        COALESCE(prev."eventsPrev", 0) AS "eventsPrev",
        prev."avgRssiPrev",
        prev."avgSnrPrev",
        prev."minBatteryPrev",
        prev."maxBatteryPrev",
        prev."occRatePrev",
        COALESCE(flap.changes, 0) AS "flapChanges",
        COALESCE(a."openAlerts", 0) AS "openAlerts",
        COALESCE(a."criticalAlerts", 0) AS "criticalAlerts"
      FROM base b
      LEFT JOIN cur ON cur.id = b.id
      LEFT JOIN prev ON prev.id = b.id
      LEFT JOIN flap ON flap.id = b.id
      LEFT JOIN a ON a.id = b.id
      ORDER BY
        COALESCE(a."criticalAlerts",0) DESC,
        COALESCE(a."openAlerts",0) DESC,
        COALESCE(flap.changes,0) DESC,
        COALESCE(cur.events,0) DESC,
        b."devEui" ASC
      LIMIT ${limit}
    `

    const items = (rows || []).map((r: any) => {
      const batteryDrop = typeof r.maxBattery === 'number' && typeof r.minBattery === 'number' ? Math.max(0, r.maxBattery - r.minBattery) : null
      const batteryDropPrev =
        typeof r.maxBatteryPrev === 'number' && typeof r.minBatteryPrev === 'number' ? Math.max(0, r.maxBatteryPrev - r.minBatteryPrev) : null
      return {
        id: r.id,
        devEui: r.devEui,
        type: r.type,
        status: r.status,
        bayCode: r.bayCode || null,
        current: {
          events: r.events || 0,
          lastEventTime: r.lastEventTime ? new Date(r.lastEventTime).toISOString() : null,
          avgRssi: typeof r.avgRssi === 'number' ? r.avgRssi : null,
          avgSnr: typeof r.avgSnr === 'number' ? r.avgSnr : null,
          occupancyRate: typeof r.occRate === 'number' ? r.occRate : null,
          batteryDropPct: batteryDrop,
          flapChanges: r.flapChanges || 0,
        },
        previous: {
          events: r.eventsPrev || 0,
          avgRssi: typeof r.avgRssiPrev === 'number' ? r.avgRssiPrev : null,
          avgSnr: typeof r.avgSnrPrev === 'number' ? r.avgSnrPrev : null,
          occupancyRate: typeof r.occRatePrev === 'number' ? r.occRatePrev : null,
          batteryDropPct: batteryDropPrev,
        },
        alerts: { open: r.openAlerts || 0, critical: r.criticalAlerts || 0 },
      }
    })

    if (format === 'csv') {
      const headers = [
        'devEui',
        'bayCode',
        'status',
        'events',
        'eventsPrev',
        'avgRssi',
        'avgSnr',
        'occRate',
        'occRatePrev',
        'batteryDropPct',
        'batteryDropPctPrev',
        'flapChanges',
        'openAlerts',
        'criticalAlerts',
        'lastEventTime',
      ]
      const lines = [
        headers.join(','),
        ...items.map((i: any) =>
          [
            i.devEui,
            i.bayCode || '',
            i.status,
            i.current.events,
            i.previous.events,
            i.current.avgRssi ?? '',
            i.current.avgSnr ?? '',
            i.current.occupancyRate ?? '',
            i.previous.occupancyRate ?? '',
            i.current.batteryDropPct ?? '',
            i.previous.batteryDropPct ?? '',
            i.current.flapChanges ?? 0,
            i.alerts.open,
            i.alerts.critical,
            i.current.lastEventTime || '',
          ].map(csvEscape).join(',')
        ),
      ].join('\n')
      return new NextResponse(lines, {
        headers: {
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition': `attachment; filename="sensor-performance.csv"`,
        },
      })
    }

    return NextResponse.json({
      success: true,
      range: { start: start.toISOString(), end: end.toISOString(), prevStart: prevStart.toISOString(), prevEnd: prevEnd.toISOString() },
      items,
    })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}



