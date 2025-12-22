import { NextRequest, NextResponse } from 'next/server'
import { requirePortalSession, assertRole } from '@/lib/portal/session'
import { generateToken } from '@/lib/auth'
import { sql } from '@/lib/sql'
import { writeAuditLog } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)
    assertRole(session, ['MASTER_ADMIN'])

    const body = await request.json().catch(() => ({}))
    const tenantId = String(body?.tenantId || '').trim()
    if (!tenantId) return NextResponse.json({ success: false, error: 'tenantId is required' }, { status: 400 })

    const t = await sql/*sql*/`SELECT id, status FROM tenants WHERE id = ${tenantId} LIMIT 1`
    if (!t?.[0]) return NextResponse.json({ success: false, error: 'Tenant not found' }, { status: 404 })
    if (String(t?.[0]?.status || '').toUpperCase() !== 'ACTIVE') {
      return NextResponse.json({ success: false, error: 'Tenant is not ACTIVE' }, { status: 400 })
    }

    // Keep role MASTER_ADMIN, swap tenant context.
    const token = generateToken(session.userId, session.email, 'MASTER_ADMIN', tenantId)
    const res = NextResponse.json({ success: true, tenantId })
    res.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    await writeAuditLog({
      request,
      session,
      tenantId,
      action: 'MASTER_TENANT_SWITCH',
      entityType: 'Tenant',
      entityId: tenantId,
      before: { previousTenantId: session.tenantId },
      after: { tenantId },
    })

    return res
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


