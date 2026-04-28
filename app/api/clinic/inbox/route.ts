import { NextRequest, NextResponse } from 'next/server'
import { buildNotificationCenter } from '@/lib/clinic/notification-center'
import { buildClinicNotificationItems } from '@/lib/clinic/notification-items'
import { getClinicSession } from '@/lib/clinic/session'

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const items = await buildClinicNotificationItems(session.tenantId)
  return NextResponse.json(buildNotificationCenter(items))
}
