import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession } from '@/lib/portal/session'

export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)

    const rows = await sql/*sql*/`
      SELECT
        z.id,
        z.name,
        z.kind,
        si.name AS "siteName",
        si.address AS address,
        COUNT(b.id)::int AS "bayCount"
      FROM zones z
      JOIN sites si ON si.id = z."siteId"
      LEFT JOIN bays b ON b."zoneId" = z.id
      WHERE z."tenantId" = ${session.tenantId}
      GROUP BY z.id, z.name, z.kind, si.name, si.address
      ORDER BY "bayCount" DESC, z.name ASC
    `

    return NextResponse.json({
      success: true,
      zones: [
        { id: 'all', name: 'All Zones', kind: null, siteName: null, address: null, bayCount: (rows || []).reduce((s: number, r: any) => s + (r.bayCount || 0), 0) },
        ...(rows || []),
      ],
    })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


