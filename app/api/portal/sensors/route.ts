import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession } from '@/lib/portal/session'

function healthScore({ ageMin, batteryPct }: { ageMin: number | null; batteryPct: number | null }) {
  let score = 100
  if (ageMin === null) score -= 60
  else if (ageMin > 180) score -= 60
  else if (ageMin > 60) score -= 35
  else if (ageMin > 15) score -= 20

  if (batteryPct !== null) {
    if (batteryPct <= 10) score -= 30
    else if (batteryPct <= 20) score -= 15
  }
  return Math.max(0, Math.min(100, score))
}

export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    const zoneIdParam = (searchParams.get('zoneId') || '').trim()
    const zoneId = zoneIdParam && zoneIdParam !== 'all' ? zoneIdParam : null
    const limit = Math.min(500, Math.max(20, Number(searchParams.get('limit') || 200)))

    const rows = await sql/*sql*/`
      SELECT
        s.id,
        s."devEui",
        s.type,
        s.status,
        s."lastSeen",
        s."batteryPct",
        s."bayId",
        b.code AS "bayCode",
        e.time AS "eventTime"
      FROM sensors s
      LEFT JOIN bays b ON b.id = s."bayId"
      LEFT JOIN LATERAL (
        SELECT time
        FROM sensor_events
        WHERE "tenantId" = ${session.tenantId} AND "sensorId" = s.id
        ORDER BY time DESC
        LIMIT 1
      ) e ON true
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
      return {
        id: r.id,
        devEui: r.devEui,
        type: r.type,
        status: r.status,
        bayId: r.bayId,
        bayCode: r.bayCode,
        lastSeen: lastSeen ? lastSeen.toISOString() : null,
        batteryPct,
        healthScore: healthScore({ ageMin, batteryPct }),
      }
    })

    return NextResponse.json({ success: true, items })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


