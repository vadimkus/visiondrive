import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { assertRole, requirePortalSession } from '@/lib/portal/session'

export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)
    assertRole(session, ['MASTER_ADMIN', 'CUSTOMER_ADMIN'])

    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    const installedOnly = (searchParams.get('installedOnly') || '1').trim() // default: true for calibration
    const limit = Math.min(1000, Math.max(50, Number(searchParams.get('limit') || 200)))

    const rows = await sql/*sql*/`
      SELECT
        s.id,
        s."devEui",
        s.type,
        s.status,
        s.lat,
        s.lng,
        s."bayId",
        b.code AS "bayCode",
        b.lat AS "bayLat",
        b.lng AS "bayLng",
        z.name AS "zoneName",
        si.name AS "siteName"
      FROM sensors s
      LEFT JOIN bays b ON b.id = s."bayId"
      LEFT JOIN zones z ON z.id = s."zoneId"
      LEFT JOIN sites si ON si.id = s."siteId"
      WHERE s."tenantId" = ${session.tenantId}
        AND (${installedOnly}::text <> '1' OR s."bayId" IS NOT NULL)
        AND (${q}::text = '' OR s."devEui" ILIKE ${'%' + q + '%'} OR COALESCE(b.code, '') ILIKE ${'%' + q + '%'})
      ORDER BY s."updatedAt" DESC, s."devEui" ASC
      LIMIT ${limit}
    `

    return NextResponse.json({
      success: true,
      items: (rows || []).map((r: any) => ({
        id: r.id,
        devEui: r.devEui,
        type: r.type,
        status: r.status,
        lat: typeof r.lat === 'number' ? r.lat : null,
        lng: typeof r.lng === 'number' ? r.lng : null,
        bayLat: typeof r.bayLat === 'number' ? r.bayLat : null,
        bayLng: typeof r.bayLng === 'number' ? r.bayLng : null,
        bayId: r.bayId || null,
        bayCode: r.bayCode || null,
        zoneName: r.zoneName || null,
        siteName: r.siteName || null,
      })),
    })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)
    assertRole(session, ['MASTER_ADMIN', 'CUSTOMER_ADMIN'])

    const body = await request.json().catch(() => ({}))
    const action = String(body?.action || '')

    if (action !== 'reset_demo_coords') {
      return NextResponse.json({ success: false, error: 'INVALID_ACTION' }, { status: 400 })
    }

    // Safety: only touch demo sensors
    const demoPrefix = 'A1B2C3D4%'

    const before = await sql/*sql*/`
      SELECT
        count(*)::int AS total,
        count(DISTINCT concat(COALESCE(s.lat, 0)::text, ',', COALESCE(s.lng, 0)::text))::int AS distinct_coords
      FROM sensors s
      WHERE s."tenantId" = ${session.tenantId}
        AND s."bayId" IS NOT NULL
        AND s."devEui" LIKE ${demoPrefix}
    `

    const res = await sql/*sql*/`
      UPDATE sensors s
      SET lat = b.lat,
          lng = b.lng,
          "updatedAt" = now()
      FROM bays b
      WHERE b.id = s."bayId"
        AND s."tenantId" = ${session.tenantId}
        AND s."bayId" IS NOT NULL
        AND s."devEui" LIKE ${demoPrefix}
      RETURNING s.id
    `

    const after = await sql/*sql*/`
      SELECT
        count(*)::int AS total,
        count(DISTINCT concat(COALESCE(s.lat, 0)::text, ',', COALESCE(s.lng, 0)::text))::int AS distinct_coords
      FROM sensors s
      WHERE s."tenantId" = ${session.tenantId}
        AND s."bayId" IS NOT NULL
        AND s."devEui" LIKE ${demoPrefix}
    `

    return NextResponse.json({
      success: true,
      updated: (res || []).length,
      before: before?.[0] || null,
      after: after?.[0] || null,
    })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


