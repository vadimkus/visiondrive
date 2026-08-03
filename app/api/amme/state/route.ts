import { NextRequest, NextResponse } from 'next/server'
import { getAmmeSession } from '@/lib/amme/session'
import { getVenueState } from '@/lib/amme/service'

export async function GET(request: NextRequest) {
  const session = await getAmmeSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const day = request.nextUrl.searchParams.get('day')
  const state = await getVenueState(session.venueId, day)
  return NextResponse.json({ success: true, ...state, user: session })
}
