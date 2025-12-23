import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { assertRole, requirePortalSession } from '@/lib/portal/session'
import { writeAuditLog } from '@/lib/audit'

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

function shiftGeometry(geometry: any, dLng: number, dLat: number): any {
  if (!geometry || typeof geometry !== 'object') return geometry
  const t = geometry.type
  const c = geometry.coordinates
  if (!t || !c) return geometry

  const shiftCoord = (coord: any) => {
    if (!Array.isArray(coord) || coord.length < 2) return coord
    const lng = coord[0]
    const lat = coord[1]
    if (typeof lng !== 'number' || typeof lat !== 'number') return coord
    return [lng + dLng, lat + dLat, ...coord.slice(2)]
  }

  const deepMap = (x: any, depth: number): any => {
    if (depth === 0) return shiftCoord(x)
    if (!Array.isArray(x)) return x
    return x.map((v) => deepMap(v, depth - 1))
  }

  // Point: [lng, lat]
  if (t === 'Point') return { ...geometry, coordinates: shiftCoord(c) }
  // LineString: [[lng,lat], ...]
  if (t === 'LineString') return { ...geometry, coordinates: deepMap(c, 0) }
  // Polygon: [[[lng,lat], ...]]
  if (t === 'Polygon') return { ...geometry, coordinates: deepMap(c, 1) }
  // MultiPolygon: [[[[lng,lat], ...]]]
  if (t === 'MultiPolygon') return { ...geometry, coordinates: deepMap(c, 2) }
  return geometry
}

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

    if (action === 'reset_demo_coords') {
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

      await writeAuditLog({
        request,
        session,
        action: 'SENSOR_LOCATION_BULK_RESET_DEMO',
        entityType: 'Sensor',
        entityId: 'demo',
        before: before?.[0] || null,
        after: after?.[0] || null,
      })

      return NextResponse.json({
        success: true,
        updated: (res || []).length,
        before: before?.[0] || null,
        after: after?.[0] || null,
      })
    }

    if (action === 'bulk_update_locations') {
      const updates = Array.isArray(body?.updates) ? body.updates : []
      if (!updates.length) return NextResponse.json({ success: false, error: 'NO_UPDATES' }, { status: 400 })
      if (updates.length > 500)
        return NextResponse.json({ success: false, error: 'TOO_MANY_UPDATES' }, { status: 400 })

      const moveBays = Boolean(body?.moveBays)
      const deltaLat = typeof body?.deltaLat === 'number' ? body.deltaLat : null
      const deltaLng = typeof body?.deltaLng === 'number' ? body.deltaLng : null

      // Validate and de-dup by id (last write wins)
      const byId = new Map<string, { id: string; lat: number; lng: number }>()
      for (const u of updates) {
        const id = String(u?.id || '')
        const lat = u?.lat
        const lng = u?.lng
        if (!id) continue
        if (typeof lat !== 'number' || typeof lng !== 'number') continue
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) continue
        byId.set(id, { id, lat, lng })
      }
      const clean = Array.from(byId.values())
      if (!clean.length) return NextResponse.json({ success: false, error: 'INVALID_UPDATES' }, { status: 400 })

      let updated = 0
      for (const u of clean) {
        const beforeRows = await sql/*sql*/`
          SELECT id, lat, lng
          FROM sensors
          WHERE "tenantId" = ${session.tenantId} AND id = ${u.id}
          LIMIT 1
        `
        const before = beforeRows?.[0] || null

        const rows = await sql/*sql*/`
          UPDATE sensors
          SET lat = ${u.lat},
              lng = ${u.lng},
              "updatedAt" = now()
          WHERE "tenantId" = ${session.tenantId} AND id = ${u.id}
          RETURNING id
        `
        if (rows?.[0]?.id) {
          updated++
          await writeAuditLog({
            request,
            session,
            action: 'SENSOR_LOCATION_UPDATE',
            entityType: 'Sensor',
            entityId: u.id,
            before,
            after: { id: u.id, lat: u.lat, lng: u.lng },
          })
        }
      }

      // Optional: translate associated bay polygons/coords by the same delta.
      // This is useful when you "move the whole demo lot" during calibration.
      if (moveBays && typeof deltaLat === 'number' && typeof deltaLng === 'number') {
        const sensorIds = clean.map((u) => u.id)
        const rows = await sql/*sql*/`
          SELECT s.id AS "sensorId", s."bayId" AS "bayId", b.lat AS "bayLat", b.lng AS "bayLng", b.geojson AS "bayGeojson"
          FROM sensors s
          JOIN bays b ON b.id = s."bayId"
          WHERE s."tenantId" = ${session.tenantId}
            AND s.id = ANY(${sensorIds})
            AND s."bayId" IS NOT NULL
        `
        const bayById = new Map<string, any>()
        for (const r of rows || []) {
          if (!r?.bayId) continue
          if (!bayById.has(r.bayId)) bayById.set(r.bayId, r)
        }

        const bayIds = Array.from(bayById.keys())
        for (const bayId of bayIds) {
          const r = bayById.get(bayId)
          const before = { id: bayId, lat: r?.bayLat ?? null, lng: r?.bayLng ?? null }
          const nextLat = typeof r?.bayLat === 'number' ? r.bayLat + deltaLat : null
          const nextLng = typeof r?.bayLng === 'number' ? r.bayLng + deltaLng : null
          const gj = normalizeJson(r?.bayGeojson)
          const nextGj =
            gj && gj.geometry ? { ...gj, geometry: shiftGeometry(gj.geometry, deltaLng, deltaLat) } : gj

          await sql/*sql*/`
            UPDATE bays
            SET lat = ${nextLat},
                lng = ${nextLng},
                geojson = ${nextGj ? (sql.json(nextGj) as any) : null},
                "updatedAt" = now()
            WHERE "tenantId" = ${session.tenantId} AND id = ${bayId}
          `
        }

        await writeAuditLog({
          request,
          session,
          action: 'BAY_LOCATION_BULK_TRANSLATE',
          entityType: 'Bay',
          entityId: 'bulk',
          before: { bayCount: bayIds.length, deltaLat, deltaLng },
          after: { bayCount: bayIds.length, deltaLat, deltaLng },
        })
      }

      return NextResponse.json({ success: true, updated })
    }

    return NextResponse.json({ success: false, error: 'INVALID_ACTION' }, { status: 400 })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


