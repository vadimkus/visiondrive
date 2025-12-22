import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { assertRole, requirePortalSession } from '@/lib/portal/session'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { writeAuditLog } from '@/lib/audit'

function randomPassword(len = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  let out = ''
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)
    assertRole(session, ['MASTER_ADMIN', 'CUSTOMER_ADMIN'])

    const rows = await sql/*sql*/`
      SELECT
        u.id,
        u.email,
        u.name,
        u.status,
        tm.role AS "tenantRole",
        tm.status AS "membershipStatus",
        u."createdAt"
      FROM tenant_memberships tm
      JOIN users u ON u.id = tm."userId"
      WHERE tm."tenantId" = ${session.tenantId}
      ORDER BY u."createdAt" DESC
      LIMIT 200
    `

    return NextResponse.json({ success: true, users: rows || [] })
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
    const email = String(body?.email || '').trim().toLowerCase()
    const name = String(body?.name || '').trim() || null
    const role = String(body?.role || 'CUSTOMER_OPS').toUpperCase()
    const password = String(body?.password || '').trim() || randomPassword()

    const allowedRoles = new Set(['CUSTOMER_ADMIN', 'CUSTOMER_OPS', 'CUSTOMER_ANALYST'])
    if (!allowedRoles.has(role)) {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 })
    }
    if (!email) return NextResponse.json({ success: false, error: 'email is required' }, { status: 400 })

    const passwordHash = await bcrypt.hash(password, 10)
    const userId = randomUUID()

    // Upsert user (by email) then ensure membership exists for this tenant
    const userRows = await sql/*sql*/`
      INSERT INTO users (id, email, "passwordHash", name, role, status, "createdAt", "updatedAt")
      VALUES (${userId}, ${email}, ${passwordHash}, ${name as any}, ${role}, 'ACTIVE', now(), now())
      ON CONFLICT (email) DO UPDATE
        SET name = COALESCE(EXCLUDED.name, users.name),
            role = EXCLUDED.role,
            status = 'ACTIVE',
            "passwordHash" = EXCLUDED."passwordHash",
            "updatedAt" = now()
      RETURNING id
    `
    const ensuredUserId = userRows?.[0]?.id

    const membershipId = randomUUID()
    await sql/*sql*/`
      INSERT INTO tenant_memberships (id, "tenantId", "userId", role, status, "createdAt", "updatedAt")
      VALUES (${membershipId}, ${session.tenantId}, ${ensuredUserId}, ${role}, 'ACTIVE', now(), now())
      ON CONFLICT ("tenantId", "userId") DO UPDATE
        SET role = EXCLUDED.role,
            status = EXCLUDED.status,
            "updatedAt" = now()
    `

    // Set defaultTenantId for the user if it is missing
    await sql/*sql*/`
      UPDATE users
      SET "defaultTenantId" = COALESCE(NULLIF("defaultTenantId", ''), ${session.tenantId}),
          "updatedAt" = now()
      WHERE id = ${ensuredUserId}
    `

    await writeAuditLog({
      request,
      session,
      action: 'TENANT_USER_UPSERT',
      entityType: 'TenantMembership',
      entityId: `${session.tenantId}:${ensuredUserId}`,
      before: null,
      after: { tenantId: session.tenantId, userId: ensuredUserId, email, name, role, status: 'ACTIVE' },
    })

    return NextResponse.json({
      success: true,
      user: { id: ensuredUserId, email, name, role },
      // Show generated password only once if caller didn't provide it
      generatedPassword: body?.password ? null : password,
    })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


