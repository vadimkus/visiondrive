import { NextRequest, NextResponse } from 'next/server'
import { getAmmeSession } from '@/lib/amme/session'
import { getReport, type ReportRange } from '@/lib/amme/service'

export async function GET(request: NextRequest) {
  const session = await getAmmeSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const day = request.nextUrl.searchParams.get('day')
  const range = (request.nextUrl.searchParams.get('range') || '7d') as ReportRange
  const from = request.nextUrl.searchParams.get('from')
  const to = request.nextUrl.searchParams.get('to')
  const report = await getReport(session.venueId, day, range, from, to)
  return NextResponse.json({ success: true, report })
}
