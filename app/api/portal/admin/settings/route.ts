import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { assertRole, requirePortalSession } from '@/lib/portal/session'
import { writeAuditLog } from '@/lib/audit'

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
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error'
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

    const beforeRows = await sql/*sql*/`
      SELECT thresholds
      FROM tenant_settings
      WHERE "tenantId" = ${session.tenantId}
      LIMIT 1
    `
    const before = beforeRows?.[0]?.thresholds || {}

    await sql/*sql*/`
      INSERT INTO tenant_settings ("tenantId", thresholds, "updatedAt")
      VALUES (${session.tenantId}, ${sql.json(thresholds) as any}, now())
      ON CONFLICT ("tenantId") DO UPDATE
        SET thresholds = EXCLUDED.thresholds,
            "updatedAt" = now()
    `

    await writeAuditLog({
      request,
      session,
      action: 'TENANT_SETTINGS_UPDATE',
      entityType: 'TenantSetting',
      entityId: session.tenantId,
      before,
      after: thresholds,
    })

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


