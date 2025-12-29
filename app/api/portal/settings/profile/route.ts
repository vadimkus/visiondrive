import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession } from '@/lib/portal/session'
import { writeAuditLog } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)

    const rows = await sql/*sql*/`
      SELECT id, email, name, role, status, "defaultTenantId"
      FROM users
      WHERE id = ${session.userId}
      LIMIT 1
    `
    const u = rows?.[0] || null
    if (!u) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    return NextResponse.json({
      success: true,
      user: {
        id: u.id,
        email: u.email,
        name: u.name,
        role: session.role, // effective role (tenant-aware)
        status: u.status,
        tenantId: session.tenantId,
        defaultTenantId: u.defaultTenantId || null,
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)

    const body = await request.json().catch(() => ({}))
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    if (!name) return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 })
    if (name.length > 120) return NextResponse.json({ success: false, error: 'Name too long' }, { status: 400 })

    const beforeRows = await sql/*sql*/`SELECT id, name FROM users WHERE id = ${session.userId} LIMIT 1`
    const before = beforeRows?.[0] || null

    await sql/*sql*/`
      UPDATE users
      SET name = ${name},
          "updatedAt" = now()
      WHERE id = ${session.userId}
    `

    await writeAuditLog({
      request,
      session,
      action: 'PROFILE_UPDATE',
      entityType: 'User',
      entityId: session.userId,
      before,
      after: { id: session.userId, name },
    })

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}



