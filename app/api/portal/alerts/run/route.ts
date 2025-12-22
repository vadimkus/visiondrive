import { NextRequest, NextResponse } from 'next/server'
import { requirePortalSession, assertRole } from '@/lib/portal/session'
import { runAlertScan } from '@/lib/alerts'

export async function POST(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)
    // Only admins can run global scans
    assertRole(session, ['MASTER_ADMIN', 'ADMIN', 'CUSTOMER_ADMIN'])

    const body = await request.json().catch(() => ({}))
    const zoneIdParam = String(body?.zoneId || '').trim()
    const zoneId = zoneIdParam && zoneIdParam !== 'all' ? zoneIdParam : null

    const result = await runAlertScan({ tenantId: session.tenantId, zoneId, actorUserId: session.userId })
    return NextResponse.json({ success: true, result })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


