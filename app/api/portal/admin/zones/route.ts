import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { sql } from '@/lib/sql'
import { assertRole, requirePortalSession } from '@/lib/portal/session'

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

function normalizeGeojson(input: any) {
  const v = normalizeJson(input)
  if (!v) return null
  // Accept FeatureCollection, Feature, or bare Geometry
  if (v.type === 'FeatureCollection') return v
  if (v.type === 'Feature') return { type: 'FeatureCollection', features: [v] }
  if (typeof v.type === 'string' && v.coordinates) {
    return { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: v, properties: {} }] }
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)
    assertRole(session, ['MASTER_ADMIN', 'CUSTOMER_ADMIN'])

    const rows = await sql/*sql*/`
      SELECT id, name, kind, "siteId", geojson, tariff, "updatedAt"
      FROM zones
      WHERE "tenantId" = ${session.tenantId}
      ORDER BY "updatedAt" DESC, name ASC
      LIMIT 500
    `

    return NextResponse.json({
      success: true,
      zones: (rows || []).map((z: any) => ({
        id: z.id,
        name: z.name,
        kind: z.kind,
        siteId: z.siteId,
        hasGeojson: !!normalizeJson(z.geojson),
        hasTariff: !!normalizeJson(z.tariff),
        updatedAt: z.updatedAt ? new Date(z.updatedAt).toISOString() : null,
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

    const body = await request.json()
    const id = String(body?.id || '').trim() || randomUUID()
    const name = String(body?.name || '').trim()
    const kind = String(body?.kind || '').trim() || 'PAID'
    const geojson = normalizeGeojson(body?.geojson)
    const tariff = normalizeJson(body?.tariff) // optional

    if (!name) return NextResponse.json({ success: false, error: 'NAME_REQUIRED' }, { status: 400 })
    if (!geojson) return NextResponse.json({ success: false, error: 'GEOJSON_REQUIRED' }, { status: 400 })

    // Determine siteId (required by schema). Default to the first site in tenant if not provided.
    let siteId = String(body?.siteId || '').trim()
    if (!siteId) {
      const [s] = await sql/*sql*/`
        SELECT id
        FROM sites
        WHERE "tenantId" = ${session.tenantId}
        ORDER BY "createdAt" ASC
        LIMIT 1
      `
      siteId = s?.id || ''
    }
    if (!siteId) return NextResponse.json({ success: false, error: 'SITE_REQUIRED' }, { status: 400 })

    await sql/*sql*/`
      INSERT INTO zones (id, "tenantId", "siteId", name, kind, geojson, tariff, "createdAt", "updatedAt")
      VALUES (
        ${id},
        ${session.tenantId},
        ${siteId},
        ${name},
        ${kind}::"ZoneKind",
        ${sql.json(geojson) as any},
        ${tariff ? (sql.json(tariff) as any) : null},
        now(),
        now()
      )
      ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name,
            kind = EXCLUDED.kind,
            geojson = EXCLUDED.geojson,
            tariff = EXCLUDED.tariff,
            "updatedAt" = now()
    `

    return NextResponse.json({ success: true, id })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


