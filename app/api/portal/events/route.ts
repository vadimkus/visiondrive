import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession } from '@/lib/portal/session'

function toCsv(rows: any[]) {
  const header = ['time', 'devEui', 'kind', 'occupied', 'batteryPct', 'rssi', 'snr']
  const escape = (v: any) => {
    const s = v === null || typeof v === 'undefined' ? '' : String(v)
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const lines = [header.join(',')]
  for (const r of rows) {
    lines.push(
      [
        r.time,
        r.devEui,
        r.kind,
        typeof r.occupied === 'boolean' ? (r.occupied ? 'true' : 'false') : '',
        r.batteryPct ?? '',
        r.rssi ?? '',
        r.snr ?? '',
      ].map(escape).join(',')
    )
  }
  return lines.join('\n')
}

export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)
    const { searchParams } = new URL(request.url)
    const devEui = (searchParams.get('devEui') || '').trim()
    const sensorId = (searchParams.get('sensorId') || '').trim()
    const kind = (searchParams.get('kind') || '').trim()
    const zoneIdParam = (searchParams.get('zoneId') || '').trim()
    const zoneId = zoneIdParam && zoneIdParam !== 'all' ? zoneIdParam : null
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const limit = Math.min(2000, Math.max(50, Number(searchParams.get('limit') || 500)))
    const format = (searchParams.get('format') || 'json').toLowerCase()

    const rows = await sql/*sql*/`
      SELECT
        e.time,
        s."devEui" AS "devEui",
        e.kind,
        (e.decoded->>'occupied')::boolean AS occupied,
        e."batteryPct",
        e.rssi,
        e.snr
      FROM sensor_events e
      JOIN sensors s ON s.id = e."sensorId"
      WHERE e."tenantId" = ${session.tenantId}
        AND (${zoneId}::text IS NULL OR s."zoneId" = ${zoneId})
        AND (${devEui}::text = '' OR s."devEui" ILIKE ${'%' + devEui + '%'})
        AND (${sensorId}::text = '' OR e."sensorId" = ${sensorId})
        AND (${kind}::text = '' OR e.kind::text = ${kind})
        AND (${start}::timestamptz IS NULL OR e.time >= ${start})
        AND (${end}::timestamptz IS NULL OR e.time <= ${end})
      ORDER BY e.time DESC
      LIMIT ${limit}
    `

    const mapped = (rows || []).map((r: any) => ({
      time: new Date(r.time).toISOString(),
      devEui: r.devEui,
      kind: r.kind,
      occupied: r.occupied,
      batteryPct: r.batteryPct,
      rssi: r.rssi,
      snr: r.snr,
    }))

    if (format === 'csv') {
      const csv = toCsv(mapped)
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition': 'attachment; filename="events.csv"',
        },
      })
    }

    return NextResponse.json({ success: true, items: mapped })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


