import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession } from '@/lib/portal/session'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePortalSession(request)
    const { id } = await params

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
    })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


