import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { assertRole, requirePortalSession } from '@/lib/portal/session'

export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)
    assertRole(session, ['MASTER_ADMIN', 'CUSTOMER_ADMIN'])

    const rows = await sql/*sql*/`
      SELECT thresholds
      FROM tenant_settings
      WHERE "tenantId" = ${session.tenantId}
      LIMIT 1
    `
    return NextResponse.json({ success: true, thresholds: rows?.[0]?.thresholds || {} })
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
    const thresholds = body?.thresholds || {}

    await sql/*sql*/`
      INSERT INTO tenant_settings ("tenantId", thresholds, "updatedAt")
      VALUES (${session.tenantId}, ${thresholds as any}, now())
      ON CONFLICT ("tenantId") DO UPDATE
        SET thresholds = EXCLUDED.thresholds,
            "updatedAt" = now()
    `

    return NextResponse.json({ success: true })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


