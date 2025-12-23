import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession } from '@/lib/portal/session'

function rangeToInterval(range: string) {
  const r = (range || '').toLowerCase()
  if (r === '1h') return "interval '1 hour'"
  if (r === '24h') return "interval '24 hours'"
  if (r === '7d') return "interval '7 days'"
  return "interval '24 hours'"
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePortalSession(request)
    const { id } = await ctx.params
    const { searchParams } = new URL(request.url)
    const range = (searchParams.get('range') || '24h').trim()
    const interval = rangeToInterval(range)

    const rows = await sql.unsafe(
      `
      SELECT
        time,
        decoded->>'temperatureC' AS "temperatureC",
        decoded->>'humidityPct' AS "humidityPct",
        decoded->>'windMps' AS "windMps",
        decoded->>'gustMps' AS "gustMps",
        decoded->>'pm25' AS "pm25",
        decoded->>'pm10' AS "pm10",
        decoded->>'aqi' AS "aqi",
        decoded->>'rain' AS rain
      FROM sensor_events
      WHERE "tenantId" = $1
        AND "sensorId" = $2
        AND time >= now() - ${interval}
      ORDER BY time ASC
      LIMIT 20000
      `,
      [session.tenantId, id]
    )

    const header = ['time', 'temperatureC', 'humidityPct', 'windMps', 'gustMps', 'pm25', 'pm10', 'aqi', 'rain']
    const csv =
      header.join(',') +
      '\n' +
      (rows || [])
        .map((r: any) =>
          [
            r.time ? new Date(r.time).toISOString() : '',
            r.temperatureC ?? '',
            r.humidityPct ?? '',
            r.windMps ?? '',
            r.gustMps ?? '',
            r.pm25 ?? '',
            r.pm10 ?? '',
            r.aqi ?? '',
            r.rain ?? '',
          ]
            .map((v) => {
              const s = String(v ?? '')
              if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replaceAll('"', '""')}"`
              return s
            })
            .join(',')
        )
        .join('\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="weather-${id}-${range}.csv"`,
      },
    })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


