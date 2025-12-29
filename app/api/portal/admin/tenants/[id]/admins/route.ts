import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { sql } from '@/lib/sql'
import { requirePortalSession, assertRole } from '@/lib/portal/session'
import { hashPassword } from '@/lib/auth'
import { writeAuditLog } from '@/lib/audit'

function generatePassword() {
  // readable-ish random password
  return `VD-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 6)}`
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePortalSession(request)
    assertRole(session, ['MASTER_ADMIN'])
    const { id: tenantId } = await params

    const body = await request.json().catch(() => ({}))
    const email = String(body?.email || '').trim().toLowerCase()
    const name = typeof body?.name === 'string' ? body.name.trim() : null
    const passwordInput = typeof body?.password === 'string' ? body.password.trim() : ''
    const password = passwordInput || generatePassword()

    if (!email) return NextResponse.json({ success: false, error: 'email is required' }, { status: 400 })

    const tenant = await sql/*sql*/`SELECT id, status FROM tenants WHERE id = ${tenantId} LIMIT 1`
    if (!tenant?.[0]) return NextResponse.json({ success: false, error: 'Tenant not found' }, { status: 404 })
    if (String(tenant?.[0]?.status || '').toUpperCase() !== 'ACTIVE') {
      return NextResponse.json({ success: false, error: 'Tenant is not ACTIVE' }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)
    const userId = randomUUID()

    // Upsert user by email (keeps existing account; sets password if provided)
    const userRows = await sql/*sql*/`
      INSERT INTO users (id, email, "passwordHash", name, role, status, "defaultTenantId", "createdAt", "updatedAt")
      VALUES (${userId}, ${email}, ${passwordHash}, ${name}, 'CUSTOMER_ADMIN', 'ACTIVE', ${tenantId}, now(), now())
      ON CONFLICT (email) DO UPDATE
        SET "passwordHash" = EXCLUDED."passwordHash",
            name = COALESCE(EXCLUDED.name, users.name),
            role = users.role,
            status = 'ACTIVE',
            "defaultTenantId" = COALESCE(users."defaultTenantId", EXCLUDED."defaultTenantId"),
            "updatedAt" = now()
      RETURNING id, email, name
    `
    const ensuredUserId = userRows?.[0]?.id

    const membershipId = randomUUID()
    await sql/*sql*/`
      INSERT INTO tenant_memberships (id, "tenantId", "userId", role, status, "createdAt", "updatedAt")
      VALUES (${membershipId}, ${tenantId}, ${ensuredUserId}, 'CUSTOMER_ADMIN', 'ACTIVE', now(), now())
      ON CONFLICT ("tenantId", "userId") DO UPDATE
        SET role = 'CUSTOMER_ADMIN',
            status = 'ACTIVE',
            "updatedAt" = now()
    `

    await writeAuditLog({
      request,
      session,
      tenantId,
      action: 'TENANT_ADMIN_CREATE',
      entityType: 'TenantMembership',
      entityId: `${tenantId}:${ensuredUserId}`,
      before: null,
      after: { tenantId, userId: ensuredUserId, email, name, role: 'CUSTOMER_ADMIN', status: 'ACTIVE' },
    })

    return NextResponse.json({
      success: true,
      user: { id: ensuredUserId, email: userRows?.[0]?.email, name: userRows?.[0]?.name || null },
      generatedPassword: passwordInput ? null : password,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


