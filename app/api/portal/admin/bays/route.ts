import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
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

function isPolygonGeojson(gj: any) {
  return gj && typeof gj === 'object' && gj.geometry && gj.geometry.type === 'Polygon' && Array.isArray(gj.geometry.coordinates)
}

function centroidFromPolygonCoords(coords: any): { lat: number; lng: number } | null {
  // coords: [ [ [lng,lat], ... ] ] (outer ring)
  const ring = Array.isArray(coords?.[0]) ? coords[0] : null
  if (!Array.isArray(ring) || ring.length < 4) return null
  let sumLat = 0
  let sumLng = 0
  let n = 0
  for (const pt of ring) {
    if (!Array.isArray(pt) || pt.length < 2) continue
    const lng = pt[0]
    const lat = pt[1]
    if (typeof lng !== 'number' || typeof lat !== 'number') continue
    sumLat += lat
    sumLng += lng
    n++
  }
  if (!n) return null
  return { lat: sumLat / n, lng: sumLng / n }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)
    assertRole(session, ['MASTER_ADMIN', 'CUSTOMER_ADMIN'])

    const { searchParams } = new URL(request.url)
    const zoneIdParam = (searchParams.get('zoneId') || '').trim()
    const zoneId = zoneIdParam && zoneIdParam !== 'all' ? zoneIdParam : null
    const q = (searchParams.get('q') || '').trim()
    const limit = Math.min(2000, Math.max(100, Number(searchParams.get('limit') || 500)))

    const rows = await sql/*sql*/`
      SELECT
        b.id,
        b.code,
        b.lat,
        b.lng,
        b.geojson,
        b."siteId",
        b."zoneId",
        si.name AS "siteName",
        z.name AS "zoneName",
        b."updatedAt"
      FROM bays b
      LEFT JOIN sites si ON si.id = b."siteId"
      LEFT JOIN zones z ON z.id = b."zoneId"
      WHERE b."tenantId" = ${session.tenantId}
        AND (${zoneId}::text IS NULL OR b."zoneId" = ${zoneId})
        AND (${q}::text = '' OR COALESCE(b.code, '') ILIKE ${'%' + q + '%'})
      ORDER BY b.code NULLS LAST, b."updatedAt" DESC
      LIMIT ${limit}
    `

    return NextResponse.json({
      success: true,
      zoneId,
      items: (rows || []).map((r: any) => ({
        id: r.id,
        code: r.code || null,
        lat: typeof r.lat === 'number' ? r.lat : null,
        lng: typeof r.lng === 'number' ? r.lng : null,
        geojson: normalizeJson(r.geojson),
        siteId: r.siteId || null,
        zoneId: r.zoneId || null,
        siteName: r.siteName || null,
        zoneName: r.zoneName || null,
        updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : null,
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
    const action = String(body?.action || '').trim()

    if (action === 'create') {
      const code = String(body?.code || '').trim()
      const siteId = typeof body?.siteId === 'string' ? body.siteId.trim() : null
      const zoneId = typeof body?.zoneId === 'string' ? body.zoneId.trim() : null
      const gj = body?.geojson
      if (!code) return NextResponse.json({ success: false, error: 'code is required' }, { status: 400 })
      if (!siteId) return NextResponse.json({ success: false, error: 'siteId is required' }, { status: 400 })
      if (!isPolygonGeojson(gj)) return NextResponse.json({ success: false, error: 'geojson Polygon is required' }, { status: 400 })

      const c = centroidFromPolygonCoords(gj.geometry.coordinates)
      const id = randomUUID()
      await sql/*sql*/`
        INSERT INTO bays (id, "tenantId", "siteId", "zoneId", code, lat, lng, geojson, "createdAt", "updatedAt")
        VALUES (
          ${id},
          ${session.tenantId},
          ${siteId},
          ${zoneId},
          ${code},
          ${c?.lat ?? null},
          ${c?.lng ?? null},
          ${sql.json(gj) as any},
          now(),
          now()
        )
      `

      await writeAuditLog({
        request,
        session,
        action: 'BAY_CREATE',
        entityType: 'Bay',
        entityId: id,
        before: null,
        after: { id, code, siteId, zoneId },
      })

      return NextResponse.json({ success: true, id })
    }

    if (action === 'update') {
      const id = String(body?.id || '').trim()
      const code = typeof body?.code === 'string' ? body.code.trim() : null
      const zoneId = typeof body?.zoneId === 'string' ? body.zoneId.trim() : null
      const gj = typeof body?.geojson === 'undefined' ? undefined : body.geojson
      if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })

      const beforeRows = await sql/*sql*/`
        SELECT id, code, "zoneId", geojson
        FROM bays
        WHERE "tenantId" = ${session.tenantId} AND id = ${id}
        LIMIT 1
      `
      const before = beforeRows?.[0] || null
      if (!before) return NextResponse.json({ success: false, error: 'NOT_FOUND' }, { status: 404 })

      let lat: number | null = null
      let lng: number | null = null
      if (typeof gj !== 'undefined') {
        if (!isPolygonGeojson(gj)) return NextResponse.json({ success: false, error: 'geojson must be Polygon' }, { status: 400 })
        const c = centroidFromPolygonCoords(gj.geometry.coordinates)
        lat = c?.lat ?? null
        lng = c?.lng ?? null
      }

      await sql/*sql*/`
        UPDATE bays
        SET
          code = COALESCE(${code}, code),
          "zoneId" = COALESCE(${zoneId}, "zoneId"),
          geojson = CASE WHEN ${typeof gj === 'undefined'} THEN geojson ELSE ${sql.json(gj ?? null) as any} END,
          lat = CASE WHEN ${typeof gj === 'undefined'} THEN lat ELSE ${lat} END,
          lng = CASE WHEN ${typeof gj === 'undefined'} THEN lng ELSE ${lng} END,
          "updatedAt" = now()
        WHERE "tenantId" = ${session.tenantId} AND id = ${id}
      `

      await writeAuditLog({
        request,
        session,
        action: 'BAY_UPDATE',
        entityType: 'Bay',
        entityId: id,
        before,
        after: { id, code: code ?? before.code, zoneId: zoneId ?? before.zoneId, geojsonUpdated: typeof gj !== 'undefined' },
      })

      return NextResponse.json({ success: true })
    }

    if (action === 'delete') {
      const id = String(body?.id || '').trim()
      if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })

      const beforeRows = await sql/*sql*/`
        SELECT id, code, "siteId", "zoneId"
        FROM bays
        WHERE "tenantId" = ${session.tenantId} AND id = ${id}
        LIMIT 1
      `
      const before = beforeRows?.[0] || null
      if (!before) return NextResponse.json({ success: false, error: 'NOT_FOUND' }, { status: 404 })

      await sql/*sql*/`
        DELETE FROM bays
        WHERE "tenantId" = ${session.tenantId} AND id = ${id}
      `

      await writeAuditLog({
        request,
        session,
        action: 'BAY_DELETE',
        entityType: 'Bay',
        entityId: id,
        before,
        after: null,
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: 'UNKNOWN_ACTION' }, { status: 400 })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}



