import { NextRequest, NextResponse } from 'next/server'
import { getAmmeSession } from '@/lib/amme/session'
import * as svc from '@/lib/amme/service'

type Body = {
  type: string
  bookingId?: string
  visitId?: string
  tabId?: string
  lineId?: string
  lineIds?: string[]
  menuCode?: string
  delta?: number
  name?: string
  guests?: number
  banya?: boolean
  text?: string
  mode?: 'append' | 'replace'
  day?: string
  targetTabId?: string
  newTabForVisitId?: string
  time?: string
  phone?: string
  price?: number
  active?: boolean
}

export async function POST(request: NextRequest) {
  const session = await getAmmeSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as Body
    const v = session.venueId
    const a = session.userId

    switch (body.type) {
      case 'arrive':
        await svc.arriveBooking(v, body.bookingId!, a)
        break
      case 'noshow':
        await svc.markNoshow(v, body.bookingId!, a)
        break
      case 'unmark':
        await svc.unmarkNoshow(v, body.bookingId!, a)
        break
      case 'toggle_banya':
        await svc.toggleBookingBanya(v, body.bookingId!)
        break
      case 'walkin':
        await svc.walkIn(v, { name: body.name || '', guests: body.guests || 1, banya: !!body.banya }, a)
        break
      case 'add_dish':
        await svc.addMenuLine(v, body.tabId!, body.menuCode!, a)
        break
      case 'bump':
        await svc.bumpLineQty(v, body.lineId!, body.delta || 0, a)
        break
      case 'send':
        await svc.sendDraftLines(v, body.tabId!, a)
        break
      case 'done':
        await svc.markLineDone(v, body.lineId!, a)
        break
      case 'move':
        await svc.moveLines(
          v,
          body.lineIds || [],
          { tabId: body.targetTabId, newTabForVisitId: body.newTabForVisitId },
          a
        )
        break
      case 'pay':
        await svc.payTab(v, body.tabId!, a)
        break
      case 'close':
        await svc.closeTab(v, body.tabId!, a)
        break
      case 'end_banya':
        await svc.endBanya(v, body.visitId!, a)
        break
      case 'import':
        await svc.importBookings(v, body.text || '', body.mode || 'append', body.day, a)
        break
      case 'booking_create':
        await svc.createManualBooking(
          v,
          {
            day: body.day,
            time: body.time || '12:00',
            name: body.name || '',
            guests: body.guests || 1,
            banya: !!body.banya,
            phone: body.phone,
          },
          a
        )
        break
      case 'menu_update':
        await svc.updateMenuItem(
          v,
          body.menuCode!,
          { price: body.price, active: body.active, name: body.name },
          a
        )
        break
      default:
        return NextResponse.json({ error: `Unknown action: ${body.type}` }, { status: 400 })
    }

    const state = await svc.getVenueState(v, body.day)
    return NextResponse.json({ success: true, ...state })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ошибка'
    console.error('AMMÉ action error:', error)
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}
