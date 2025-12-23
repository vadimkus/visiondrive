import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession } from '@/lib/portal/session'

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

    const zoneRows = await sql/*sql*/`
      SELECT
        z.id,
        z.name,
        z.kind,
        z.geojson,
        z.tariff,
        s.name AS "siteName",
        COUNT(b.id)::int AS "bayCount"
      FROM zones z
      LEFT JOIN sites s ON s.id = z."siteId"
      LEFT JOIN bays b ON b."zoneId" = z.id
      WHERE z."tenantId" = ${session.tenantId}
        AND z.geojson IS NOT NULL
      GROUP BY z.id, z.name, z.kind, z.geojson, z.tariff, s.name
      ORDER BY z.name ASC
      LIMIT 500
    `

    const zones = (zoneRows || []).map((z: any) => ({
      id: z.id,
      name: z.name || 'Unnamed Zone',
      kind: z.kind || 'PAID',
      siteName: z.siteName || null,
      bayCount: z.bayCount || 0,
      geojson: normalizeJson(z.geojson),
      tariff: normalizeJson(z.tariff),
    }))

    return NextResponse.json({
      success: true,
      zones,
    })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}
