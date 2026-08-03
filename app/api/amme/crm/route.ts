import { NextRequest, NextResponse } from 'next/server'
import { getAmmeSession } from '@/lib/amme/session'
import { assertAmmePermission, hasAmmePermission } from '@/lib/amme/rbac'
import {
  createGuestManual,
  getGuestDetail,
  listGuests,
  serializeGuest,
  updateGuest,
  type CrmSegment,
} from '@/lib/amme/crm'

export async function GET(request: NextRequest) {
  const session = await getAmmeSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasAmmePermission(session, 'crm:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const guestId = searchParams.get('id')
  if (guestId) {
    try {
      const detail = await getGuestDetail(session.venueId, guestId)
      return NextResponse.json({
        success: true,
        guest: serializeGuest(detail.guest),
        history: detail.history,
        bookings: detail.bookings,
      })
    } catch (e) {
      return NextResponse.json(
        { success: false, error: e instanceof Error ? e.message : 'Ошибка' },
        { status: 404 }
      )
    }
  }

  const q = searchParams.get('q') || ''
  const segment = (searchParams.get('segment') || 'all') as CrmSegment
  const data = await listGuests(session.venueId, { q, segment })
  return NextResponse.json({
    success: true,
    guests: data.guests.map(serializeGuest),
    total: data.total,
    summary: data.summary,
    segment: data.segment,
    q: data.q,
  })
}

export async function POST(request: NextRequest) {
  const session = await getAmmeSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    assertAmmePermission(session, 'crm:write')
    const body = await request.json()
    const type = body.type as string

    if (type === 'create') {
      const guest = await createGuestManual(
        session.venueId,
        {
          name: body.name || '',
          phone: body.phone,
          notes: body.notes,
          vip: !!body.vip,
          tags: body.tags,
          source: body.source || 'manual',
        },
        session.userId
      )
      return NextResponse.json({ success: true, guest: serializeGuest(guest) })
    }

    if (type === 'update') {
      if (!body.guestId) throw new Error('guestId обязателен')
      if (
        session.staffRole !== 'OWNER' &&
        (body.vip !== undefined || body.blocked !== undefined)
      ) {
        return NextResponse.json(
          { success: false, error: 'VIP и блокировка доступны только владельцу' },
          { status: 403 }
        )
      }
      const guest = await updateGuest(
        session.venueId,
        body.guestId,
        {
          name: body.name,
          phone: body.phone,
          email: body.email,
          notes: body.notes,
          tags: body.tags,
          preferences: body.preferences,
          dietary: body.dietary,
          birthday: body.birthday,
          source: body.source,
          language: body.language,
          banyaPref: body.banyaPref,
          blocked: body.blocked,
          vip: body.vip,
        },
        session.userId
      )
      return NextResponse.json({ success: true, guest: serializeGuest(guest) })
    }

    return NextResponse.json({ error: `Unknown CRM action: ${type}` }, { status: 400 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ошибка'
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}
