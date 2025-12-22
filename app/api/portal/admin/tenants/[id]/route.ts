import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession, assertRole } from '@/lib/portal/session'
import { writeAuditLog } from '@/lib/audit'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePortalSession(request)
    assertRole(session, ['MASTER_ADMIN'])
    const { id } = await params

    const beforeRows = await sql/*sql*/`
      SELECT id, name, slug, status
      FROM tenants
      WHERE id = ${id}
      LIMIT 1
    `
    const before = beforeRows?.[0] || null

    const body = await request.json().catch(() => ({}))
    const name = typeof body?.name === 'string' ? body.name.trim() : null
    const status = typeof body?.status === 'string' ? body.status.trim().toUpperCase() : null

    if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })
    }

    const rows = await sql/*sql*/`
      UPDATE tenants
      SET
        name = COALESCE(${name}, name),
        status = COALESCE(${status as any}, status),
        "updatedAt" = now()
      WHERE id = ${id}
      RETURNING id, name, slug, status, "updatedAt"
    `
    const t = rows?.[0] || null
    if (!t) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    await writeAuditLog({
      request,
      session,
      tenantId: id,
      action: 'TENANT_UPDATE',
      entityType: 'Tenant',
      entityId: id,
      before,
      after: { id: t.id, name: t.name, slug: t.slug, status: t.status },
    })

    return NextResponse.json({
      success: true,
      tenant: { id: t.id, name: t.name, slug: t.slug, status: t.status, updatedAt: new Date(t.updatedAt).toISOString() },
    })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


