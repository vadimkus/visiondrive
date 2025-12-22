import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession } from '@/lib/portal/session'
import { hashPassword, verifyPassword } from '@/lib/auth'
import { writeAuditLog } from '@/lib/audit'

function validatePasswordStrength(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' }
  }
  if (password.length > 200) {
    return { valid: false, error: 'Password must be less than 200 characters' }
  }
  // Check for at least one number
  if (!/\d/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' }
  }
  // Check for at least one letter
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one letter' }
  }
  return { valid: true }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)

    const body = await request.json().catch(() => ({}))
    const currentPassword = String(body?.currentPassword || '').trim()
    const newPassword = String(body?.newPassword || '').trim()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: 'Current password and new password are required' }, { status: 400 })
    }

    // Validate password strength
    const strengthCheck = validatePasswordStrength(newPassword)
    if (!strengthCheck.valid) {
      return NextResponse.json({ success: false, error: strengthCheck.error }, { status: 400 })
    }

    // Prevent reusing the same password
    if (currentPassword === newPassword) {
      return NextResponse.json({ success: false, error: 'New password must be different from current password' }, { status: 400 })
    }

    const rows = await sql/*sql*/`
      SELECT id, "passwordHash"
      FROM users
      WHERE id = ${session.userId}
      LIMIT 1
    `
    const u = rows?.[0] || null
    if (!u) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

    // Verify current password
    const ok = await verifyPassword(currentPassword, u.passwordHash)
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 })
    }

    // Check if new password is the same as current (already hashed)
    const isSamePassword = await verifyPassword(newPassword, u.passwordHash)
    if (isSamePassword) {
      return NextResponse.json({ success: false, error: 'New password must be different from current password' }, { status: 400 })
    }

    // Hash and update password
    const nextHash = await hashPassword(newPassword)
    await sql/*sql*/`
      UPDATE users
      SET "passwordHash" = ${nextHash},
          "updatedAt" = now()
      WHERE id = ${session.userId}
    `

    // Log password change in audit log
    await writeAuditLog({
      request,
      session,
      action: 'PASSWORD_CHANGE',
      entityType: 'User',
      entityId: session.userId,
      before: null,
      after: { id: session.userId },
    })

    return NextResponse.json({ success: true, message: 'Password changed successfully' })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


