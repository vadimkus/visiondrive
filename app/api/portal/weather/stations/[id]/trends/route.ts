import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession } from '@/lib/portal/session'

function rangeToSpec(range: string) {
  const r = (range || '').toLowerCase()
  if (r === '1h') return { window: "interval '1 hour'", bucket: "interval '2 minutes'" }
  if (r === '24h') return { window: "interval '24 hours'", bucket: "interval '20 minutes'" }
  if (r === '7d') return { window: "interval '7 days'", bucket: "interval '2 hours'" }
  return { window: "interval '24 hours'", bucket: "interval '20 minutes'" }
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePortalSession(request)
    const { id } = await ctx.params
    const { searchParams } = new URL(request.url)
    const range = (searchParams.get('range') || '24h').trim()

    const spec = rangeToSpec(range)

    // Downsample using Timescale time_bucket if available (it is, given hypertable usage).
    // Pull common weather metrics from decoded JSON.
    const rows = await sql.unsafe(
      `
      SELECT
        time_bucket(${spec.bucket}, time) AS t,
        AVG(NULLIF((decoded->>'temperatureC')::double precision, NULL)) AS "temperatureC",
        AVG(NULLIF((decoded->>'humidityPct')::double precision, NULL)) AS "humidityPct",
        AVG(NULLIF((decoded->>'windMps')::double precision, NULL)) AS "windMps",
        AVG(NULLIF((decoded->>'gustMps')::double precision, NULL)) AS "gustMps",
        AVG(NULLIF((decoded->>'pm25')::double precision, NULL)) AS "pm25",
        AVG(NULLIF((decoded->>'pm10')::double precision, NULL)) AS "pm10",
        AVG(NULLIF((decoded->>'aqi')::double precision, NULL)) AS "aqi"
      FROM sensor_events
      WHERE "tenantId" = $1
        AND "sensorId" = $2
        AND time >= now() - ${spec.window}
        AND decoded IS NOT NULL
      GROUP BY 1
      ORDER BY 1 ASC
      LIMIT 2000
      `,
      [session.tenantId, id]
    )

    const points = (rows || []).map((r: any) => ({
      t: r.t ? new Date(r.t).toISOString() : null,
      temperatureC: typeof r.temperatureC === 'number' ? Number(r.temperatureC.toFixed(2)) : null,
      humidityPct: typeof r.humidityPct === 'number' ? Number(r.humidityPct.toFixed(2)) : null,
      windMps: typeof r.windMps === 'number' ? Number(r.windMps.toFixed(2)) : null,
      gustMps: typeof r.gustMps === 'number' ? Number(r.gustMps.toFixed(2)) : null,
      pm25: typeof r.pm25 === 'number' ? Number(r.pm25.toFixed(2)) : null,
      pm10: typeof r.pm10 === 'number' ? Number(r.pm10.toFixed(2)) : null,
      aqi: typeof r.aqi === 'number' ? Number(r.aqi.toFixed(0)) : null,
    }))

    return NextResponse.json({ success: true, range, points })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}



