import { NextRequest, NextResponse } from 'next/server'
import { getAmmeSession } from '@/lib/amme/session'

export async function GET(request: NextRequest) {
  const session = await getAmmeSession(request)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({
    success: true,
    user: {
      id: session.userId,
      email: session.email,
      name: session.name,
      staffRole: session.staffRole,
      venueId: session.venueId,
    },
  })
}
