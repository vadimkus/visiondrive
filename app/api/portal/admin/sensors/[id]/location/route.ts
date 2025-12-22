import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { assertRole, requirePortalSession } from '@/lib/portal/session'
import { writeAuditLog } from '@/lib/audit'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePortalSession(request)
    assertRole(session, ['MASTER_ADMIN', 'CUSTOMER_ADMIN'])

    const { id } = await params
    const body = await request.json()
    const lat = body?.lat
    const lng = body?.lng

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ success: false, error: 'LAT_LNG_REQUIRED' }, { status: 400 })
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ success: false, error: 'LAT_LNG_INVALID' }, { status: 400 })
    }

    const beforeRows = await sql/*sql*/`
      SELECT id, lat, lng
      FROM sensors
      WHERE "tenantId" = ${session.tenantId} AND id = ${id}
      LIMIT 1
    `
    const before = beforeRows?.[0] || null

    const rows = await sql/*sql*/`
      UPDATE sensors
      SET lat = ${lat},
          lng = ${lng},
          "updatedAt" = now()
      WHERE "tenantId" = ${session.tenantId} AND id = ${id}
      RETURNING id
    `
    if (!rows?.[0]?.id) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    await writeAuditLog({
      request,
      session,
      action: 'SENSOR_LOCATION_UPDATE',
      entityType: 'Sensor',
      entityId: id,
      before,
      after: { id, lat, lng },
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


