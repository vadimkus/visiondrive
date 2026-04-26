import { NextRequest, NextResponse } from 'next/server'
import { getClinicSession } from '@/lib/clinic/session'

/** Public VAPID key for Web Push subscription (safe to expose). */
export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const publicKey =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || null

  return NextResponse.json({
    publicKey,
    configured: Boolean(
      publicKey && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT
    ),
  })
}
